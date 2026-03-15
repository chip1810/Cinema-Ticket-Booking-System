export default function MovieHero({ movie }) {
  return (
    <div className="relative w-full h-[350px] lg:h-[450px]">
      
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.bannerUrl || "/no-banner.jpg"})`,
        }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative max-w-6xl mx-auto h-full flex items-end p-6 lg:p-10 gap-6">

        <img
          src={movie.posterUrl || "/no-poster.jpg"}
          className="w-28 lg:w-48 rounded-lg shadow-xl"
        />

        <div className="pb-4">
          <h1 className="text-2xl lg:text-4xl font-bold">{movie.title}</h1>

          <div className="flex gap-4 mt-2 text-sm text-slate-300">
            <span>{movie.duration} min</span>
            <span>{movie.rating || "N/A"} ⭐</span>
            <span>{movie.releaseDate}</span>
          </div>
        </div>

      </div>
    </div>
  );
}