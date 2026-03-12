import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Ticket,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { managerService } from '../../../services/managerService';
import { formatVND } from '../../../utils/format';

const iconMap = {
    DollarSign,
    Ticket,
    Users,
    TrendingUp
};

const StatCard = memo(({ title, value, change, icon, color, isCurrency }) => {
    const Icon = iconMap[icon] || TrendingUp;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-${color}-500/20 text-${color}-500`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
                {isCurrency ? formatVND(value) : value.toLocaleString()}
            </h3>
        </motion.div>
    );
});

export default memo(function ManagerDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [movieStats, setMovieStats] = useState([]);

    const fetchData = useCallback(async () => {
            try {
                setLoading(true);
                const [summaryRes, movieRes] = await Promise.all([
                    managerService.getDashboardStats(),
                    managerService.getMovieStats()
                ]);
                setSummary(summaryRes.data);
                setMovieStats(movieRes.data.popularMovies || []);
            } catch (err) {
                console.error('Dashboard error:', err);
                setError('Failed to fetch real-time data');
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const stats = useMemo(() => summary?.stats || [], [summary?.stats]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-red-600 mx-auto" size={48} />
                    <p className="text-gray-400 animate-pulse">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold">Welcome back, Manager 👋</h2>
                    <p className="text-gray-400 mt-1">Here's what's happening in your cinema today.</p>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.length > 0 ? (
                    stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
                        No statistical data available yet.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold">Revenue Overview</h3>
                        <select className="bg-[#140405] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {(summary?.revenueChart || [0, 0, 0, 0, 0, 0, 0]).map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${val > 0 ? (val / 1000000) * 10 : 2}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg relative group cursor-pointer"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#140405] px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                    {formatVND(val)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-gray-400 text-sm font-medium">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <h3 className="text-xl font-bold mb-6">Popular Movies</h3>
                    <div className="space-y-6">
                        {movieStats.length > 0 ? (
                            movieStats.slice(0, 4).map((movie, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium truncate pr-2" title={movie.name}>{movie.name}</span>
                                        <span className="text-gray-400 whitespace-nowrap">{movie.sales} sales</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${movie.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                            className="h-full bg-red-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-gray-500 text-sm italic">
                                No movie statistics yet.
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-bold transition-all text-gray-300">
                        Detailed Stats
                    </button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl"
            >
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold">Recent Transactions</h3>
                    <button className="text-red-500 text-sm font-semibold hover:text-red-400 transition-colors">Export Report</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-400 text-sm border-b border-white/10">
                                <th className="px-8 py-4 font-medium">Customer</th>
                                <th className="px-8 py-4 font-medium">Item</th>
                                <th className="px-8 py-4 font-medium">Amount</th>
                                <th className="px-8 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(summary?.transactions || []).map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600/20 to-red-400/20 border border-white/10 flex items-center justify-center text-red-500 font-bold text-xs">
                                                {(item.name || 'U').split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-gray-400">{item.item}</td>
                                    <td className="px-8 py-4 text-sm font-bold text-white">
                                        {formatVND(item.amount)}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${item.status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!summary?.transactions || summary.transactions.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-500 italic">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
});

