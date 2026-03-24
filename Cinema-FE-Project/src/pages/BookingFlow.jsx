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
        try {
            const showtimeUUID = finalOrder?.showtime?.UUID;
            const seatUUIDs = finalOrder?.selectedSeats || [];

            const concessions = (finalOrder?.snacks || [])
                .filter((s) => s.quantity > 0)
                .map((s) => ({
                    concessionUUID: s.UUID,
                    quantity: s.quantity,
                }));

            if (!showtimeUUID || seatUUIDs.length === 0) {
                throw new Error("Thiếu showtime hoặc ghế đã chọn");
            }

            // 1) lấy checkoutToken
            const previewData = await seatService.checkoutPreview({
                showtimeUUID,
                seatUUIDs,
                concessions,
                voucherUUID: null,
                voucherCode: null,
            });

            // 2) tạo link PayOS
            const paymentData = await paymentService.createPayOSLink(previewData.checkoutToken);
            console.log(paymentData);

            // 3) redirect sang trang thanh toán
            window.location.href = paymentData.checkoutUrl;
        } catch (err) {
            console.error("❌ Payment flow error:", err);
            alert(err.message || "Không thể tạo thanh toán, vui lòng thử lại.");
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
