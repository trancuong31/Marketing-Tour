const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const env = require('../config/env');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/votes'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `vote-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (env.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Chỉ cho phép upload file ảnh (jpg, png, webp, gif)', HTTP_CODES.BAD_REQUEST), false);
    }
};

const uploadVote = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxSize, // VD: 5MB
        files: 5, // Tối đa 5 ảnh
    },
});

module.exports = uploadVote;
