import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
    Clapperboard,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Loader2,
    Edit2,
    Trash2,
    X,
    PlusCircle,
    FileImage,
    Calendar
} from 'lucide-react';
import { managerService } from '../../../services/managerService';

const MovieModal = ({ isOpen, onClose, movie = null, onSave }) => {
    // ... (rest of MovieModal logic remains the same, we'll keep it as is below or just edit handleSave)
    // To preserve content, I am copying the full unchanged modal below, down to line 268 logic.
    const [genres, setGenres] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        genreIds: [],
        status: 'Now Showing',
        description: '',
        releaseDate: new Date().toISOString().split('T')[0],
        posterUrl: '',
        trailerUrl: ''
    });

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await managerService.getGenres();
                setGenres(res.data || res);
            } catch (err) { console.error(err); }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title || '',
                duration: movie.duration || '',
                genreIds: movie.genres ? movie.genres.map(g => g.id) : [],
                status: movie.status || 'Now Showing',
                description: movie.description || '',
                releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                posterUrl: movie.posterUrl || '',
                trailerUrl: movie.trailerUrl || ''
            });
        }
    }, [movie]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            duration: Number(formData.duration),
            genreIds: formData.genreIds.map(Number)
        });
    };

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
                className="bg-[#1a0607] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="text-xl font-bold text-white">{movie ? 'Edit Movie' : 'Add New Movie'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Movie Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Avatar: The Way of Water"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 appearance-none text-white [&>option]:text-gray-900"
                            >
                                <option value="Now Showing">Now Showing</option>
                                <option value="Coming Soon">Coming Soon</option>
                                <option value="Stopped">Stopped</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Duration (minutes)</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="120"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Release Date</label>
                            <input
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Genres (Hold Ctrl to select multiple)</label>
                        <select
                            multiple
                            value={formData.genreIds}
                            onChange={(e) => setFormData({ ...formData, genreIds: Array.from(e.target.selectedOptions, option => option.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 min-h-[100px] text-white [&>option]:text-gray-900"
                            required
                        >
                            {genres.map(g => (
                                <option key={g.id} value={g.id}>{typeof g.name === 'object' ? g.name?.name : g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 font-medium">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Movie synopsis..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all resize-none text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Poster Upload</label>
                            <div className="flex gap-4 items-center">
                                {formData.posterUrl && formData.posterUrl.startsWith('data:image') && (
                                    <img src={formData.posterUrl} className="h-12 w-10 object-cover rounded-md border border-white/10" alt="Preview" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, posterUrl: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:outline-none focus:border-red-600 transition-all text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-600/20 file:text-red-500 hover:file:bg-red-600/30 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 font-medium">Trailer URL (Youtube)</label>
                            <input
                                value={formData.trailerUrl}
                                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 transition-all text-white"
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
                            {movie ? 'Save Changes' : 'Add Movie'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default function MovieManagementPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const response = await managerService.getMovies();
            setMovies(response.data || response); // Handle different response formats
        } catch (err) {
            console.error('Failed to fetch movies:', err);
            // Fallback data for demo
            setMovies([
                { id: 1, title: 'Avatar: Way of Water', duration: '192 min', genre: 'Action, Sci-Fi', status: 'Now Showing' },
                { id: 2, title: 'John Wick: Chapter 4', duration: '169 min', genre: 'Action, Thriller', status: 'Now Showing' },
                { id: 3, title: 'Scream VI', duration: '122 min', genre: 'Horror, Mystery', status: 'Ended' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleCreate = () => {
        setEditingMovie(null);
        setIsModalOpen(true);
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (editingMovie) {
                await managerService.updateMovie(editingMovie.id, data);
                Swal.fire({
                    title: 'Updated!',
                    text: 'Movie details updated successfully.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            } else {
                await managerService.createMovie(data);
                Swal.fire({
                    title: 'Added!',
                    text: 'New movie added successfully.',
                    icon: 'success',
                    background: '#1a0607',
                    color: '#fff',
                    confirmButtonColor: '#dc2626'
                });
            }
            setIsModalOpen(false);
            fetchMovies();
        } catch (err) {
            console.error('Save failed:', err);
            Swal.fire({
                title: 'Error!',
                text: err?.response?.data?.message || 'Failed to save movie data.',
                icon: 'error',
                background: '#1a0607',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movie?')) return;
        try {
            await managerService.deleteMovie(id);
            fetchMovies();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const filteredMovies = Array.isArray(movies) 
        ? movies
            .filter(m => {
                const search = searchTerm.toLowerCase();
                const genresText = m.genres?.map(g => g.name).join(', ') || m.genre || '';
                const titleMatch = m.title.toLowerCase().includes(search);
                const genreMatch = genresText.toLowerCase().includes(search);
                const statusMatch = statusFilter === 'All' || m.status === statusFilter;
                
                return (titleMatch || genreMatch) && statusMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
                if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
                if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
                if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
                return 0;
            })
        : [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Movie Management</h2>
                    <p className="text-gray-400 mt-1">Add, edit and manage movie listings across all theatres.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
                >
                    <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add New Movie</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles by title or summary..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-600 text-white"
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all">
                        <Filter size={16} className="text-gray-500" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-gray-900"
                        >
                            <option value="All">All Status</option>
                            <option value="Now Showing">Now Showing</option>
                            <option value="Coming Soon">Coming Soon</option>
                            <option value="Stopped">Stopped</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer [&>option]:text-gray-900"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="title-asc">Title (A-Z)</option>
                            <option value="title-desc">Title (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-red-600" size={40} />
                        <p className="text-gray-500 font-medium">Fetching contents...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-8 py-5 font-semibold">Movie Details</th>
                                    <th className="px-8 py-5 font-semibold">Duration</th>
                                    <th className="px-8 py-5 font-semibold">Genre</th>
                                    <th className="px-8 py-5 font-semibold">Status</th>
                                    <th className="px-8 py-5 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredMovies.map((movie, i) => (
                                    <tr key={movie.id || i} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-20 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-red-600/30 transition-all shadow-lg">
                                                    {movie.poster ? (
                                                        <img src={movie.poster} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Clapperboard className="text-gray-600" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg block group-hover:text-red-500 transition-colors">
                                                        {typeof movie.title === 'object' ? movie.title?.title : movie.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Calendar size={12} /> Release: Oct 2023
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-medium">
                                            {typeof movie.duration === 'object' ? movie.duration?.duration : movie.duration}
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-medium">
                                            <div className="flex gap-2 flex-wrap">
                                                {(movie.genre || '').split(',').map((g, idx) => (
                                                    <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px]">{g.trim()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${movie.status === 'Now Showing' ? 'bg-green-500/10 text-green-500' :
                                                movie.status === 'Coming Soon' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                {movie.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(movie)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all outline-none"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all outline-none"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <MovieModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        movie={editingMovie}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}