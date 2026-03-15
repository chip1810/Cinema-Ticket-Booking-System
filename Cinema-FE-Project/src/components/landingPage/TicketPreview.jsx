import { Ticket } from 'lucide-react';

export default function TicketPreview() {
    return (
        <section className="px-6 lg:px-20 -mt-16 relative z-10 mb-12">
            <div className="max-w-4xl glass-effect rounded-xl p-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-8 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-primary text-xs font-bold uppercase tracking-tighter">Your Next Viewing</p>
                        <h3 className="text-xl font-bold text-white">Interstellar: 10th Anniversary</h3>
                        <p className="text-slate-400 text-sm">Tomorrow, 20:30 • Screen 4 (IMAX) • Seat G-14</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-slate-500 text-xs uppercase">Booking ID</p>
                        <p className="text-white font-mono">#ST-99420-LX</p>
                    </div>
                    <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-100 transition-all">
                        Digital Pass
                    </button>
                </div>
            </div>
        </section>
    );
}
