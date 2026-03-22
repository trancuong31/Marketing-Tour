const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

// Tạo thư mục nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        // req.user.id có từ middleware authenticate
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (env.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Chỉ cho phép upload file ảnh (jpg, png, webp, gif)', HTTP_CODES.BAD_REQUEST), false);
    }
};

const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxSize,
        files: 1, // 1 file ảnh đại diện
    },
});

module.exports = uploadAvatar;
