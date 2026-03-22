import React, { useEffect, useState } from 'react';
import { Ticket, Plus, Loader2 } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { formatVND } from '../../../utils/format';

export default function VouchersPage() {
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await adminService.getVouchers();
                setList(res?.data || []);
            } catch (err) {
                setError('Không tải được danh sách mã giảm giá');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-600" size={40} />
            </div>
        );
    }

    const formatDate = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        return dt.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Quản lý Mã giảm giá</h2>
                <p className="text-gray-400 text-sm mt-1">Tạo mã code, quy định số lượng, % giảm giá, ngày hết hạn.</p>
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
                            <th className="px-6 py-4 font-medium">Code</th>
                            <th className="px-6 py-4 font-medium">Loại</th>
                            <th className="px-6 py-4 font-medium">Giá trị</th>
                            <th className="px-6 py-4 font-medium">Số lượng / Đã dùng</th>
                            <th className="px-6 py-4 font-medium">Bắt đầu</th>
                            <th className="px-6 py-4 font-medium">Hết hạn</th>
                            <th className="px-6 py-4 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((v) => (
                            <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4 font-mono font-bold">{v.code}</td>
                                <td className="px-6 py-4">{v.type === 'PERCENTAGE' ? '%' : 'VNĐ'}</td>
                                <td className="px-6 py-4">
                                    {v.type === 'PERCENTAGE' ? `${v.value}%` : formatVND(v.value)}
                                </td>
                                <td className="px-6 py-4">{v.usedCount ?? 0} / {v.usageLimit ?? '∞'}</td>
                                <td className="px-6 py-4 text-sm">{formatDate(v.startDate)}</td>
                                <td className="px-6 py-4 text-sm">{formatDate(v.endDate)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${v.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {v.isActive ? 'Hoạt động' : 'Tắt'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    Chưa có mã giảm giá. Tạo mã tại API /vouchers (POST).
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
