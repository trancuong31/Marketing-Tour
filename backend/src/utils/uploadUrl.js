const PUBLIC_UPLOAD_PREFIX = '/uploads/';

const isExternalUrl = (url) => /^https?:\/\//i.test(url);

const normalizePublicUploadUrl = (url) => {
    if (!url || typeof url !== 'string') return url;

    const normalized = url.trim().replace(/\\/g, '/');
    if (isExternalUrl(normalized) || normalized.startsWith(PUBLIC_UPLOAD_PREFIX)) {
        return normalized;
    }

    const uploadIndex = normalized.indexOf(PUBLIC_UPLOAD_PREFIX);
    if (uploadIndex >= 0) {
        return normalized.slice(uploadIndex);
    }

    if (normalized.startsWith('uploads/')) {
        return `/${normalized}`;
    }

    return normalized;
};

module.exports = {
    normalizePublicUploadUrl,
};
