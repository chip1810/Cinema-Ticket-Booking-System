import React, { useEffect, useState } from 'react';
import { UserCog, Plus, Loader2, X } from 'lucide-react';
import { adminService } from '../../../services/adminService';

const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REG = /^0\d{9}$/;

export default function StaffPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', fullName: '', phoneNumber: '', role: 'staff' });
    const [submitErr, setSubmitErr] = useState('');

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await adminService.getStaff();
            setList(res?.data || []);
        } catch (err) {
            setError('Không tải được danh sách');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitErr('');

        if (!form.email || !form.password) {
            setSubmitErr('Email và mật khẩu là bắt buộc');
            return;
        }
        if (!EMAIL_REG.test(form.email) || !form.email.endsWith('@gmail.com')) {
            setSubmitErr('Email phải là địa chỉ Gmail hợp lệ (ví dụ: user@gmail.com)');
            return;
        }
        if (form.phoneNumber && !PHONE_REG.test(form.phoneNumber)) {
            setSubmitErr('Số điện thoại phải 10 số, bắt đầu bằng 0');
            return;
        }

        try {
            await adminService.createStaff(form);
            setShowModal(false);
            setForm({ email: '', password: '', fullName: '', phoneNumber: '', role: 'staff' });
            fetchStaff();
        } catch (err) {
            setSubmitErr(err?.response?.data?.message || 'Tạo thất bại');
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Quản lý Nhân viên</h2>
                    <p className="text-gray-400 text-sm mt-1">Tạo tài khoản staff/manager, quản lý rạp và phân quyền.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium"
                >
                    <Plus size={18} />
                    Tạo tài khoản
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-white/10">
                            <th className="px-6 py-4 font-medium">ID</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Họ tên</th>
                            <th className="px-6 py-4 font-medium">SĐT</th>
                            <th className="px-6 py-4 font-medium">Vai trò</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((u) => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4">{u.id}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4">{u.fullName || '—'}</td>
                                <td className="px-6 py-4">{u.phoneNumber || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'manager' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {u.role === 'manager' ? 'Manager' : 'Staff'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${u.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {u.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có nhân viên
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-[#1a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Tạo tài khoản nhân viên</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitErr && (
                                <div className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{submitErr}</div>
                            )}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email (Gmail) *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="user@gmail.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Mật khẩu *</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">SĐT (10 số, bắt đầu 0)</label>
                                <input
                                    type="text"
                                    value={form.phoneNumber}
                                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                    placeholder="0901234567"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Vai trò</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-white/20 rounded-lg hover:bg-white/5">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium">
                                    Tạo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
