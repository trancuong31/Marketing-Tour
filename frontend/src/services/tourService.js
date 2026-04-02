import api from './api';

// ══════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════
export const categoryService = {
    getAll: () => api.get('/categories'),
};

// ══════════════════════════════════════
// TOURS
// ══════════════════════════════════════
export const tourService = {
    getAll: (type) => api.get('/tours', { params: type ? { type } : {} }),
    getBySlug: (slug) => api.get(`/tours/${slug}`),
    getVotes: (id) => api.get(`/tours/${id}/votes`),
    createVote: (id, data) => api.post(`/tours/${id}/votes`, data),
};

// ══════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════
export const bookingService = {
    create: (data) => api.post('/bookings', data),
    getHistory: (params) => api.get('/bookings/history', { params }),
};

// ══════════════════════════════════════
// GUIDES
// ══════════════════════════════════════
export const guideService = {
    getAll: () => api.get('/guides'),
    getBySlug: (slug) => api.get(`/guides/${slug}`),
};

// ══════════════════════════════════════
// BANNERS (Public)
// ══════════════════════════════════════
export const bannerService = {
    getByPosition: (position) => api.get('/banners', { params: position ? { position } : {} }),
};

// ══════════════════════════════════════
// ADMIN
// ══════════════════════════════════════
export const adminService = {
    login: (data) => api.post('/admin/login', data),

    // Tours
    getTours: () => api.get('/admin/tours'),
    getTourById: (id) => api.get(`/admin/tours/${id}`),
    createTour: (formData) => api.post('/admin/tours', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateTour: (id, formData) => api.put(`/admin/tours/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteTour: (id) => api.delete(`/admin/tours/${id}`),
    deleteTourImage: (id) => api.delete(`/admin/tour-images/${id}`),

    // Bookings
    getBookings: (status) => api.get('/admin/bookings', { params: status ? { status } : {} }),
    updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),

    // Votes
    getVotes: (approved) => api.get('/admin/votes', { params: approved !== undefined ? { approved } : {} }),
    updateVote: (id, data) => api.put(`/admin/votes/${id}`, data),

    // Guides
    getGuides: () => api.get('/admin/guides'),
    createGuide: (data) => api.post('/admin/guides', data),
    updateGuide: (id, data) => api.put(`/admin/guides/${id}`, data),

    // Banners
    getBanners: () => api.get('/admin/banners'),
    createBanner: (formData) => api.post('/admin/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateBanner: (id, formData) => api.put(`/admin/banners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
};
