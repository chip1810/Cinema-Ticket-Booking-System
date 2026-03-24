const jwt = require("jsonwebtoken");
const { PayOS } = require("@payos/node");

const { PaymentTransaction, PaymentStatus } = require("../models/PaymentTransaction");
const SeatService = require("../../seat/services/SeatService");
const { Order, OrderStatus } = require("../../order/models/Order");

const seatService = new SeatService();

class PaymentService {
    constructor() {
        this._validateEnv();

        this.payOS = new PayOS({
            clientId: process.env.PAYOS_CLIENT_ID,
            apiKey: process.env.PAYOS_API_KEY,
            checksumKey: process.env.PAYOS_CHECKSUM_KEY,
        });
    }

    _validateEnv() {
        const required = [
            "PAYOS_CLIENT_ID",
            "PAYOS_API_KEY",
            "PAYOS_CHECKSUM_KEY",
            "PAYOS_RETURN_URL",
            "PAYOS_CANCEL_URL",
            "CHECKOUT_TOKEN_SECRET",
        ];

        for (const key of required) {
            if (!process.env[key]) {
                throw new Error(`Missing env: ${key}`);
            }
        }
    }

    _parseCheckoutToken(checkoutToken) {
        let payload;
        try {
            payload = jwt.verify(checkoutToken, process.env.CHECKOUT_TOKEN_SECRET);
        } catch {
            throw new Error("checkoutToken is invalid or expired");
        }
        return payload;
    }

    async _generateUniqueOrderCode() {
        // 10 digits, hạn chế collision và vẫn là Number an toàn
        for (let i = 0; i < 10; i++) {
            const candidate = Number(`${String(Date.now()).slice(-8)}${Math.floor(Math.random() * 90 + 10)}`);
            const exists = await PaymentTransaction.exists({ orderCode: candidate });
            if (!exists) return candidate;
        }
        throw new Error("Cannot generate unique orderCode");
    }

    async createPayOSPaymentLink(checkoutToken, userId) {
        const payload = this._parseCheckoutToken(checkoutToken);

        if (String(payload.userId) !== String(userId)) {
            throw new Error("checkoutToken does not belong to current user");
        }

        const amount = Math.round(Number(payload.totalAmount || payload.finalAmount || 0));
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Invalid amount from checkoutToken");
        }

