const {
    Booking,
    Tour,
    TourDeparture,
    TourPickupLocation,
    TourOption,
    BookingOption,
    Notification,
    TourTranslation,
} = require('../models');
const { sequelize } = require('../config/database');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { normalizeLanguage } = require('../utils/language');
const { getNotificationCopy } = require('../utils/notificationMessages');
const crypto = require('crypto');

// Sinh booking code duy nhất
const generateBookingCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `BK${timestamp}${random}`;
};

const getTourInclude = (language) => ({
    model: Tour,
    attributes: ['id', 'title', 'slug', 'status', 'duration_days', 'duration_nights'],
    include: [
        {
            model: TourTranslation,
            as: 'translations',
            attributes: ['title', 'slug'],
            where: { language },
            required: false,
        },
    ],
});

const mapTranslatedTour = (tour) => {
    if (!tour) return null;

    const translation = tour.translations?.[0];

    return {
        id: tour.id,
        title: translation?.title || tour.title,
        slug: translation?.slug || tour.slug,
        status: tour.status,
        duration_days: tour.duration_days,
        duration_nights: tour.duration_nights,
    };
};

const getTranslatedTourTitle = async (tour, language) => {
    if (!tour || language === 'vi') return tour?.title || '';

    const translation = await TourTranslation.findOne({
        where: { tour_id: tour.id, language },
        attributes: ['title'],
    });

    return translation?.title || tour.title;
};

// --------- Tạo booking ---------
const createBooking = catchAsync(async (req, res) => {
    const {
        tour_id, departure_id, pickup_location_id,
        customer_name, customer_phone, customer_email,
        adult_qty, child_qty, infant_qty,
        customer_note, selected_options,
    } = req.body;

    // 1. Validate tour
    const tour = await Tour.findOne({ where: { id: tour_id, status: 'active' } });
    if (!tour) throw new AppError('Tour không tồn tại hoặc đã ngừng', HTTP_CODES.NOT_FOUND);

    // 2. Validate departure
    const departure = await TourDeparture.findOne({
        where: { id: departure_id, tour_id, status: 'open' },
    });

    // validate user đã booking departure này chưa
    const userId = req.user?.id;
    if (userId && await Booking.findOne({ where: { user_id: userId, departure_id, status: ['pending', 'approved'] } })) {
        throw new AppError('Bạn đã có yêu cầu đặt tour cho ngày khởi hành này. Vui lòng kiểm tra lại lịch sử đặt tour của bạn.', HTTP_CODES.BAD_REQUEST);
    }
    if (!departure) throw new AppError('Ngày khởi hành không hợp lệ hoặc đã đóng', HTTP_CODES.BAD_REQUEST);

    // 3. Validate seats
    const totalPassengers = (parseInt(adult_qty) || 1) + (parseInt(child_qty) || 0) + (parseInt(infant_qty) || 0);
    if (departure.available_seats > 0 && totalPassengers > departure.available_seats) {
        throw new AppError(`Chỉ còn ${departure.available_seats} chỗ trống`, HTTP_CODES.BAD_REQUEST);
    }


    // 4. Validate pickup (optional)
    let pickupSurcharge = 0;
    let pickupRecord = null;
    if (pickup_location_id) {
        pickupRecord = await TourPickupLocation.findOne({
            where: { id: pickup_location_id, tour_id },
        });
        if (!pickupRecord) throw new AppError('Điểm đón không hợp lệ', HTTP_CODES.BAD_REQUEST);
        pickupSurcharge = parseFloat(pickupRecord.surcharge_amount) || 0;
    }

    // 5. Tính giá gốc từ departure
    const adults = parseInt(adult_qty) || 1;
    const children = parseInt(child_qty) || 0;
    const infants = parseInt(infant_qty) || 0;

    let totalPrice = (adults * parseFloat(departure.price_adult))
        + (children * parseFloat(departure.price_child || 0))
        + (infants * parseFloat(departure.price_infant || 0));

    // Cộng phụ thu điểm đón (per person)
    totalPrice += pickupSurcharge * totalPassengers;

    // 6. Xử lý options
    const parsedOptions = Array.isArray(selected_options) ? selected_options : [];
    const optionRecords = [];

    if (parsedOptions.length > 0) {
        const tourOptions = await TourOption.findAll({ where: { tour_id } });
        const optionMap = new Map(tourOptions.map(o => [o.id, o]));

        for (const sel of parsedOptions) {
            const opt = optionMap.get(parseInt(sel.option_id));
            if (!opt) continue;

            const qty = parseInt(sel.quantity) || 1;
            let optionTotal = 0;

            if (opt.charge_type === 'per_person') {
                optionTotal = parseFloat(opt.price) * totalPassengers;
            } else if (opt.charge_type === 'per_booking') {
                optionTotal = parseFloat(opt.price);
            } else {
                // quantity
                optionTotal = parseFloat(opt.price) * qty;
            }

            totalPrice += optionTotal;
            optionRecords.push({
                option_name: opt.option_name,
                price: parseFloat(opt.price),
                quantity: opt.charge_type === 'per_person' ? totalPassengers : (opt.charge_type === 'per_booking' ? 1 : qty),
                total: optionTotal,
            });
        }
    }

    // 7. Sinh booking code
    let bookingCode = generateBookingCode();
    while (await Booking.findOne({ where: { booking_code: bookingCode } })) {
        bookingCode = generateBookingCode();
    }

    // 8. Lấy user_id (nếu có user từ middleware optionalAuthenticate)
    const user_id = req.user ? req.user.id : null;
    const language = normalizeLanguage(req.language || req.body.language || req.user?.language);

    // 9. Tạo booking + options trong transaction
    const booking = await sequelize.transaction(async (t) => {
        const newBooking = await Booking.create({
            user_id,
            tour_id,
            departure_id,
            pickup_location_id: pickup_location_id || null,
            booking_code: bookingCode,
            customer_name,
            customer_phone,
            customer_email,
            adult_qty: adults,
            child_qty: children,
            infant_qty: infants,
            customer_note: customer_note || null,
            language,
            status: 'pending',
            total_price: totalPrice,
            // Snapshot fields
            tour_title_snapshot: tour.title,
            departure_date_snapshot: departure.departure_date,
            adult_price_snapshot: parseFloat(departure.price_adult),
            child_price_snapshot: parseFloat(departure.price_child || 0),
            infant_price_snapshot: parseFloat(departure.price_infant || 0),
            pickup_location_snapshot: pickupRecord ? pickupRecord.location_name : null,
            pickup_price_snapshot: pickupSurcharge || null,
        }, { transaction: t });

        // Giảm số chỗ trống
        if (departure.available_seats > 0) {
            const newSeats = departure.available_seats - totalPassengers;
            await departure.update({
                available_seats: newSeats,
                status: newSeats === 0 ? 'full' : 'open'
            }, { transaction: t });
        }

        if (optionRecords.length > 0) {
            await BookingOption.bulkCreate(
                optionRecords.map(r => ({ ...r, booking_id: newBooking.id })),
                { transaction: t },
            );
        }

        return newBooking;
    });

    // 10. Tạo thông báo cho user (nếu có user_id)
    if (user_id) {
        const notificationCopy = getNotificationCopy(language);
        const notificationTourTitle = await getTranslatedTourTitle(tour, language);

        await Notification.create({
            user_id: user_id,
            type: 'booking',
            sender_name: notificationCopy.system,
            message: notificationCopy.bookingCreated(notificationTourTitle),
            related_id: booking.id,
            related_slug: tour.slug
        });
    }

    res.status(201).json({
        status: 'success',
        message: 'Đặt tour thành công!',
        data: {
            bookingId: booking.id,
            bookingCode: booking.booking_code,
            tourTitle: tour.title,
            customerName: booking.customer_name,
            totalPrice: booking.total_price,
            status: booking.status,
        },
    });
});

