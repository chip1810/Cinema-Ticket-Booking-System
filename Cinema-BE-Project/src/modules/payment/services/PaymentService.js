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

    // Nếu user bấm lại thanh toán, tái dùng payment link đang PENDING
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
      };
    }

    const orderCode = await this._generateUniqueOrderCode();

    const returnUrl = new URL(process.env.PAYOS_RETURN_URL);
    const cancelUrl = new URL(process.env.PAYOS_CANCEL_URL);
    returnUrl.searchParams.set("orderCode", String(orderCode));
    cancelUrl.searchParams.set("orderCode", String(orderCode));

    const expiresAt = new Date(payload.expiresAt || Date.now() + 5 * 60 * 1000);

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

    const payosResp = await this.payOS.paymentRequests.create(paymentData);

    await PaymentTransaction.create({
      user: userId,
      checkoutToken,
      orderCode,
      paymentLinkId: payosResp.paymentLinkId || null,
      checkoutUrl: payosResp.checkoutUrl || null,
      amount,
      status: PaymentStatus.PENDING,
      expiresAt,
    });

    return {
      orderCode,
      amount,
      checkoutUrl: payosResp.checkoutUrl,
      paymentLinkId: payosResp.paymentLinkId,
      expiredAt: expiresAt,
      reused: false,
    };
  }

  async handlePayOSWebhook(webhookBody) {
    // verify signature
    const verified = this.payOS.webhooks.verify(webhookBody);

    const envelope = verified?.data ? verified : { success: true, data: verified };
    const data = envelope.data || {};

    const orderCode = Number(data.orderCode);
    if (!Number.isFinite(orderCode)) {
      throw new Error("Invalid webhook orderCode");
    }

    const tx = await PaymentTransaction.findOne({ orderCode });
    if (!tx) {
      // không có transaction tương ứng -> vẫn trả 2xx để tránh retry vô hạn
      return { ignored: true, reason: "Transaction not found", orderCode };
    }

    if (tx.status === PaymentStatus.PAID) {
      return { ignored: true, reason: "Already paid", orderCode, orderUUID: tx.orderUUID };
    }

    if (Number(data.amount) !== Number(tx.amount)) {
      tx.status = PaymentStatus.FAILED;
      tx.failReason = "Amount mismatch";
      tx.rawWebhook = webhookBody;
      await tx.save();
      throw new Error("Amount mismatch");
    }

    const paid = envelope.success === true && String(data.code) === "00";

    if (!paid) {
      tx.status = PaymentStatus.CANCELLED;
      tx.failReason = data.desc || envelope.desc || "Payment cancelled/failed";
      tx.rawWebhook = webhookBody;
      await tx.save();

      return {
        updated: true,
        orderCode,
        status: tx.status,
        reason: tx.failReason,
      };
    }

    // Thanh toán thành công -> xác nhận booking
    const bookingResult = await seatService.confirmBooking(tx.checkoutToken, String(tx.user));

    await Order.updateOne(
      { UUID: bookingResult.orderUUID },
      { $set: { status: OrderStatus.PAID } }
    );

    tx.status = PaymentStatus.PAID;
    tx.orderUUID = bookingResult.orderUUID;
    tx.paidAt = new Date();
    tx.rawWebhook = webhookBody;
    tx.failReason = null;
    await tx.save();

    return {
      updated: true,
      orderCode,
      status: tx.status,
      orderUUID: tx.orderUUID,
    };
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
}

module.exports = PaymentService;