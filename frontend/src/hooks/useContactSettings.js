import { useEffect, useState } from 'react';
import { contactSettingsService } from '@/services/contactSettingsService';

export const useContactSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const handleUpdate = (event) => {
            if (active) setSettings(event.detail);
        };

        window.addEventListener('contact-settings:updated', handleUpdate);

        contactSettingsService.getPublic()
            .then((value) => {
                if (active) setSettings(value);
            })
            .catch(() => {
                if (active) setSettings(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            window.removeEventListener('contact-settings:updated', handleUpdate);
        };
    }, []);

    return { settings, loading };
};