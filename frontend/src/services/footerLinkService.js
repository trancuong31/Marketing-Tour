import api from './api';

let publicLinksCache = null;
let publicLinksRequest = null;

const invalidateCache = () => {
    publicLinksCache = null;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('footer-links:updated'));
    }
};

export const footerLinkService = {
    getPublic: async () => {
        if (publicLinksCache) return publicLinksCache;
        if (publicLinksRequest) return publicLinksRequest;

        publicLinksRequest = api.get('/footer-links')
            .then((response) => {
                publicLinksCache = response.data?.data || [];
                return publicLinksCache;
            })
            .finally(() => {
                publicLinksRequest = null;
            });

        return publicLinksRequest;
    },

    getAdmin: () => api.get('/admin/footer-links'),

    create: async (data) => {
        const response = await api.post('/admin/footer-links', data);
        invalidateCache();
        return response;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/footer-links/${id}`, data);
        invalidateCache();
        return response;
    },

    delete: async (id) => {
        const response = await api.delete(`/admin/footer-links/${id}`);
        invalidateCache();
        return response;
    },

    toggle: async (id) => {
        const response = await api.patch(`/admin/footer-links/${id}/toggle`);
        invalidateCache();
        return response;
    },

    reorder: async (items) => {
        const response = await api.put('/admin/footer-links/reorder', { items });
        invalidateCache();
        return response;
    },

    clearCache: () => {
        invalidateCache();
    },
};