// --------- Lấy lịch sử booking theo user login ---------
const getMyBookings = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const language = req.language || 'vi';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
        where: { user_id: userId },
        distinct: true,
        col: 'id',
        include: [
            getTourInclude(language),
            { model: TourDeparture, as: 'departure', attributes: ['id', 'departure_date', 'price_adult'] },
            { model: TourPickupLocation, as: 'pickupLocation', attributes: ['location_name'] },
            { model: BookingOption, as: 'bookingOptions' },
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
        adult_qty: b.adult_qty,
        child_qty: b.child_qty,
        infant_qty: b.infant_qty,
        total_price: b.total_price,
        customer_note: b.customer_note,
        language: b.language,
        review_email_sent_at: b.review_email_sent_at,
        status: b.status,
        created_at: b.created_at,
        
        // Legacy fields for backward compatibility with frontend
        adult_count: b.adult_qty,
        child_count: b.child_qty,
        infant_count: b.infant_qty,
        departure_date: b.departure?.departure_date || b.departure_date_snapshot || null,

        // Snapshot fields
        tour_title_snapshot: b.tour_title_snapshot,
        departure_date_snapshot: b.departure_date_snapshot,
        adult_price_snapshot: b.adult_price_snapshot,
        child_price_snapshot: b.child_price_snapshot,
        infant_price_snapshot: b.infant_price_snapshot,
        pickup_location_snapshot: b.pickup_location_snapshot,
        pickup_price_snapshot: b.pickup_price_snapshot,

        tour: mapTranslatedTour(b.Tour),
        departure: b.departure ? {
            id: b.departure.id,
            departure_date: b.departure.departure_date,
            price_adult: b.departure.price_adult,
        } : null,
        pickupLocation: b.pickupLocation ? {
            location_name: b.pickupLocation.location_name
        } : null,
        bookingOptions: b.bookingOptions || [],
    }));

    res.status(200).json({
        status: 'success',
        results: data.length,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalItems: count,
        data,
    });
});

