export default function ShowtimeCard({ showtime }) {

  const time = new Date(showtime.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button className="border border-white/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-black transition">

      {time}

    </button>
  );
}