const { Booking, Tour } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const crypto = require('crypto');

/**
 * Tạo sinh booking_code duy nhất
 */
const generateBookingCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BK${timestamp}${random}`;
};

/**
 * Đặt tour mới
 * POST /api/bookings
 */
const createBooking = catchAsync(async (req, res, next) => {
    const { tour_id, customer_name, customer_phone, customer_email, number_of_people, customer_note } = req.body;

    // Kiểm tra tour tồn tại và active
    const tour = await Tour.findOne({ where: { id: tour_id, status: 'active' } });
    if (!tour) {
        return next(new AppError('Tour không tồn tại hoặc đã ngừng', HTTP_CODES.NOT_FOUND));
    }

    // Tạo booking_code duy nhất
    let bookingCode = generateBookingCode();
    let existing = await Booking.findOne({ where: { booking_code: bookingCode } });
    while (existing) {
        bookingCode = generateBookingCode();
        existing = await Booking.findOne({ where: { booking_code: bookingCode } });
    }

    const booking = await Booking.create({
        tour_id,
        booking_code: bookingCode,
        customer_name,
        customer_phone,
        customer_email,
        number_of_people: number_of_people || 1,
        customer_note: customer_note || null,
        status: 'pending',
    });

    res.status(201).json({
        status: 'success',
        message: 'Đặt tour thành công!',
        data: {
            booking_code: booking.booking_code,
            tour_title: tour.title,
            customer_name: booking.customer_name,
            number_of_people: booking.number_of_people,
            status: booking.status,
        },
    });
});

/**
 * Tra cứu lịch sử đặt tour
 * GET /api/bookings/history?phone=xxx&email=yyy
 */
const getBookingHistory = catchAsync(async (req, res, next) => {
    const { phone, email } = req.query;

    if (!phone && !email) {
        return next(new AppError('Vui lòng nhập số điện thoại hoặc email để tra cứu', HTTP_CODES.BAD_REQUEST));
    }

    const whereClause = {};
    if (phone) whereClause.customer_phone = phone;
    if (email) whereClause.customer_email = email;

    const bookings = await Booking.findAll({
        where: whereClause,
        include: [
            { model: Tour, attributes: ['id', 'title', 'slug', 'thumbnail_url', 'price_adult', 'sale_price_adult'] },
        ],
        attributes: {
            exclude: ['admin_note'], // Ẩn ghi chú admin khỏi client
        },
        order: [['created_at', 'DESC']],
    });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: bookings,
    });
});

module.exports = { createBooking, getBookingHistory };
