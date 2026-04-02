const { Booking, Tour } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Sinh booking code duy nhất
const generateBookingCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BK${timestamp}${random}`;
};

// --------- Tạo booking mới ---------
const createBooking = catchAsync(async (req, res) => {
    const {
        tour_id, customer_name, customer_phone, customer_email,
        number_of_people, customer_note,
        departure_date, adult_count, child_count, infant_count, total_price
    } = req.body;

    const tour = await Tour.findOne({ where: { id: tour_id, status: 'active' } });
    if (!tour) throw new AppError('Tour không tồn tại hoặc đã ngừng', HTTP_CODES.NOT_FOUND);

    let bookingCode = generateBookingCode();
    while (await Booking.findOne({ where: { booking_code: bookingCode } })) {
        bookingCode = generateBookingCode();
    }

    let user_id = req.user ? req.user.id : null;
    
    if (!user_id && req.headers.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, env.jwt.secret);
            user_id = decoded.id;
        } catch (error) {
            // Bỏ qua nếu token không hợp lệ
        }
    }

    const booking = await Booking.create({
        user_id,
        tour_id,
        booking_code: bookingCode,
        customer_name,
        customer_phone,
        customer_email,
        number_of_people: number_of_people || 1,
        customer_note: customer_note || null,
        departure_date: departure_date || null,
        adult_count: adult_count || 1,
        child_count: child_count || 0,
        infant_count: infant_count || 0,
        total_price: total_price || null,
        status: 'pending',
    });

    res.status(201).json({
        status: 'success',
        message: 'Đặt tour thành công!',
        data: {
            bookingId: booking.id,
            bookingCode: booking.booking_code,
            tourTitle: tour.title,
            customerName: booking.customer_name,
            numberOfPeople: booking.number_of_people,
            status: booking.status
        }
    });
});

// --------- Lấy booking theo user login + chi tiết tour (có phân trang) ---------
const getMyBookings = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
        where: { user_id: userId },
        include: [
            {
                model: Tour,
                attributes: [
                    'id', 'title', 'slug', 'thumbnail_url',
                    'price_adult', 'sale_price_adult',
                    'price_child', 'sale_price_child',
                    'price_infant', 'sale_price_infant',
                    'status'
                ]
            },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
    });

    const data = bookings.map(b => ({
        id: b.id,
        booking_code: b.booking_code,
        customer_name: b.customer_name,
        customer_phone: b.customer_phone,
        customer_email: b.customer_email,
        number_of_people: b.number_of_people,
        customer_note: b.customer_note,
        departure_date: b.departure_date,
        adult_count: b.adult_count,
        child_count: b.child_count,
        infant_count: b.infant_count,
        total_price: b.total_price,
        status: b.status,
        created_at: b.created_at,
        tour: b.Tour ? {
            id: b.Tour.id,
            title: b.Tour.title,
            slug: b.Tour.slug,
            thumbnail_url: b.Tour.thumbnail_url,
            price_adult: b.Tour.price_adult,
            sale_price_adult: b.Tour.sale_price_adult,
            price_child: b.Tour.price_child,
            sale_price_child: b.Tour.sale_price_child,
            price_infant: b.Tour.price_infant,
            sale_price_infant: b.Tour.sale_price_infant,
            status: b.Tour.status
        } : null
    }));

    res.status(200).json({
        status: 'success',
        results: data.length,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data
    });
});

// --------- Hủy booking nếu pending ---------
const cancelBooking = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) throw new AppError('Booking không tồn tại', HTTP_CODES.NOT_FOUND);
    if (booking.status !== 'pending') throw new AppError('Chỉ có thể hủy booking đang chờ', HTTP_CODES.BAD_REQUEST);

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
        status: 'success',
        message: 'Hủy booking thành công',
        bookingId: booking.id,
        newStatus: booking.status
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking
};