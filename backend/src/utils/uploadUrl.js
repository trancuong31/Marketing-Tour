const fs = require('fs');
const path = require('path');

const PUBLIC_UPLOAD_PREFIX = '/uploads/';
const UPLOAD_DIRECTORY = path.resolve(__dirname, '../../uploads');

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

const resolveExistingUploadUrl = (url) => {
    const normalized = normalizePublicUploadUrl(url);
    if (!normalized || !normalized.startsWith(PUBLIC_UPLOAD_PREFIX)) return normalized;

    const relativePath = normalized.slice(PUBLIC_UPLOAD_PREFIX.length);
    const filePath = path.resolve(UPLOAD_DIRECTORY, relativePath);
    if (!filePath.startsWith(`${UPLOAD_DIRECTORY}${path.sep}`)) return normalized;
    if (fs.existsSync(filePath)) return normalized;

    const jpegFilePath = `${filePath}.jpg`;
    if (fs.existsSync(jpegFilePath)) return `${normalized}.jpg`;

    return normalized;
};

module.exports = {
    normalizePublicUploadUrl,
    resolveExistingUploadUrl,
};
