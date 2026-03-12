export default function ComingSoon({ movies }) {
    const movie = movies[0];

    if (!movie) return null;

    return (
        <section className="px-6 lg:px-20 py-16">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold tracking-tight border-l-4 border-slate-100 pl-4">
                    Coming Soon
                </h2>
            </div>

            <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row gap-8 items-center glass-effect p-8 rounded-xl border border-white/5">
                    <div
                        className="w-full lg:w-1/3 aspect-video rounded-lg bg-cover bg-center shadow-2xl"
                        style={{
                            backgroundImage: `url('${movie.bannerUrl || "/no-banner.jpg"
                                }')`,
                        }}
                    />

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">
                                Release: {movie.releaseDate}
                            </span>
                        </div>

                        <h3 className="text-4xl font-extrabold text-white">
                            {movie.title}
                        </h3>

                        <p className="text-slate-400 text-lg leading-relaxed">
                            {movie.description || "Coming soon to our cinema."}
                        </p>

                        <div className="flex gap-4 pt-2">
                            <button className="border border-white/20 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-white/5 transition-all">
                                Watch Trailer
                            </button>

                            <button className="bg-primary/20 text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-primary/30 transition-all">
                                Set Reminder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}