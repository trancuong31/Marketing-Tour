const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

const guideDir = path.join(__dirname, '../../uploads/guides');
if (!fs.existsSync(guideDir)) {
    fs.mkdirSync(guideDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, guideDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `guide-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (env.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
    }

    cb(new AppError('Chỉ cho phép upload file ảnh (jpg, png, webp, gif)', HTTP_CODES.BAD_REQUEST), false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxSize,
        files: 1,
    },
});
