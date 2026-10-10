// Set test database name BEFORE loading config
process.env.DB_NAME = 'db_marketing_tour_test';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { sequelize } = require('../../src/config/database');
const app = require('../../src/app');

// Models
const {
  User,
  Tour,
  TourDeparture,
  TourPickupLocation,
  TourOption,
  Booking,
  BookingOption,
} = require('../../src/models');

describe('Real Database API Integration & Concurrency Tests (db_marketing_tour_test)', () => {
  let testTour;
  let testDeparture;
  let testPickup;
  let testOption;
  let testUser;
  let userToken;

  beforeAll(async () => {
    // Authenticate and sync isolated test database schema
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // Seed test data in test DB
    testUser = await User.create({
      username: 'testbuyer',
      email: 'buyer@example.com',
      password: 'password123',
      full_name: 'Test Buyer',
      phone_number: '0912345678',
      role: 'user',
    });

    const jwt = require('jsonwebtoken');
    const env = require('../../src/config/env');
    userToken = jwt.sign({ id: testUser.id, role: 'user' }, env.jwt.secret, {
      expiresIn: '1h',
    });

    testTour = await Tour.create({
      title: 'Hanoi Halong Bay Express Tour',
      slug: 'hanoi-halong-bay-express-tour',
      status: 'active',
      duration_days: 2,
      duration_nights: 1,
    });

    testDeparture = await TourDeparture.create({
      tour_id: testTour.id,
      departure_date: '2026-12-01',
      price_adult: 1000000,
      price_child: 500000,
      price_infant: 0,
      capacity: 10,
      available_seats: 10,
      status: 'open',
    });

    testPickup = await TourPickupLocation.create({
      tour_id: testTour.id,
      location_name: 'Hanoi Opera House',
      surcharge: 50000,
    });

    testOption = await TourOption.create({
      tour_id: testTour.id,
      option_name: 'Kayaking Ticket',
      price: 150000,
      charge_type: 'per_person',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('1. Real API Booking Creation & Server-side Total Calculation', () => {
    it('should create booking, calculate server-side price, and persist options', async () => {
      const payload = {
        tour_id: testTour.id,
        departure_id: testDeparture.id,
        pickup_location_id: testPickup.id,
        customer_name: 'Test Buyer',
        customer_phone: '0912345678',
        customer_email: 'buyer@example.com',
        adult_qty: 2,
        child_qty: 1,
        infant_qty: 0,
        selected_options: [{ option_id: testOption.id, quantity: 2 }],
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.bookingCode).toBeDefined();

      const bookingCode = res.body.data.bookingCode;

      // Verify DB persistence
      const dbBooking = await Booking.findOne({
        where: { booking_code: bookingCode },
        include: [{ model: BookingOption, as: 'bookingOptions' }],
      });

      expect(dbBooking).not.toBeNull();
      expect(dbBooking.customer_name).toBe('Test Buyer');

      // Expected calculation:
      // Adults: 2 * 1,000,000 = 2,000,000
      // Children: 1 * 500,000 = 500,000
      // Pickup surcharge: 50,000 * 3 total pax = 150,000
      // Option per_person: 150,000 * 3 pax = 450,000
      // Expected Total = 3,100,000
      expect(Number(dbBooking.total_price)).toBe(3100000);
      expect(dbBooking.bookingOptions).toHaveLength(1);
      expect(dbBooking.bookingOptions[0].tour_option_id).toBe(testOption.id);
    });
  });

  describe('2. Public Booking Lookup Verification (code + phone + email)', () => {
    let createdCode;

    beforeAll(async () => {
      const dbBooking = await Booking.findOne();
      createdCode = dbBooking.booking_code;
    });

    it('should return booking when exact credentials match, and strip sensitive internal fields', async () => {
      const res = await request(app).get('/api/bookings/lookup').query({
        booking_code: createdCode,
        phone: '0912345678',
        email: 'buyer@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.booking_code).toBe(createdCode);

      // Verify stripped fields
      expect(res.body.data.language).toBeUndefined();
      expect(res.body.data.review_email_sent_at).toBeUndefined();
    });

    it('should reject lookup when credentials do not match without exposing data', async () => {
      const res = await request(app).get('/api/bookings/lookup').query({
        booking_code: createdCode,
        phone: '0999999999', // Wrong phone
        email: 'buyer@example.com',
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Không tìm thấy');
    });
  });

  describe('3. Booking Cancellation & Seat Restoration', () => {
    it('should cancel booking and restore available seats', async () => {
      const dbBooking = await Booking.findOne({ where: { status: 'pending' } });
      const departureBefore = await TourDeparture.findByPk(testDeparture.id);
      const seatsBefore = departureBefore.available_seats;

      const res = await request(app)
        .put(`/api/bookings/${dbBooking.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify seat restoration
      const departureAfter = await TourDeparture.findByPk(testDeparture.id);
      expect(departureAfter.available_seats).toBe(seatsBefore + dbBooking.adult_qty + dbBooking.child_qty);
    });
  });

  describe('4. Real Concurrent Booking Database Race Condition Test', () => {
    let concurrentDeparture;

    beforeAll(async () => {
      // Create departure with strictly 2 available seats
      concurrentDeparture = await TourDeparture.create({
        tour_id: testTour.id,
        departure_date: '2026-12-10',
        price_adult: 500000,
        price_child: 0,
        price_infant: 0,
        capacity: 2,
        available_seats: 2,
        status: 'open',
      });
    });

    it('should enforce row lock (FOR UPDATE) so concurrent requests never overbook capacity', async () => {
      // 5 concurrent requests competing for 2 seats (1 seat each)
      const requests = Array.from({ length: 5 }).map((_, i) =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            tour_id: testTour.id,
            departure_id: concurrentDeparture.id,
            customer_name: `Concurrent User ${i}`,
            customer_phone: '0912345678',
            customer_email: `user${i}@example.com`,
            adult_qty: 1,
          })
      );

      const responses = await Promise.all(requests);

      const successCount = responses.filter((r) => r.status === 201).length;
      const failureCount = responses.filter((r) => r.status === 400).length;

      expect(successCount).toBe(2);
      expect(failureCount).toBe(3);

      // Verify database state
      const finalDeparture = await TourDeparture.findByPk(concurrentDeparture.id);
      expect(finalDeparture.available_seats).toBe(0);

      const bookingsCreated = await Booking.findAll({
        where: { departure_id: concurrentDeparture.id },
      });
      expect(bookingsCreated).toHaveLength(2);

      // Verify unique booking codes
      const codes = bookingsCreated.map((b) => b.booking_code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
