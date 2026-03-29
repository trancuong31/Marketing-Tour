const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

// Đảm bảo thư mục uploads/banners tồn tại
const bannerDir = path.join(__dirname, '../../uploads/banners');
if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bannerDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `banner-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (env.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Chỉ cho phép upload file ảnh (jpg, png, webp, gif)', HTTP_CODES.BAD_REQUEST), false);
    }
};

const uploadBanner = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxSize,
        files: 1,
    },
});

module.exports = uploadBanner;
