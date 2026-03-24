import { Star, ArrowRight, Play, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function MovieGrid({ movies }) {
    return (
        <section className="px-6 lg:px-24 py-20 max-w-[1700px] mx-auto overflow-hidden">
            <div className="flex items-end justify-between mb-16 px-2">
                <div className="space-y-2">
                    <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">What's Playing</span>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase text-white">
                        Now <span className="text-primary text-glow">Showing</span>
                    </h2>
                </div>

                <Link className="group flex items-center gap-3 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest pb-2">
                    See All <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
                {movies.map((movie, idx) => (
                    <motion.div 
                        key={movie.id || movie.UUID} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="group relative flex flex-col gap-6"
                    >
                        {/* Poster with premium hover */}
                        <div className="relative aspect-[2.8/4] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-neutral-900">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url('${movie.posterUrl || "/no-poster.jpg"}')`,
                                }}
                            />
                            
                            {/* Card Glow Effect */}
                            <div className="movie-card-glow" />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 gap-4">
                                <Link
                                    to={`/movies/${movie.UUID}`}
                                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-black" />
                                    Book Now
                                </Link>
                                <Link
                                    to={`/movies/${movie.UUID}`}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center border border-white/10 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75"
                                >
                                    Details
                                </Link>
                            </div>

                            {/* Rating Badge */}
                            <div className="absolute top-6 right-6 glass-effect px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                <span className="text-white text-[11px] font-black">{movie.rating || "8.5"}</span>
                            </div>
                        </div>

                        {/* Movie Info */}
                        <div className="space-y-3 px-2">
                            <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors">
                                {movie.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                    <Calendar className="w-3 h-3" />
                                    {movie.duration}m
                                </span>
                                {movie.genres?.slice(0, 2).map((g, i) => (
                                    <span key={g._id || i}>{g.name}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}