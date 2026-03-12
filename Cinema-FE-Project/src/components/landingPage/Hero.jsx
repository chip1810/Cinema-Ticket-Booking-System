import { PlayCircle } from 'lucide-react';
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="px-6 lg:px-20 py-8">
      <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
          style={{ 
            backgroundImage: `linear-gradient(to right, rgba(34, 16, 17, 0.9) 0%, rgba(34, 16, 17, 0.4) 50%, rgba(34, 16, 17, 0) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4hmgFEGHYOgozh8E9EZSkD56u7hZqJvHhWYETiPTgT6eSCbjVTalBKiaGqpxb6dD3wZj91hQ4tHmXgwx9GfP9nZdha8kw8Cn1nINbhoMwuTAxasXdx_D_1gyBbwKeDcietzp3Oc7-3u1UqnorIL96-GW_aMEwZzTuNj7ss1watPLSxzhrthIsnxssTlXZ_pcDEwrtWDpVlDt6gk1qajxZq3yXlPY2j_2GwIRfg4b2tpgu1zHvJCHkYRTGBP0aSDFrgb6AW1Wygg')` 
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-20 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2"
          >
            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Now Premiering</span>
            <h1 className="text-white text-5xl lg:text-7xl font-black leading-tight max-w-2xl">
              Experience Cinema <br/> <span className="text-primary">In Pure Luxury</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
              Immerse yourself in 4K laser projection and Dolby Atmos sound. Your premium leather recliner awaits.
            </p>
          </motion.div>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-primary/80 transition-all">
              <PlayCircle className="w-5 h-5" /> View Showtimes
            </button>
            <button className="glass-effect text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all border border-white/20">
              Explore VIP Club
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