// --------- Hủy booking nếu pending ---------
const cancelBooking = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) throw new AppError('Booking không tồn tại!', HTTP_CODES.NOT_FOUND);
    if (booking.status !== 'pending') throw new AppError('Chỉ có thể hủy booking đang chờ xử lý!', HTTP_CODES.BAD_REQUEST);

    await sequelize.transaction(async (t) => {
        booking.status = 'cancelled';
        await booking.save({ transaction: t });

        // Khôi phục chỗ trống
        const departure = await TourDeparture.findByPk(booking.departure_id, { transaction: t });
        if (departure) {
            // Chỉ khôi phục nếu lúc đầu có giới hạn chỗ (không phải là unlimited: 0/open từ đầu)
            const isLimited = departure.available_seats > 0 || departure.status === 'full';
            if (isLimited) {
                const totalPassengers = (booking.adult_qty || 0) + (booking.child_qty || 0) + (booking.infant_qty || 0);
                const newSeats = departure.available_seats + totalPassengers;
                await departure.update({
                    available_seats: newSeats,
                    status: 'open'
                }, { transaction: t });
            }
        }
    });

    res.status(200).json({
        status: 'success',
        message: 'Hủy booking thành công',
        bookingId: booking.id,
        newStatus: booking.status,
    });
});

// --------- Xóa booking ---------
const deleteMyBooking = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ where: { id: bookingId, user_id: userId } });
    if (!booking) throw new AppError('Booking không tồn tại', HTTP_CODES.NOT_FOUND);

    await booking.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa booking thành công',
    });
});

// --------- Tra cứu booking (Public) ---------
const lookupBooking = catchAsync(async (req, res, next) => {
    const { email, phone } = req.query;
    const language = req.language || 'vi';

    if (!email || !phone) {
        return next(new AppError('Vui lòng cung cấp đầy đủ email và số điện thoại.', HTTP_CODES.BAD_REQUEST));
    }

    const bookings = await Booking.findAll({
        where: {
            customer_email: email,
            customer_phone: phone,
        },
        include: [
            getTourInclude(language),
            { model: TourDeparture, as: 'departure', attributes: ['id', 'departure_date', 'price_adult'] },
            { model: TourPickupLocation, as: 'pickupLocation', attributes: ['location_name'] },
            { model: BookingOption, as: 'bookingOptions' },
        ],
        order: [[sequelize.col('Booking.created_at'), 'DESC']],
    });

    const data = bookings.map(b => ({
        id: b.id,
        booking_code: b.booking_code,
        customer_name: b.customer_name,
        customer_phone: b.customer_phone,
        customer_email: b.customer_email,
        adult_qty: b.adult_qty,
        child_qty: b.child_qty,
        infant_qty: b.infant_qty,
        total_price: b.total_price,
        customer_note: b.customer_note,
        language: b.language,
        review_email_sent_at: b.review_email_sent_at,
        status: b.status,
        created_at: b.created_at,
        
        // Legacy fields mapping
        adult_count: b.adult_qty,
        child_count: b.child_qty,
        infant_count: b.infant_qty,
        departure_date: b.departure?.departure_date || b.departure_date_snapshot || null,

        // Snapshot fields
        tour_title_snapshot: b.tour_title_snapshot,
        departure_date_snapshot: b.departure_date_snapshot,
        adult_price_snapshot: b.adult_price_snapshot,
        child_price_snapshot: b.child_price_snapshot,
        infant_price_snapshot: b.infant_price_snapshot,
        pickup_location_snapshot: b.pickup_location_snapshot,
        pickup_price_snapshot: b.pickup_price_snapshot,

        tour: mapTranslatedTour(b.Tour),
        departure: b.departure ? {
            id: b.departure.id,
            departure_date: b.departure.departure_date,
            price_adult: b.departure.price_adult,
        } : null,
        pickupLocation: b.pickupLocation ? {
            location_name: b.pickupLocation.location_name
        } : null,
        bookingOptions: b.bookingOptions || [],
    }));

    res.status(200).json({
        status: 'success',
        results: data.length,
        data,
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    deleteMyBooking,
    lookupBooking,
};
