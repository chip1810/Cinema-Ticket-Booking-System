import { useState } from "react";
import { Star, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import VideoPlayer from "../movieDetail/VideoPlayer";

export default function MovieGrid({
    movies,
    sectionTitle = "Now Showing",
    showViewAllLink = true,
    emptyMessage,
}) {
    const [trailer, setTrailer] = useState(null);

    if (movies.length === 0 && emptyMessage) {
        return (
            <section className="px-6 lg:px-20 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4">
                        {sectionTitle}
                    </h2>
                </div>
                <p className="text-slate-400 text-center py-12">{emptyMessage}</p>
            </section>
        );
    }

    return (
        <section className="px-6 lg:px-20 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4">
                    {sectionTitle}
                </h2>

                {showViewAllLink ? (
                    <a className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        View All Movies <ArrowRight className="w-4 h-4" />
                    </a>
                ) : null}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                    <div key={movie.UUID || movie._id || movie.id} className="group flex flex-col gap-4">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url('${movie.posterUrl || "/no-poster.jpg"
                                        }')`,
                                }}
                            />

                            {/* Trailer nhanh (mobile / không cần hover) */}
                            {movie.trailerUrl ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTrailer({
                                            url: movie.trailerUrl,
                                            title: movie.title,
                                        })
                                    }
                                    className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 hover:scale-105"
                                    aria-label="Xem trailer"
                                >
                                    <Play className="h-4 w-4 fill-white ml-0.5" />
                                </button>
                            ) : null}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end gap-2 p-4">
                                {movie.trailerUrl ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTrailer({
                                                url: movie.trailerUrl,
                                                title: movie.title,
                                            })
                                        }
                                        className="w-full rounded-lg border border-white/25 bg-white/15 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                                    >
                                        Xem trailer
                                    </button>
                                ) : null}
                                <Link
                                    to={`/movies/${movie.UUID}`}
                                    className="block w-full bg-primary text-white py-2 rounded-lg font-bold text-sm text-center"
                                >
                                    Quick Book
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-100 truncate pr-2">
                                    {movie.title}
                                </h4>

                                <span className="text-yellow-500 text-sm flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-current" />
                                    {movie.rating || "N/A"}
                                </span>
                            </div>

                            <p className="text-slate-500 text-xs">
                                {movie.genres?.length
                                    ? movie.genres.map((g, i) => (
                                          <span key={g._id || g.id || i}>
                                              {g.name}{i < movie.genres.length - 1 ? ", " : ""}
                                          </span>
                                      ))
                                    : "Movie"} • {movie.duration}m
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <VideoPlayer
                isOpen={Boolean(trailer)}
                onClose={() => setTrailer(null)}
                videoUrl={trailer?.url}
                title={trailer?.title}
            />
        </section>
    );
}