        // 1️⃣ Kiểm tra nếu user bấm lại thanh toán, tái dùng payment link đang PENDING
        const existingPending = await PaymentTransaction.findOne({
            checkoutToken,
            user: userId,
            status: PaymentStatus.PENDING,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (existingPending?.checkoutUrl) {
            return {
                orderCode: existingPending.orderCode,
                checkoutUrl: existingPending.checkoutUrl,
                paymentLinkId: existingPending.paymentLinkId,
                amount: existingPending.amount,
                expiredAt: existingPending.expiresAt,
                reused: true,
                orderUUID: existingPending.orderUUID,
            };
        }

        // 2️⃣ Tạo orderCode duy nhất
        const orderCode = await this._generateUniqueOrderCode();

        // 3️⃣ Tạo Order trước khi tạo payment link
        const orderPayload = {
            user: userId,
            showtimeUUID: payload.showtimeUUID,
            seats: payload.seatUUIDs || [],
            snacks: payload.snacks || [],
            totalAmount: amount,
            status: OrderStatus.PENDING, // trạng thái mới
            createdAt: new Date(),
        };

        const orderDoc = await Order.create(orderPayload);

        // 4️⃣ Tạo URL trả về / hủy
        const returnUrl = new URL(process.env.PAYOS_RETURN_URL);
        const cancelUrl = new URL(process.env.PAYOS_CANCEL_URL);
        returnUrl.searchParams.set("orderCode", String(orderCode));
        cancelUrl.searchParams.set("orderCode", String(orderCode));

        const expiresAt = new Date(payload.expiresAt || Date.now() + 5 * 60 * 1000);

        // 5️⃣ Chuẩn bị payload cho PayOS
        const paymentData = {
            orderCode,
            amount,
            description: `Cinema ${String(payload.showtimeUUID || "").slice(-6) || "Booking"}`.slice(0, 25),
            items: [
                {
                    name: "Cinema booking",
                    quantity: 1,
                    price: amount,
                },
            ],
            returnUrl: returnUrl.toString(),
            cancelUrl: cancelUrl.toString(),
        };

        // 6️⃣ Gọi PayOS tạo payment link
        const payosResp = await this.payOS.paymentRequests.create(paymentData);

        // 7️⃣ Tạo PaymentTransaction và liên kết với Order
        await PaymentTransaction.create({
            user: userId,
            checkoutToken,
            orderCode,
            paymentLinkId: payosResp.paymentLinkId || null,
            checkoutUrl: payosResp.checkoutUrl || null,
            amount,
            status: PaymentStatus.PENDING,
            expiresAt,
            orderUUID: orderDoc.UUID, // link tới Order
        });

        console.log("[PAYMENT] create-link orderCode:", orderCode, "user:", userId, "orderUUID:", orderDoc.UUID);

        return {
            orderCode,
            amount,
            checkoutUrl: payosResp.checkoutUrl,
            paymentLinkId: payosResp.paymentLinkId,
            expiredAt: expiresAt,
            reused: false,
            orderUUID: orderDoc.UUID,
        };
    }

    async handlePayOSWebhook(webhookBody) {
        console.log("🔥🔥 WEBHOOK HIT 🔥🔥");
        console.log("👉 BODY:", JSON.stringify(webhookBody, null, 2));

        // 1️⃣ Verify signature từ PayOS
        let verified;
        try {
            verified =
                process.env.PAYOS_ALLOW_MOCK_WEBHOOK === "true" && webhookBody?.__mock === true
                    ? webhookBody
                    : this.payOS.webhooks.verify(webhookBody);
            console.log("[WEBHOOK] Signature verified successfully");
        } catch (err) {
            console.error("[WEBHOOK] Signature verification failed:", err.message);
            return { ignored: true, reason: "Invalid signature" };
        }

        // 2️⃣ Chuẩn hóa data từ webhook
        const data = verified?.data || webhookBody?.data || {};
        const orderCode = Number(data.orderCode);

        if (!Number.isFinite(orderCode)) {
            console.warn("⚠️ Webhook không có orderCode (test call)", data);
            return { ignored: true, reason: "Missing orderCode" };
        }

        console.log("[WEBHOOK] Processing orderCode:", orderCode);

        // 3️⃣ Tìm PaymentTransaction tương ứng
        const tx = await PaymentTransaction.findOne({ orderCode });
        if (!tx) {
            console.warn("[WEBHOOK] Transaction not found for orderCode:", orderCode);
            return { ignored: true, reason: "Transaction not found", orderCode };
        }

        // 4️⃣ Idempotent: tránh xử lý lại
        if (tx.status === PaymentStatus.PAID) {
            console.log("[WEBHOOK] Transaction already PAID, ignoring");
            return { ignored: true, reason: "Already paid", orderCode, orderUUID: tx.orderUUID };
        }
        if ([PaymentStatus.CANCELLED, PaymentStatus.FAILED].includes(tx.status)) {
            console.log(`[WEBHOOK] Transaction already finalized as ${tx.status}, ignoring`);
            return { ignored: true, reason: `Already finalized as ${tx.status}`, orderCode, status: tx.status };
        }

        // 5️⃣ Validate amount chống giả mạo/chênh lệch
        if (Number(data.amount) !== Number(tx.amount)) {
            tx.status = PaymentStatus.FAILED;
            tx.failReason = "Amount mismatch";
            tx.rawWebhook = webhookBody;
            await tx.save();
            console.warn("[WEBHOOK] Amount mismatch", { orderCode, expected: tx.amount, actual: data.amount });
            return { updated: true, orderCode, status: tx.status, reason: tx.failReason };
        }

        // 6️⃣ Kiểm tra thanh toán thành công
        // ✅ Fix boolean/string issue + debug log
        const successFlag = webhookBody.success;
        const paid = (successFlag === true || successFlag === "true" || successFlag === 1 || successFlag === "1")
            && String(data.code) === "00";
        console.log("[WEBHOOK] paid check:", { successFlag, dataCode: data.code, paid });

        if (!paid) {
            // Không thành công / cancel
            tx.status = PaymentStatus.CANCELLED;
            tx.failReason = data.desc || verified.desc || "Payment cancelled/failed";
            tx.rawWebhook = webhookBody;
            await tx.save();

            await seatService.releaseHeldSeatsByCheckoutToken(tx.checkoutToken, String(tx.user));

            // Update Order tương ứng
            if (tx.orderUUID) {
                await Order.updateOne({ UUID: tx.orderUUID }, { $set: { status: OrderStatus.CANCELLED } });
            }

            console.log("[WEBHOOK] Payment failed/cancelled for orderCode:", orderCode, "reason:", tx.failReason);
            return { updated: true, orderCode, status: tx.status, reason: tx.failReason };
        }

        // 7️⃣ Thanh toán thành công -> confirm booking
        try {
            console.log("[WEBHOOK] Payment marked as PAID, confirming booking...");

            const bookingResult = await seatService.confirmBooking(tx.checkoutToken, String(tx.user));

            // Update Order thành PAID
            if (tx.orderUUID) {
                await Order.updateOne({ UUID: bookingResult.orderUUID }, { $set: { status: OrderStatus.PAID } });
            }

            tx.status = PaymentStatus.PAID;
            tx.orderUUID = bookingResult.orderUUID;
            tx.paidAt = new Date();
            tx.rawWebhook = webhookBody;
            tx.failReason = null;
            await tx.save();

            console.log("[WEBHOOK] Payment success for orderCode:", orderCode, "orderUUID:", tx.orderUUID);
            return { updated: true, orderCode, status: tx.status, orderUUID: tx.orderUUID };
        } catch (e) {
            // Thanh toán thành công nhưng confirm booking thất bại
            tx.status = PaymentStatus.FAILED;
            tx.failReason = `CONFIRM_FAILED: ${e.message || "Unknown error"}`;
            tx.rawWebhook = webhookBody;
            await tx.save();

            if (tx.orderUUID) {
                await Order.updateOne({ UUID: tx.orderUUID }, { $set: { status: OrderStatus.FAILED } });
            }

            console.error("[WEBHOOK] Payment confirmed but booking failed for orderCode:", orderCode, e);
            return { updated: true, orderCode, status: tx.status, reason: tx.failReason };
        }
    }

    async getPaymentStatus(orderCode, userId) {
        const tx = await PaymentTransaction.findOne({ orderCode: Number(orderCode), user: userId });
        if (!tx) throw new Error("Payment transaction not found");

        return {
            orderCode: tx.orderCode,
            status: tx.status,
            amount: tx.amount,
            orderUUID: tx.orderUUID,
            paidAt: tx.paidAt,
            failReason: tx.failReason,
            checkoutUrl: tx.checkoutUrl,
            createdAt: tx.createdAt,
        };
    }

    async expirePendingTransactions() {
        const now = new Date();

        const expiredTxs = await PaymentTransaction.find({
            status: PaymentStatus.PENDING,
            expiresAt: { $lte: now },
        }).select("_id user checkoutToken orderUUID orderCode");

        let cancelledCount = 0;

        for (const tx of expiredTxs) {
            // 1) nhả ghế hold
            try {
                await seatService.releaseHeldSeatsByCheckoutToken(
                    tx.checkoutToken,
                    String(tx.user)
                );
            } catch (e) {
                console.warn(
                    `[payment-cleanup] release seats failed for orderCode=${tx.orderCode}:`,
                    e.message
                );
            }

            // 2) cancel payment tx (idempotent)
            const updated = await PaymentTransaction.updateOne(
                { _id: tx._id, status: PaymentStatus.PENDING },
                {
                    $set: {
                        status: PaymentStatus.CANCELLED,
                        failReason: "EXPIRED",
                    },
                }
            );

            if (updated.modifiedCount > 0) {
                cancelledCount++;

                // 3) cancel order liên quan (nếu có)
                if (tx.orderUUID) {
                    await Order.updateOne(
                        { UUID: tx.orderUUID, status: { $ne: OrderStatus.PAID } },
                        { $set: { status: OrderStatus.CANCELLED } }
                    );
                }
            }
        }

        return cancelledCount;
    }

    async cancelByUser(orderCode, userId, reason = "USER_CANCELLED") {
        const tx = await PaymentTransaction.findOne({
            orderCode: Number(orderCode),
            user: userId,
        });

        if (!tx) throw new Error("Payment transaction not found");

        if (tx.status === PaymentStatus.PAID) {
            throw new Error("Cannot cancel a paid transaction");
        }

        if (tx.status === PaymentStatus.PENDING) {
            tx.status = PaymentStatus.CANCELLED;
            tx.failReason = reason;
            await tx.save();
        }

        await seatService.releaseHeldSeatsByCheckoutToken(tx.checkoutToken, String(userId));

        return {
            orderCode: tx.orderCode,
            status: tx.status,
            reason: tx.failReason,
        };
    }


    async mockSuccessRedirect(orderCode) {
        const tx = await PaymentTransaction.findOne({ orderCode: Number(orderCode) });
        if (!tx) throw new Error("Payment transaction not found");

        // Nếu đã paid thì chỉ redirect lại result page
        if (tx.status === PaymentStatus.PAID) {
            const base = process.env.FE_PAYMENT_RESULT_URL || process.env.PAYOS_RETURN_URL;
            const url = new URL(base);
            url.searchParams.set("orderCode", String(tx.orderCode));
            url.searchParams.set("mock", "1");
            return { redirectUrl: url.toString(), status: tx.status };
        }

        // Chỉ cho mock success khi đang pending
        if (tx.status !== PaymentStatus.PENDING) {
            throw new Error(`Cannot mock success from status ${tx.status}`);
        }

        const bookingResult = await seatService.confirmBooking(tx.checkoutToken, String(tx.user));

        await Order.updateOne(
            { UUID: bookingResult.orderUUID },
            { $set: { status: OrderStatus.PAID } }
        );

        tx.status = PaymentStatus.PAID;
        tx.orderUUID = bookingResult.orderUUID;
        tx.paidAt = new Date();
        tx.failReason = null;
        tx.rawWebhook = { __mock: true, orderCode: tx.orderCode };
        await tx.save();

        const base = process.env.FE_PAYMENT_RESULT_URL || process.env.PAYOS_RETURN_URL;
        const url = new URL(base);
        url.searchParams.set("orderCode", String(tx.orderCode));
        url.searchParams.set("mock", "1");

        return { redirectUrl: url.toString(), status: tx.status, orderUUID: tx.orderUUID };
    }
}

module.exports = PaymentService;