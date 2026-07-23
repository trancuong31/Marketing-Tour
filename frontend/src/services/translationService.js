import api from './api';

export const translationService = {
    getAll: (params) => api.get('/admin/translations', { params }),
    create: (data) => api.post('/admin/translations', data),
    update: (id, data) => api.put(`/admin/translations/${id}`, data),
    remove: (id) => api.delete(`/admin/translations/${id}`),
};
