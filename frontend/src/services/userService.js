import api from './api';

export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    changePassword: (data) => api.put('/users/password', data),
    getBookings: () => api.get('/users/bookings'),
};
