const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, deleteMyBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/auth');

// Tạo booking (guest hoặc login)
router.post('/', createBooking);

// Lấy booking của user login + chi tiết tour
router.get('/my', authenticate, getMyBookings);

// Hủy booking nếu pending
router.put('/:bookingId/cancel', authenticate, cancelBooking);

// Xóa booking
router.delete('/:bookingId', authenticate, deleteMyBooking);

module.exports = router;