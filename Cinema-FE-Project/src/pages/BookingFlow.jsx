import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import SeatSelection from "./SeatSelection";
import ConcessionPage from "./customer/concessionPage/concessionPage";
import Swal from "sweetalert2";
import { SOCKET_URL } from "../config/api";
import { seatService } from "../services/seatService";
import { paymentService } from "../services/paymentService";

export default function BookingFlow() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            Swal.fire({
                icon: "warning",
                title: "Bạn cần đăng nhập",
                text: "Vui lòng đăng nhập để có thể chọn ghế và đặt vé.",
                confirmButtonColor: "#E50914",
            }).then(() => navigate("/", { replace: true }));
        }
    }, [user, isLoading, navigate]);

    // Quản lý flow: 1 = Chọn ghế, 2 = Bắp nước
    const [step, setStep] = useState(1);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatData, setSeatData] = useState(null);
    const [socket, setSocket] = useState(null);

    // 1️⃣ Khởi tạo Socket
    useEffect(() => {
        if (!uuid) return;
        const newSocket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            console.log("🟢 Socket connected:", newSocket.id);
            newSocket.emit("join-showtime", uuid);
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [uuid]);

    // 2️⃣ Khi user xác nhận ghế
    const handleSeatsConfirmed = (bookingData) => {
        setSeatData(bookingData);
        setStep(2);
    };

    // 3️⃣ Quay lại trang chọn ghế
    const handleBackToSeats = () => {
        setStep(1);
    };

    const handleConcessionNext = async (finalOrder) => {
        // mở trước tab để tránh popup block
        const payWindow = window.open("", "_blank");

        try {
            if (payWindow) {
                payWindow.document.write("<p style='font-family:sans-serif'>Dang chuyen den PayOS...</p>");
                payWindow.document.close();
            }

            const previewData = await seatService.checkoutPreview({
                showtimeUUID: finalOrder?.showtime?.UUID,
                seatUUIDs: finalOrder?.selectedSeats || [],
                concessions: (finalOrder?.snacks || [])
                    .filter((s) => s.quantity > 0)
                    .map((s) => ({ concessionUUID: s.UUID, quantity: s.quantity })),
                voucherUUID: null,
                voucherCode: finalOrder?.voucherCode || null,
            });

            const paymentData = await paymentService.createPayOSLink(previewData.checkoutToken);
            console.log("paymentData:", paymentData);

            const checkoutUrl = paymentData?.checkoutUrl;
            const orderCode = paymentData?.orderCode;

            if (!checkoutUrl || !orderCode) {
                throw new Error("Khong nhan duoc checkoutUrl/orderCode tu createPayOSLink");
            }

            // gắn link thật vào tab đã mở
            if (payWindow && !payWindow.closed) {
                payWindow.location.replace(checkoutUrl);
            } else {
                window.open(checkoutUrl, "_blank");
            }

            // tab hiện tại sang trang result để auto polling status
            navigate(`/payment/result?orderCode=${encodeURIComponent(orderCode)}`, { replace: true });
        } catch (err) {
            console.error("Payment flow error:", err);
            if (payWindow && !payWindow.closed) payWindow.close();
            alert(err.message || "Khong the tao thanh toan");
        }
    };

    // 4️⃣ Tạo object bookingData an toàn
    const bookingDataSafe = seatData
        ? {
            details: seatData.seats?.filter((s) =>
                selectedSeats.includes(s.UUID)
            ) || [],
            totalPrice: selectedSeats.reduce((total, seatUUID) => {
                const seat = seatData?.seats?.find((s) => s.UUID === seatUUID);
                if (!seat) return total;
                return total + (seatData?.pricing?.[seat.type] || 0);
            }, 0),
            showtime: seatData.showtime || null,
            movie: seatData.movie || null,
            holdExpiresAt: seatData.holdExpiresAt || null,
        }
        : null;

    return (
        <div className="min-h-screen bg-[#050505]">
            {step === 1 && user && (
                <SeatSelection
                    socket={socket}
                    onNext={handleSeatsConfirmed}
                    savedSeats={selectedSeats}
                />
            )}

            {step === 2 && (
                <>
                    {console.log("📝 bookingData chuẩn bị gửi sang ConcessionPage:", {
                        selectedSeats,
                        seatData
                    })}
                    <ConcessionPage
                        bookingData={seatData} // đã bao gồm details, totalPrice, holdExpiresAt...
                        onBack={handleBackToSeats}
                        onNext={handleConcessionNext}
                    />
                </>
            )
            }
        </div >
    );
}
