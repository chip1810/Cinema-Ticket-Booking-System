import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import SeatSelection from "./SeatSelection";
import ConcessionPage from "./customer/concessionPage/ConcessionPage";
import Swal from "sweetalert2";

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
        const newSocket = io("http://localhost:3000");

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

    return (
        <div className="min-h-screen bg-[#050505]">
            {step === 1 && user && (
                <SeatSelection
                    socket={socket}
                    onNext={handleSeatsConfirmed}
                    savedSeats={selectedSeats}
                />
            )}

            {step === 2 && user && (
                <ConcessionPage
                    bookingData={seatData}
                    onBack={handleBackToSeats}
                    onNext={(finalOrder) => console.log("Final order:", finalOrder)}
                />
            )}
        </div>
    );
}