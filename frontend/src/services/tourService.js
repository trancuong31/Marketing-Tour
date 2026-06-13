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
    getAll: (params) => api.get('/tours', { params }),
    getPickupLocations: () => api.get('/tours/pickup-locations'),
    getBySlug: (slug) => api.get(`/tours/${slug}`),
    getVotes: (id) => api.get(`/tours/${id}/votes`),
    getFeaturedVotes: () => api.get('/tours/featured-reviews'),
    likeVote: (id) => api.post(`/tours/votes/${id}/like`),
    createVote: (id, formData) => api.post(`/tours/${id}/votes`, formData),
    deleteVote: (id) => api.delete(`/tours/votes/${id}`),
    checkVoteEligibility: (id) => api.get(`/tours/${id}/vote-eligibility`),
};

// ══════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════
export const bookingService = {
    create: (data) => api.post('/bookings', data),
    getHistory: (params) => api.get('/bookings/my', { params }), // For logged in users
    lookup: (params) => api.get('/bookings/lookup', { params }), // For lookup public guest
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
// NOTIFICATIONS
// ══════════════════════════════════════
export const notificationService = {
    getAll: () => api.get('/notifications'),
    markAsRead: () => api.patch('/notifications/mark-as-read'),
    markOneAsRead: (id) => api.patch(`/notifications/${id}/mark-as-read`),
};

// ══════════════════════════════════════
// ADMIN
// ══════════════════════════════════════
export const adminService = {
    login: (data) => api.post('/admin/login', data),

    // Tours
    getTours: (params) => api.get('/admin/tours', { params }),
    getTourById: (id) => api.get(`/admin/tours/${id}`),
    createTour: (formData) => api.post('/admin/tours', formData),
    updateTour: (id, formData) => api.put(`/admin/tours/${id}`, formData),
    deleteTour: (id) => api.delete(`/admin/tours/${id}`),
    deleteTourImage: (id) => api.delete(`/admin/tour-images/${id}`),

    // Bookings
    getBookingOverview: () => api.get('/admin/bookings/overview'),
    getBookings: (params) => api.get('/admin/bookings', { params }),
    updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),
    deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),

    // Votes
    getVotes: (params) => api.get('/admin/votes', { params }), // updated to accept full params
    updateVote: (id, data) => api.put(`/admin/votes/${id}`, data),
    replyToVote: (id, reply) => api.post(`/admin/votes/${id}/reply`, { reply }),
    deleteVote: (id) => api.delete(`/admin/votes/${id}`),
    getTopRatedTours: (params) => api.get('/admin/votes/top', { params }),
    getReviewStats: (params) => api.get('/admin/votes/stats', { params }),

    // Guides
    getGuides: () => api.get('/admin/guides'),
    createGuide: (data) => api.post('/admin/guides', data),
    updateGuide: (id, data) => api.put(`/admin/guides/${id}`, data),

    // Banners
    getBanners: () => api.get('/admin/banners'),
    createBanner: (formData) => api.post('/admin/banners', formData),
    updateBanner: (id, formData) => api.put(`/admin/banners/${id}`, formData),
    deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
};
