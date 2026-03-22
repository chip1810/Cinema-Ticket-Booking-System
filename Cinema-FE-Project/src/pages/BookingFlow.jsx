import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import SeatSelection from "./SeatSelection";
import ConcessionPage from "./customer/concessionPage/ConcessionPage";

export default function BookingFlow() {
    const { uuid } = useParams();

    // Quản lý flow: 1 = Chọn ghế, 2 = Bắp nước
    const [step, setStep] = useState(1);

    // State tổng hợp dữ liệu
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatData, setSeatData] = useState(null); // Thông tin ghế + showtime
    const [socket, setSocket] = useState(null);

    // 1️⃣ Khởi tạo Socket
    useEffect(() => {
        const newSocket = io("http://localhost:3000");

        newSocket.on("connect", () => {
            console.log("🟢 Socket connected:", newSocket.id);
            console.log("📡 Join showtime room:", uuid);
            newSocket.emit("join-showtime", uuid);
        });

        setSocket(newSocket);

        return () => {
            console.log("🔴 Disconnect socket");
            newSocket.disconnect();
        };
    }, [uuid]);

    // 2️⃣ Khi user xác nhận ghế
    const handleSeatsConfirmed = (bookingData) => {
        setSeatData(bookingData); // bookingData.details là mảng ghế
        setStep(2);
    };
    // 3️⃣ Quay lại trang chọn ghế
    const handleBackToSeats = () => {
        setStep(1);
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
            {step === 1 && (
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
                        onNext={(finalOrder) => console.log("Final order:", finalOrder)}
                    />
                </>
            )}
        </div>
    );
}