import { Link } from "react-router-dom";

export default function ShowtimeCard({ showtime }) {

  const time = new Date(showtime.startTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <Link
      to={`/booking/${showtime.UUID}`}
      className="bg-gray-800 hover:bg-red-600 transition px-4 py-3 rounded-lg text-center min-w-[90px]"
    >
      <div className="text-lg font-semibold">
        {time}
      </div>

      <div className="text-xs text-gray-300">
        {showtime.availableSeats}/{showtime.totalSeats} chỗ
      </div>
    </Link>
  );
}