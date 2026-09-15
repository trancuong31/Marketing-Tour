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
const { Op } = require('sequelize');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const { normalizeLanguage } = require('../utils/language');
const { getNotificationCopy } = require('../utils/notificationMessages');
const { getTodayDateString } = require('../utils/date');
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

const getPassengerCount = (booking) =>
  Number(booking.adult_qty || 0) + Number(booking.child_qty || 0) + Number(booking.infant_qty || 0);

// --------- Tạo booking ---------
const createBooking = catchAsync(async (req, res) => {
  const {
    tour_id,
    departure_id,
    pickup_location_id,
    customer_name,
    customer_phone,
    customer_email,
    adult_qty,
    child_qty,
    infant_qty,
    customer_note,
    selected_options,
  } = req.body;

  // 1. Chuẩn hóa & Validate số lượng khách (Đảm bảo không bao giờ âm - Fix Issue 4)
  const adults = Math.max(1, parseInt(adult_qty, 10) || 1);
  const children = Math.max(0, parseInt(child_qty, 10) || 0);
  const infants = Math.max(0, parseInt(infant_qty, 10) || 0);
  const totalPassengers = adults + children + infants;

  // 2. Validate tour active
  const tour = await Tour.findOne({ where: { id: tour_id, status: 'active' } });
  if (!tour) throw new AppError('Tour không tồn tại hoặc đã ngừng', HTTP_CODES.NOT_FOUND);

  // 3. Check duplicate active booking (Fix Issue 5 - cả user đã đăng nhập & khách vãng lai)
  const userId = req.user?.id;
  const normEmail = customer_email ? customer_email.toLowerCase().trim() : '';
  const normPhone = customer_phone ? customer_phone.trim() : '';

  let existingBooking = null;
  if (userId) {
    existingBooking = await Booking.findOne({
      where: { user_id: userId, departure_id, status: ['pending', 'approved'] },
    });
  } else if (normEmail || normPhone) {
    existingBooking = await Booking.findOne({
      where: {
        departure_id,
        status: ['pending', 'approved'],
        [Op.or]: [{ customer_email: normEmail }, { customer_phone: normPhone }],
      },
    });
  }

  if (existingBooking) {
    throw new AppError(
      'Bạn hoặc thông tin liên hệ này đã có đơn đặt tour cho ngày khởi hành này. Vui lòng kiểm tra lại đơn hàng.',
      HTTP_CODES.BAD_REQUEST
    );
  }

  // 4. Validate pickup location (nếu có)
  let pickupSurcharge = 0;
  let pickupRecord = null;
  if (pickup_location_id) {
    pickupRecord = await TourPickupLocation.findOne({
      where: { id: pickup_location_id, tour_id },
    });
    if (!pickupRecord)
      throw new AppError('Điểm đón không hợp lệ cho tour này', HTTP_CODES.BAD_REQUEST);
    pickupSurcharge = parseFloat(pickupRecord.surcharge_amount) || 0;
  }

  // 5. Xử lý options & tính tổng giá sơ bộ
  const parsedOptions = Array.isArray(selected_options) ? selected_options : [];
  const optionRecords = [];
  let optionsTotalPrice = 0;

  if (parsedOptions.length > 0) {
    const tourOptions = await TourOption.findAll({ where: { tour_id } });
    const optionMap = new Map(tourOptions.map((o) => [o.id, o]));

    for (const sel of parsedOptions) {
      const opt = optionMap.get(parseInt(sel.option_id, 10));
      if (!opt) continue;

      const qty = Math.max(1, parseInt(sel.quantity, 10) || 1);
      let optionTotal = 0;

      if (opt.charge_type === 'per_person') {
        optionTotal = parseFloat(opt.price) * totalPassengers;
      } else if (opt.charge_type === 'per_booking') {
        optionTotal = parseFloat(opt.price);
      } else {
        optionTotal = parseFloat(opt.price) * qty;
      }

      optionsTotalPrice += optionTotal;
      optionRecords.push({
        option_name: opt.option_name,
        price: parseFloat(opt.price),
        quantity:
          opt.charge_type === 'per_person'
            ? totalPassengers
            : opt.charge_type === 'per_booking'
              ? 1
              : qty,
        total: optionTotal,
      });
    }
  }

  // 6. Sinh booking code duy nhất
  let bookingCode = generateBookingCode();
  while (await Booking.findOne({ where: { booking_code: bookingCode } })) {
    bookingCode = generateBookingCode();
  }

  const language = normalizeLanguage(req.language || req.body.language || req.user?.language);

  const todayStr = getTodayDateString();

  // 7. THỰC THI TRANSACTION VỚI ROW-LOCKING (FOR UPDATE) - (Fix Issue 1 & Issue 2)
  const booking = await sequelize.transaction(async (t) => {
    // Query TourDeparture VỚI LOCK.UPDATE bên trong transaction
    const departure = await TourDeparture.findOne({
      where: { id: departure_id, tour_id, status: 'open' },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!departure) {
      throw new AppError('Ngày khởi hành không hợp lệ hoặc đã đóng', HTTP_CODES.BAD_REQUEST);
    }

    // KIỂM TRA NGÀY KHỞI HÀNH KHÔNG ĐƯỢC Ở TRONG QUÁ KHỨ (Fix Issue 12)
    if (departure.departure_date < todayStr) {
      throw new AppError(
        'Ngày khởi hành này đã trôi qua, không thể đặt tour',
        HTTP_CODES.BAD_REQUEST
      );
    }

    // KIỂM TRA SỐ CHỖ CHUẨN XÁC VỚI DB TRANSACTION + ROW LOCK (FOR UPDATE)
    const reservedSeatsSum = await Booking.sum(
      sequelize.literal('adult_qty + child_qty + infant_qty'),
      {
        where: {
          departure_id: departure.id,
          status: { [Op.in]: ['pending', 'approved'] },
        },
        transaction: t,
      }
    );
    const reservedSeats = Number(reservedSeatsSum) || 0;
    const actualAvailableSeats = Math.max(0, Number(departure.capacity) - reservedSeats);

    if (actualAvailableSeats <= 0 || totalPassengers > actualAvailableSeats) {
      throw new AppError(
        'Không đủ chỗ cho số lượng khách bạn đã chọn. Vui lòng giảm số lượng khách hoặc chọn ngày khởi hành khác.',
        HTTP_CODES.CONFLICT
      );
    }

    // Tính tổng giá đơn hàng chính xác
    const basePrice =
      adults * parseFloat(departure.price_adult) +
      children * parseFloat(departure.price_child || 0) +
      infants * parseFloat(departure.price_infant || 0);

    const totalPrice = basePrice + pickupSurcharge * totalPassengers + optionsTotalPrice;

    // Trừ chỗ & cập nhật status nếu hết chỗ
    const newSeats = actualAvailableSeats - totalPassengers;
    await departure.update(
      {
        available_seats: newSeats,
        status: newSeats === 0 ? 'full' : 'open',
      },
      { transaction: t }
    );

    // Tạo đơn đặt
    const newBooking = await Booking.create(
      {
        user_id: userId || null,
        tour_id,
        departure_id,
        pickup_location_id: pickup_location_id || null,
        booking_code: bookingCode,
        customer_name,
        customer_phone: normPhone,
        customer_email: normEmail,
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
      },
      { transaction: t }
    );

    // Tạo booking options
    if (optionRecords.length > 0) {
      await BookingOption.bulkCreate(
        optionRecords.map((r) => ({ ...r, booking_id: newBooking.id })),
        { transaction: t }
      );
    }

    return newBooking;
  });

  // 8. Tạo thông báo cho user (nếu có user_id)
  if (userId) {
    const notificationCopy = getNotificationCopy(language);
    const notificationTourTitle = await getTranslatedTourTitle(tour, language);

    await Notification.create({
      user_id: userId,
      type: 'booking',
      sender_name: notificationCopy.system,
      message: notificationCopy.bookingCreated(notificationTourTitle),
      related_id: booking.id,
      related_slug: tour.slug,
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
      {
        model: TourDeparture,
        as: 'departure',
        attributes: ['id', 'departure_date', 'price_adult'],
      },
      { model: TourPickupLocation, as: 'pickupLocation', attributes: ['location_name'] },
      { model: BookingOption, as: 'bookingOptions' },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const data = bookings.map((b) => ({
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
    departure: b.departure
      ? {
        id: b.departure.id,
        departure_date: b.departure.departure_date,
        price_adult: b.departure.price_adult,
      }
      : null,
    pickupLocation: b.pickupLocation
      ? {
        location_name: b.pickupLocation.location_name,
      }
      : null,
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

  const booking = await sequelize.transaction(async (t) => {
    const lockedBooking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!lockedBooking) throw new AppError('Booking không tồn tại!', HTTP_CODES.NOT_FOUND);
    if (lockedBooking.status !== 'pending') {
      throw new AppError('Chỉ có thể hủy booking đang chờ xử lý!', HTTP_CODES.BAD_REQUEST);
    }

    const departure = await TourDeparture.findByPk(lockedBooking.departure_id, {
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!departure) {
      throw new AppError('Không tìm thấy lịch khởi hành của booking', HTTP_CODES.BAD_REQUEST);
    }

    const restoredSeats = Math.min(
      Number(departure.capacity),
      Number(departure.available_seats) + getPassengerCount(lockedBooking)
    );
    await departure.update(
      {
        available_seats: restoredSeats,
        status: restoredSeats === 0 ? 'full' : 'open',
      },
      { transaction: t }
    );

    await lockedBooking.update({ status: 'cancelled' }, { transaction: t });
    return lockedBooking;
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

  await sequelize.transaction(async (t) => {
    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!booking) throw new AppError('Booking không tồn tại', HTTP_CODES.NOT_FOUND);
    if (booking.status !== 'cancelled') {
      throw new AppError('Chỉ có thể xóa cứng booking đã hủy', HTTP_CODES.BAD_REQUEST);
    }

    await booking.destroy({ transaction: t });
  });

  res.status(200).json({
    status: 'success',
    message: 'Xóa booking thành công',
  });
});

// --------- Tra cứu booking (Public) ---------
const lookupBooking = catchAsync(async (req, res, next) => {
  const { booking_code, bookingCode, email, phone } = req.query;
  const rawCode = booking_code || bookingCode;
  const language = req.language || 'vi';

  if (!rawCode || !email || !phone) {
    return next(
      new AppError(
        'Vui lòng cung cấp đầy đủ mã đơn hàng, email và số điện thoại.',
        HTTP_CODES.BAD_REQUEST
      )
    );
  }

  const cleanCode = String(rawCode).trim().toUpperCase();
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanPhone = String(phone).trim();

  if (cleanCode.length < 3 || cleanEmail.length < 5 || cleanPhone.length < 8) {
    return next(new AppError('Thông tin tra cứu không hợp lệ.', HTTP_CODES.BAD_REQUEST));
  }

  const booking = await Booking.findOne({
    where: {
      booking_code: cleanCode,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
    },
    include: [
      getTourInclude(language),
      {
        model: TourDeparture,
        as: 'departure',
        attributes: ['id', 'departure_date', 'price_adult'],
      },
      { model: TourPickupLocation, as: 'pickupLocation', attributes: ['location_name'] },
      { model: BookingOption, as: 'bookingOptions' },
    ],
  });

  if (!booking) {
    return next(new AppError('Không tìm thấy thông tin đơn hàng.', HTTP_CODES.NOT_FOUND));
  }

  const mappedBooking = {
    id: booking.id,
    booking_code: booking.booking_code,
    customer_name: booking.customer_name,
    customer_phone: booking.customer_phone,
    customer_email: booking.customer_email,
    adult_qty: booking.adult_qty,
    child_qty: booking.child_qty,
    infant_qty: booking.infant_qty,
    total_price: booking.total_price,
    customer_note: booking.customer_note,
    language: booking.language,
    review_email_sent_at: booking.review_email_sent_at,
    status: booking.status,
    created_at: booking.created_at,

    // Legacy fields mapping
    adult_count: booking.adult_qty,
    child_count: booking.child_qty,
    infant_count: booking.infant_qty,
    departure_date: booking.departure?.departure_date || booking.departure_date_snapshot || null,

    // Snapshot fields
    tour_title_snapshot: booking.tour_title_snapshot,
    departure_date_snapshot: booking.departure_date_snapshot,
    adult_price_snapshot: booking.adult_price_snapshot,
    child_price_snapshot: booking.child_price_snapshot,
    infant_price_snapshot: booking.infant_price_snapshot,
    pickup_location_snapshot: booking.pickup_location_snapshot,
    pickup_price_snapshot: booking.pickup_price_snapshot,

    tour: mapTranslatedTour(booking.Tour),
    departure: booking.departure
      ? {
        id: booking.departure.id,
        departure_date: booking.departure.departure_date,
        price_adult: booking.departure.price_adult,
      }
      : null,
    pickupLocation: booking.pickupLocation
      ? {
        location_name: booking.pickupLocation.location_name,
      }
      : null,
    bookingOptions: booking.bookingOptions || [],
  };

  res.status(200).json({
    status: 'success',
    results: 1,
    data: [mappedBooking],
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  deleteMyBooking,
  lookupBooking,
};
