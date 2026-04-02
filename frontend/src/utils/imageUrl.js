export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('blob:')) return url; // Bỏ qua Object URL của file upload
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.');
    const base = isLocal
        ? (import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8888').replace('/api', '')
        : (import.meta.env.VITE_API_URL_PUBLIC || '').replace('/api', '');
    return `${base}${url}`;
};
