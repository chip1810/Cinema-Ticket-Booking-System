import apiClient from '../api/apiClient';

export const adminService = {
    // Users (khách hàng)
    getUsers: () => apiClient.get('/admin/users'),
    blockUser: (id) => apiClient.patch(`/admin/users/${id}/block`),

    // Staff
    getStaff: () => apiClient.get('/admin/staff'),
    createStaff: (data) => apiClient.post('/admin/staff', data),

    // Branches (chi nhánh rạp)
    getBranches: () => apiClient.get('/admin/branches'),
    createBranch: (data) => apiClient.post('/admin/branches', data),
    updateBranch: (id, data) => apiClient.put(`/admin/branches/${id}`, data),

    // Vouchers (BE: /api/vouchers)
    getVouchers: () => apiClient.get('/vouchers'),
    createVoucher: (data) => apiClient.post('/vouchers', data),
    updateVoucher: (uuid, data) => apiClient.put(`/vouchers/${uuid}`, data),
    deleteVoucher: (uuid) => apiClient.delete(`/vouchers/${uuid}`),

    // Reports
    getMovieRevenue: () => apiClient.get('/admin/reports/movies'),
    getCinemaRevenue: () => apiClient.get('/admin/reports/cinemas'),
    getTopCustomers: (limit = 10) => apiClient.get('/admin/reports/customers/top', { params: { limit } }),

    // Export (trả file, dùng responseType: 'blob')
    exportMovieRevenue: () =>
        apiClient.get('/admin/export/reports/movies', { responseType: 'blob' }),

    // System Settings
    getSystemSettings: () => apiClient.get('/admin/system-settings'),
    updateSystemSettings: (data) => apiClient.put('/admin/system-settings', data),
};
