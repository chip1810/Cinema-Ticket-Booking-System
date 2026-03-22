import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";
import SeatSelection from "./SeatSelection";
import ConcessionPage from "./customer/concessionPage/ConcessionPage";

export default function BookingFlow() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    // Quản lý flow: 1 = Chọn ghế, 2 = Bắp nước, 3 = Thanh toán
    const [step, setStep] = useState(1);

    // State tổng để tổng hợp dữ liệu cuối cùng
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatData, setSeatData] = useState(null); // Giữ thông tin movie/hall để trang nước dùng

    const [socket, setSocket] = useState(null);

    // 1. Khởi tạo Socket Duy Nhất
    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            console.log("🟢 Socket connected:", newSocket.id);
            console.log("📡 Join showtime room:", uuid);

            newSocket.emit("join-showtime", uuid);
        });

        setSocket(newSocket);

        return () => {
            console.log("🔴 disconnect socket");
            newSocket.disconnect();
        };
    }, [uuid]);

    // 2. Hàm chuyển từ Ghế -> Nước
    const handleSeatsConfirmed = (seats, data) => {
        setSelectedSeats(seats);
        setSeatData(data);

        // Gửi lệnh giữ ghế chính thức lên Server để bắt đầu tính 5 phút
        socket.emit("hold-seats", {
            showtimeId: uuid,
            seatUUIDs: seats
        });

        setStep(2); // Chuyển sang tab bắp nước
    };

    // 3. Hàm quay lại từ Nước -> Ghế
    const handleBackToSeats = () => {
        setStep(1);
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Trung có thể đặt một cái ProgressBar chung ở đây nếu muốn */}

            {step === 1 && (
                <SeatSelection
                    socket={socket}
                    onNext={handleSeatsConfirmed}
                    savedSeats={selectedSeats} // Truyền lại ghế cũ nếu user quay lại từ tab nước
                />
            )}

            {step === 2 && (
                <ConcessionPage
                    onBack={handleBackToSeats}
                    selectedSeats={selectedSeats}
                    seatData={seatData}
                    onComplete={(snacks) => console.log("Final Order:", { seats: selectedSeats, snacks })}
                />
            )}
        </div>
    );
}
