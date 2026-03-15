import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    Loader2,
    Filter,
    ChevronRight,
    ChevronLeft,
    X,
    Layout
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const ShowtimeModal = ({ isOpen, onClose, onSave }) => {
    const [movies, setMovies] = useState([]);
    const [halls, setHalls] = useState([]);
    const [formData, setFormData] = useState({
        movieId: '',
        hallId: '',
        startTime: '',
        date: new Date().toISOString().split('T')[0],
        price: '10'
    });

    useEffect(() => {
        if (isOpen) {
            const loadOptions = async () => {
                try {
                    const mRes = await managerService.getMovies();
                    const hRes = await managerService.getHalls();
                    setMovies(mRes.data || mRes);
                    setHalls(hRes.data || hRes);
                } catch (err) { console.error(err); }
            };
            loadOptions();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0203]/90 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold font-display text-white">Schedule New Screening</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    // Combine date and time for BE
                    const startTime = `${formData.date}T${formData.startTime}:00.000Z`;
                    onSave({
                        movieId: parseInt(formData.movieId),
                        hallId: parseInt(formData.hallId),
                        startTime,
                        price: parseFloat(formData.price)
                    });
                }}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Select Movie</label>
                            <select
                                value={formData.movieId}
                                onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white [&>option]:text-gray-900"
                                required
                            >
                                <option value="">Choose a movie...</option>
                                {movies.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {typeof m.title === 'object' ? m.title?.title : m.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Select Theatre / Hall</label>
                            <select
                                value={formData.hallId}
                                onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white [&>option]:text-gray-900"
                                required
                            >
                                <option value="">Choose a hall...</option>
                                {halls.map(h => (
                                    <option key={h.id} value={h.id}>
                                        {typeof h.name === 'object' ? h.name?.name : h.name} ({h.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-medium">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Ticket Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex gap-3 text-red-500">
                        <Layout size={20} className="shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed font-medium">
                            System will automatically check for room conflicts and allow 30 minutes for cleanup between sessions.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all">Create Schedule</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function ShowtimeManagementPage() {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchShowtimes = async () => {
        try {
            setLoading(true);
            const response = await managerService.getShowtimes({ date: selectedDate });
            setShowtimes(response.data || response);
        } catch (err) {
            console.error(err);
            setShowtimes([
                { id: 1, movie: 'Avatar: Way of Water', hall: 'Hall 1 (IMAX)', time: '10:00 AM', date: 'Oct 24, 2023', bookings: 75 },
                { id: 2, movie: 'John Wick: Chapter 4', hall: 'Hall 3', time: '1:30 PM', date: 'Oct 24, 2023', bookings: 42 },
                { id: 3, movie: 'Scream VI', hall: 'Hall 2 (VIP)', time: '4:45 PM', date: 'Oct 24, 2023', bookings: 12 },
                { id: 4, movie: 'Avatar: Way of Water', hall: 'Hall 1 (IMAX)', time: '6:30 PM', date: 'Oct 24, 2023', bookings: 98 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShowtimes();
    }, [selectedDate]);

    const handleSave = async (data) => {
        try {
            await managerService.createShowtime(data);
            setIsModalOpen(false);
            fetchShowtimes();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this showtime?')) return;
        try {
            await managerService.deleteShowtime(id);
            fetchShowtimes();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Showtime Management</h2>
                    <p className="text-gray-400 mt-1">Schedule and monitor movie screenings across all halls.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>New Showtime</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl">
                    {[0, 1, 2, 3, 4, 5].map((offset) => {
                        const date = new Date();
                        date.setDate(date.getDate() + offset);
                        const dateStr = date.toISOString().split('T')[0];
                        const isActive = selectedDate === dateStr;
                        return (
                            <button
                                key={offset}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {offset === 0 ? 'Today' : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                        <MapPin size={18} />
                        <span>Select Branch</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                        <Filter size={18} />
                        <span>Format</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {showtimes.map((show, i) => (
                        <motion.div
                            key={show.id}
                            whileHover={{ y: -8 }}
                            className="bg-[#1a0607]/60 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-xl"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-lg shadow-red-600/20">
                                    <Clock size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Confirmed</p>
                                    <p className="text-2xl font-black mt-1">{show.time}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-4 line-clamp-1 group-hover:text-red-500 transition-colors">
                                {typeof show.movie === 'object' ? show.movie?.title : show.movie}
                            </h3>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <MapPin size={14} className="text-red-500" />
                                    </div>
                                    <span className="font-semibold">{typeof show.hall === 'object' ? show.hall?.name : show.hall}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Calendar size={14} className="text-red-500" />
                                    </div>
                                    <span>{show.date}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Bookings</p>
                                    <p className="text-sm font-black text-green-500">{show.bookings}% filled</p>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${show.bookings}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5">Edit</button>
                                <button
                                    onClick={() => handleDelete(show.id)}
                                    className="px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition-all border border-red-600/10"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <ShowtimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
                )}
            </AnimatePresence>
        </div>
    );
}
