import api from './api';

export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    changePassword: (data) => api.put('/users/password', data),
    getBookings: (page = 1, limit = 10) => api.get(`/bookings/my?page=${page}&limit=${limit}`),
    cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
    deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
};