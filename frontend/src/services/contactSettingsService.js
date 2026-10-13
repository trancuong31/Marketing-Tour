import api from './api';

let publicSettingsCache = null;
let publicSettingsRequest = null;

export const contactSettingsService = {
    getPublic: async () => {
        if (publicSettingsCache) return publicSettingsCache;
        if (publicSettingsRequest) return publicSettingsRequest;

        publicSettingsRequest = api.get('/contact-settings')
            .then((response) => {
                publicSettingsCache = response.data.data;
                return publicSettingsCache;
            })
            .finally(() => {
                publicSettingsRequest = null;
            });

        return publicSettingsRequest;
    },
    getAdmin: () => api.get('/admin/contact-settings'),
    updateAdmin: async (configuration) => {
        const response = await api.put('/admin/contact-settings', configuration);
        publicSettingsCache = response.data.data.configuration;
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('contact-settings:updated', {
                detail: publicSettingsCache,
            }));
        }
        return response;
    },
};