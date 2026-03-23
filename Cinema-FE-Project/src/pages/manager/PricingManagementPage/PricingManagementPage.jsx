import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Save, DollarSign, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { managerService } from '../../../services/managerService';
import { formatVND } from '../../../utils/format';

const PricingCard = ({ rule, onSave }) => {
    const [val, setVal] = useState(rule.amount || 0);

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                    <DollarSign size={24} />
                </div>
                <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-gray-400 uppercase tracking-widest">Active</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{rule.name}</h3>
            <p className="text-gray-500 text-sm mb-6">{rule.description}</p>

            <div className="space-y-4">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                    <input
                        type="number"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        className="w-full bg-[#140405] border border-white/5 rounded-2xl py-3 pl-8 pr-4 text-xl font-black focus:outline-none focus:border-red-600 transition-all"
                    />
                </div>
                <button
                    onClick={() => onSave(rule.id, val)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Update Rate
                </button>
            </div>
        </div>
    );
};

export default function PricingManagementPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                setLoading(true);
                const response = await managerService.getPricingRules();
                setRules(response.data || [
                    { id: 1, name: 'Base Ticket Price', description: 'Standard ticket price for 2D movies.', amount: 10 },
                    { id: 2, name: 'Weekend Surcharge', description: 'Additional cost for Fri-Sun screenings.', amount: 5 },
                    { id: 3, name: '3D Format Surcharge', description: 'Extra fee for 3D movie technology.', amount: 3 },
                    { id: 4, name: 'VIP Seat Surcharge', description: 'Premium for Gold Class or VIP seats.', amount: 8 },
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const handleUpdate = async (id, val) => {
        try {
            await managerService.updatePricingRule(id, { amount: val });
            // Notify success
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Pricing Strategy</h2>
                    <p className="text-gray-400 mt-1">Configure base prices and dynamic surcharges for tickets.</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-500">
                        <AlertCircle size={16} />
                        <span className="text-xs font-bold uppercase">Auto-sync active</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex justify-center items-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {rules.map(rule => (
                        <PricingCard key={rule.id} rule={rule} onSave={handleUpdate} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-red-600" /> Special Days
                    </h3>
                    <div className="space-y-4">
                        {['Holiday Peak', 'Valentine Special', 'Member Tuesday'].map((day, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-red-600/30 transition-all">
                                <div>
                                    <p className="font-bold text-gray-200">{day}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Modifier: +{formatVND(30000)}</p>
                                </div>
                                <button className="text-xs font-bold text-red-500 hover:underline">Edit Policy</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1a0607] to-[#0a0203] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <h3 className="text-xl font-bold mb-4 relative z-10">Revenue Impact Simulator</h3>
                    <p className="text-sm text-gray-400 mb-8 relative z-10">Adjust your pricing strategy to see projected monthly revenue based on current booking trends.</p>
                    <div className="space-y-6 relative z-10">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full bg-red-600" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Projected Growth</p>
                                <p className="text-3xl font-black text-white">+14.2%</p>
                            </div>
                            <button className="px-6 py-3 bg-white text-[#1a0607] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Run Full Report</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
