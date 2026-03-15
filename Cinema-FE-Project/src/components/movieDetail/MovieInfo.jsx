export default function MovieInfo({ movie }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">

      <h2 className="text-2xl font-bold mb-4">About Movie</h2>

      <p className="text-slate-400 leading-relaxed">
        {movie.description || "No description available."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">

        {movie.genres?.map((genre) => (
          <span
            key={genre.id}
            className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
          >
            {genre.name}
          </span>
        ))}

      </div>
    </section>
  );
}