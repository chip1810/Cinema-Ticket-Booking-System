import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, X,
    Utensils, Coffee, Box, AlertCircle, TrendingUp,
    Loader2, Popcorn, Tag, Package, AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { managerService } from '../../../services/managerService';
import { formatVND } from '../../../utils/format';

const ConcessionModal = ({ isOpen, onClose, item = null, onSave }) => {
    // ... rest of the file ...
    // ... just adding Swal inside ConcessionManagementPage handleSave below.
    const [formData, setFormData] = useState({
        name: '',
        type: 'Food',
        price: 0,
        stockQuantity: 0,
        imageUrl: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                type: item.type || 'Food',
                price: item.price !== undefined ? item.price : 0,
                stockQuantity: item.stockQuantity !== undefined ? item.stockQuantity : 0,
                imageUrl: item.imageUrl || ''
            });
        } else {
            setFormData({
                name: '',
                type: 'Food',
                price: 0,
                stockQuantity: 0,
                imageUrl: ''
            });
        }
    }, [item]);

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
                    <h3 className="text-xl font-bold text-white">{item ? 'Edit Concession' : 'Add Concession'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        ...formData,
                        price: Number(formData.price),
                        stockQuantity: Number(formData.stockQuantity)
                    });
                }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Name</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Popcorn, Soda..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white font-medium [&>option]:text-gray-900"
                            >
                                <option value="Food">Food</option>
                                <option value="Drink">Drink</option>
                                <option value="Combo">Combo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Price (VNĐ)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Stock Quantity</label>
                            <input
                                type="number"
                                value={formData.stockQuantity}
                                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Image Upload</label>
                        <div className="flex gap-4 items-center">
                            {formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
                                <img src={formData.imageUrl} className="h-12 w-12 object-cover rounded-xl border border-white/10" alt="Preview" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, imageUrl: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-red-600 transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600/20 file:text-red-500 hover:file:bg-red-600/30"
                            />
                        </div>
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
                            {item ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function ConcessionManagementPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await managerService.getConcessions();
            setItems(response.data || [
                { id: 1, name: 'Large Popcorn (Sweet)', category: 'Snacks', price: 8.5, status: 'In Stock' },
                { id: 2, name: 'Coca-Cola 500ml', category: 'Beverages', price: 4.5, status: 'In Stock' },
                { id: 3, name: 'Family Combo', category: 'Combos', price: 25.0, status: 'Out of Stock' },
                { id: 4, name: 'Nachos with Cheese', category: 'Snacks', price: 12.0, status: 'In Stock' },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await managerService.deleteConcession(id);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredItems = items.filter(item => {
        const name = typeof item.name === 'object' ? item.name?.name : item.name;
        const type = item.type || (typeof item.category === 'object' ? item.category?.name : item.category);
        const search = searchTerm.toLowerCase();
        return (
            name?.toLowerCase().includes(search) || 
            type?.toLowerCase().includes(search)
        );
    });

    const lowStockItems = items.filter(i => (i.stockQuantity !== undefined && i.stockQuantity < 10) || i.status === 'Out of Stock');

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await managerService.updateConcession(editingItem.id, data);
                Swal.fire({
                    title: 'Updated!',
                    text: 'Product details updated successfully.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            } else {
                await managerService.createConcession(data);
                Swal.fire({
                    title: 'Added!',
                    text: 'New product added successfully.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: err?.response?.data?.message || 'Failed to save product data.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold font-display tracking-tight text-white">F&B Concessions</h2>
                    <p className="text-gray-400 mt-1">Manage food, beverages and combo deals for the cinema.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                        <div className="p-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search menu..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 text-white" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all text-white">Export CSV</button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-500 text-[10px] uppercase font-black border-b border-white/10">
                                        <th className="px-8 py-4">Item Name</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Price</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-red-500 shadow-md">
                                                        <Popcorn size={20} />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-200">
                                                        {typeof item.name === 'object' ? item.name?.name : item.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase">
                                                    <Tag size={12} className="text-red-600" />
                                                    {item.type || (typeof item.category === 'object' ? item.category?.name : item.category)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-black text-white">
                                                {formatVND(item.price)}
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.stockQuantity > 0 || item.status === 'In Stock' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {item.stockQuantity > 0 ? `In Stock (${item.stockQuantity})` : (item.status || 'Out of Stock')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-gray-600 hover:text-white transition-all outline-none"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-gray-600 hover:text-red-500 transition-all outline-none"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-2xl shadow-red-600/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
                        <Package size={48} className="mb-6 opacity-40 group-hover:rotate-12 transition-transform" />
                        <h4 className="text-xl font-bold mb-2">Inventory Alert</h4>
                        <p className="text-sm text-white/80 leading-relaxed mb-6">
                            {lowStockItems.length > 0 
                                ? `${lowStockItems.length} items are running low on stock. Consider restocking soon.` 
                                : "All items are well-stocked. Great job!"}
                        </p>
                        {lowStockItems.length > 0 && (
                            <button 
                                onClick={() => setSearchTerm(lowStockItems[0].name)}
                                className="w-full py-3 bg-white text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
                            >
                                View Low Stock
                            </button>
                        )}
                    </div>

                    {lowStockItems.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6 text-red-500">
                                <AlertCircle size={20} />
                                <h4 className="font-bold">Restock Needed</h4>
                            </div>
                            <div className="space-y-4">
                                {lowStockItems.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <p className="text-gray-400">
                                            <span className="text-white font-medium">{item.name}</span> is low ({item.stockQuantity} left)
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6 text-amber-500">
                            <AlertTriangle size={20} />
                            <h4 className="font-bold">Recent Updates</h4>
                        </div>
                        <div className="space-y-4">
                            {items.length > 0 ? items.slice(-2).reverse().map(item => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <p className="text-gray-400">
                                        <span className="text-white font-medium">{item.name}</span> was recently synchronized.
                                    </p>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-500 italic">No recent activities.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <ConcessionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        item={editingItem}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
