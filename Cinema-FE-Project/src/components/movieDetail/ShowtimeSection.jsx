import ShowtimeCard from "./ShowtimeCard";

export default function ShowtimeSection({ showtimes }) {

  const grouped = {};

  showtimes?.forEach((s) => {
    const date = new Date(s.startTime).toLocaleDateString("en-CA"); 
    // format YYYY-MM-DD

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  });

  const dates = Object.keys(grouped).sort();

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold mb-6">Showtimes</h2>

      {dates.map((date) => (
        <div key={date} className="mb-6">

          <h3 className="text-lg font-semibold mb-3">
            {new Date(date).toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </h3>

          <div className="flex flex-wrap gap-3">
            {grouped[date].map((s) => (
              <ShowtimeCard key={s.UUID} showtime={s} />
            ))}
          </div>

        </div>
      ))}
    </section>
  );
}