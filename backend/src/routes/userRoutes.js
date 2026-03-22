const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const uploadAvatar = require('../middlewares/uploadAvatar');

// Bắt buộc đăng nhập cho các routes bên dưới
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', uploadAvatar.single('avatar'), userController.updateProfile);

// Password
router.put('/password', userController.changePassword);

// Bookings
router.get('/bookings', userController.getBookings);

module.exports = router;
