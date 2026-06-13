const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, deleteMyBooking, lookupBooking } = require('../controllers/bookingController');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth');

// Tạo booking
router.post('/', optionalAuthenticate, createBooking);

// Tra cứu booking
router.get('/lookup', lookupBooking);

// Lấy booking của user login + chi tiết tour
router.get('/my', authenticate, getMyBookings);

// Hủy booking nếu pending
router.put('/:bookingId/cancel', authenticate, cancelBooking);

// Xóa booking
router.delete('/:bookingId', authenticate, deleteMyBooking);

module.exports = router;