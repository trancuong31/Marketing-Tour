import { useEffect, useState, useCallback, useMemo } from 'react';
import { footerLinkService } from '@/services/footerLinkService';

export const useFooterLinks = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLinks = useCallback(async () => {
        try {
            const data = await footerLinkService.getPublic();
            setLinks(Array.isArray(data) ? data : []);
        } catch {
            setLinks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const handleUpdate = () => {
            if (active) {
                footerLinkService.clearCache();
                fetchLinks();
            }
        };

        window.addEventListener('footer-links:updated', handleUpdate);
        fetchLinks();

        return () => {
            active = false;
            window.removeEventListener('footer-links:updated', handleUpdate);
        };
    }, [fetchLinks]);

    const column1 = useMemo(() => links.filter((l) => Number(l.column_position) === 1), [links]);
    const column2 = useMemo(() => links.filter((l) => Number(l.column_position) === 2), [links]);
    const column3 = useMemo(() => links.filter((l) => Number(l.column_position) === 3), [links]);

    return {
        links,
        column1,
        column2,
        column3,
        loading,
        refetch: fetchLinks,
    };
};
