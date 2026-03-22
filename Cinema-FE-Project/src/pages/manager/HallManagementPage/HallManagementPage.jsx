import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Armchair,
    Plus,
    MoreVertical,
    Loader2,
    Grid3X3,
    ChevronRight,
    Save,
    Trash2,
    Type,
    Maximize,
    X,
    Edit2
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const SeatEditor = ({ hall, onClose }) => {
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(12);
    const [grid, setGrid] = useState({}); // { "r-c": type }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedType, setSelectedType] = useState('NORMAL');

    useEffect(() => {
        const fetchLayout = async () => {
            try {
                setLoading(true);
                const res = await managerService.getSeatLayout(hall.id);
                // Transform matrix to grid object
                const newGrid = {};
                let maxR = 10;
                let maxC = 12;

                if (res.data?.matrix) {
                    res.data.matrix.forEach(rowItem => {
                        maxR = Math.max(maxR, rowItem.row);
                        rowItem.seats.forEach(seat => {
                            maxC = Math.max(maxC, seat.col);
                            newGrid[`${rowItem.row}-${seat.col}`] = seat.type;
                        });
                    });
                }
                setGrid(newGrid);
                setRows(maxR);
                setCols(maxC);
            } catch (err) {
                console.error('Failed to fetch layout:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLayout();
    }, [hall.id]);

    const toggleSeat = (r, c) => {
        const key = `${r}-${c}`;
        const currentType = grid[key];

        const newGrid = { ...grid };
        if (currentType === selectedType) {
            delete newGrid[key]; // Remove seat
        } else {
            newGrid[key] = selectedType; // Set/Change type
        }
        setGrid(newGrid);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const seats = Object.entries(grid).map(([key, type]) => {
                const [r, c] = key.split('-').map(Number);
                return { row: r, col: c, type };
            });

            await managerService.setSeatLayout(hall.id, { seats });
            onClose();
        } catch (err) {
            console.error('Failed to save layout:', err);
            alert('Lỗi khi lưu sơ đồ ghế');
        } finally {
            setSaving(false);
        }
    };

    const getSeatColor = (type) => {
        switch (type) {
            case 'NORMAL': return 'bg-white/10 border-white/20 text-gray-400';
            case 'VIP': return 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20';
            case 'COUPLE': return 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/20';
            default: return 'bg-transparent border-white/5 text-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-y-0 right-0 w-full max-w-5xl bg-[#0a0203] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
        >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div>
                    <h3 className="text-2xl font-bold">
                        {hall.name} - Sơ đồ ghế
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Hàng:</span>
                            <input type="number" value={rows} onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 bg-white/5 border border-white/10 rounded px-1 text-xs text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Cột:</span>
                            <input type="number" value={cols} onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 bg-white/5 border border-white/10 rounded px-1 text-xs text-white" />
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-12 custom-scrollbar flex flex-col items-center">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-red-600" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-2xl h-8 bg-gradient-to-b from-white/20 to-transparent rounded-lg mb-20 relative">
                            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase font-black tracking-[0.5em] text-gray-500">Màn Hình</p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-max pb-10">
                            {Array.from({ length: rows }).map((_, r) => (
                                <div key={r} className="flex gap-3 items-center">
                                    <span className="w-6 text-xs font-bold text-gray-600 uppercase">{String.fromCharCode(65 + r)}</span>
                                    <div className="flex gap-2">
                                        {Array.from({ length: cols }).map((_, c) => {
                                            const rowNum = r + 1;
                                            const colNum = c + 1;
                                            const type = grid[`${rowNum}-${colNum}`];
                                            return (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleSeat(rowNum, colNum)}
                                                    className={`w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center group ${getSeatColor(type)}`}
                                                >
                                                    <Armchair size={14} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="w-6 text-xs font-bold text-gray-600 uppercase text-right">{String.fromCharCode(65 + r)}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/10 shrink-0">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-6">
                        {[
                            { id: 'NORMAL', label: 'Thường', color: 'bg-white/10', border: 'border-white/20' },
                            { id: 'VIP', label: 'VIP', color: 'bg-amber-500', border: 'border-amber-400' },
                            { id: 'COUPLE', label: 'Đôi', color: 'bg-pink-600', border: 'border-pink-500' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedType(t.id)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${selectedType === t.id ? 'bg-white/10 border-red-600' : 'bg-transparent border-transparent'}`}
                            >
                                <div className={`w-4 h-4 rounded ${t.color} ${t.border} border`} />
                                <span className="text-xs font-bold text-gray-300">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setGrid({})}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-gray-400"
                    >
                        <Trash2 size={20} /> Xóa hết
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Lưu sơ đồ ({Object.keys(grid).length} ghế)
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const HallModal = ({ isOpen, onClose, hall = null, onSave }) => {
    const [formData, setFormData] = useState(hall || {
        name: '',
        type: 'Standard',
        capacity: 100
    });

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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold">{hall ? 'Edit Hall' : 'Add New Hall'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    onSave(formData);
                }}>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Hall Name</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Cinema 01"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-[#1a0607] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white"
                        >
                            <option value="Standard">Standard</option>
                            <option value="IMAX">IMAX</option>
                            <option value="VIP">VIP</option>
                            <option value="4DX">4DX</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Capacity (Seats)</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                            required
                        />
                    </div>

                    <div className="pt-6 border-t border-white/10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all"
                        >
                            {hall ? 'Save Changes' : 'Create Hall'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const HallCard = ({ hall, onEditLayout, onEdit, onDelete }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group overflow-hidden relative"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500" />

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                <Armchair size={24} />
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => onEdit(hall)}
                    className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all outline-none"
                    title="Edit Hall"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(hall.id)}
                    className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all outline-none"
                    title="Delete Hall"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>

        <h3 className="text-2xl font-black mb-1 font-display tracking-tight text-white">
            {typeof hall.name === 'object' ? hall.name?.name : hall.name}
        </h3>
        <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
            <Type size={14} /> {hall.type}
        </p>

        <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Max Capacity</p>
                    <p className="text-2xl font-black text-white">{hall.capacity} <span className="text-xs font-medium text-gray-500 ml-1">Seats</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Layout</p>
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
                onClick={() => onEditLayout(hall)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-600/20"
            >
                <Grid3X3 size={14} /> Edit Seats
            </button>
        </div>
    </motion.div>
);

export default function HallManagementPage() {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLayoutHall, setActiveLayoutHall] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHall, setEditingHall] = useState(null);

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const response = await managerService.getHalls();
            setHalls(response.data || response);
        } catch (err) {
            console.error(err);
            setHalls([
                { id: 1, name: 'Cinema 01', type: 'IMAX Laser', capacity: 350, status: 'Available' },
                { id: 2, name: 'Cinema 02', type: 'Dolby Cinema', capacity: 200, status: 'Maintenance' },
                { id: 3, name: 'Cinema 03', type: 'VIP Gold Class', capacity: 48, status: 'Available' },
                { id: 4, name: 'Cinema 04', type: 'Standard 4K', capacity: 150, status: 'Available' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const handleCreate = () => {
        setEditingHall(null);
        setIsModalOpen(true);
    };

    const handleEdit = (hall) => {
        setEditingHall(hall);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hall?')) return;
        try {
            await managerService.deleteHall(id);
            fetchHalls();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingHall) {
                await managerService.updateHall(editingHall.id, data);
            } else {
                await managerService.createHall(data);
            }
            setIsModalOpen(false);
            fetchHalls();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 pb-10 overflow-x-hidden">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Hall Management</h2>
                    <p className="text-gray-400 mt-1">Manage physical cinema rooms and configure interactive seat layouts.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create New Hall</span>
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {halls.map((hall) => (
                        <HallCard
                            key={hall.id}
                            hall={hall}
                            onEditLayout={setActiveLayoutHall}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    <motion.button
                        onClick={handleCreate}
                        whileHover={{ y: -5 }}
                        className="border-2 border-dashed border-white/10 rounded-3xl p-6 hover:border-red-600/30 hover:bg-red-600/5 transition-all flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-red-500 group"
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center group-hover:border-red-600/50 group-hover:scale-110 transition-all duration-500">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold">Add Another Terminal</span>
                    </motion.button>
                </div>
            )}

            <AnimatePresence>
                {activeLayoutHall && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveLayoutHall(null)}
                            className="fixed inset-0 bg-[#0a0203]/80 backdrop-blur-md z-[65]"
                        />
                        <SeatEditor
                            hall={activeLayoutHall}
                            onClose={() => {
                                setActiveLayoutHall(null);
                                fetchHalls(); // Refresh to see updated capacity/layout
                            }}
                        />
                    </>
                )}
                {isModalOpen && (
                    <HallModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        hall={editingHall}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
