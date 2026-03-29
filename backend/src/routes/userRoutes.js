const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const uploadAvatar = require('../middlewares/uploadAvatar');

// Bắt buộc đăng nhập
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', uploadAvatar.single('avatar'), userController.updateProfile);

// Password
router.put('/password', userController.changePassword);

module.exports = router;