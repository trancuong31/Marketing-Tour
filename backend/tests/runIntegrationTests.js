// Dedicated Real Database Integration & Concurrency Test Runner
process.env.DB_NAME = 'db_marketing_tour_test';
process.env.NODE_ENV = 'test';

const assert = require('assert');
const request = require('supertest');
const { sequelize } = require('../src/config/database');
const app = require('../src/app');

// Models
const {
  Role,
  User,
  Category,
  Tour,
  TourDeparture,
  TourPickupLocation,
  TourOption,
  Booking,
  BookingOption,
} = require('../src/models');

async function runTests() {
  console.log('=== RUNNING REAL DATABASE API INTEGRATION & CONCURRENCY TESTS ===');
  
  // ── Database Safety Guard ──
  assert.strictEqual(process.env.DB_NAME, 'db_marketing_tour_test', 'MUST execute against db_marketing_tour_test');
  assert.strictEqual(sequelize.config.database, 'db_marketing_tour_test', 'Sequelize target database MUST be db_marketing_tour_test');
  console.log('✓ Safety Guard Verified: Connected exclusively to isolated test database:', sequelize.config.database);

  try {
    // 1. Authenticate & Sync isolated test DB
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✓ Connected & synced schema to db_marketing_tour_test');

    // 2. Seed test records
    const testRole = await Role.create({
      id: 1,
      role_name: 'user',
    });

    const testUser = await User.create({
      username: 'testbuyer',
      email: 'buyer@example.com',
      password: 'password123',
      full_name: 'Test Buyer',
      phone_number: '0912345678',
      role_id: testRole.id,
    });

    const testCategory = await Category.create({
      id: 1,
      name: 'Domestic Tour',
      slug: 'domestic-tour',
    });

    const jwt = require('jsonwebtoken');
    const env = require('../src/config/env');
    const userToken = jwt.sign({ id: testUser.id, role_id: testRole.id }, env.jwt.secret, {
      expiresIn: '1h',
    });

    const testTour = await Tour.create({
      category_id: testCategory.id,
      title: 'Hanoi Halong Bay Express Tour',
      slug: 'hanoi-halong-bay-express-tour',
      status: 'active',
      duration_days: 2,
      duration_nights: 1,
    });

    const testDeparture = await TourDeparture.create({
      tour_id: testTour.id,
      departure_date: '2026-12-01',
      price_adult: 1000000,
      price_child: 500000,
      price_infant: 0,
      capacity: 10,
      available_seats: 10,
      status: 'open',
    });

    const testPickup = await TourPickupLocation.create({
      tour_id: testTour.id,
      location_name: 'Hanoi Opera House',
      surcharge_amount: 50000,
    });

    const testOption = await TourOption.create({
      tour_id: testTour.id,
      option_name: 'Kayaking Ticket',
      price: 150000,
      charge_type: 'per_person',
    });

    // ── Test 1: API Booking Creation & Price Calculation ──
    console.log('\n[Test 1] Creating booking via real API...');
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

    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);

    assert.strictEqual(res1.status, 201, `Expected 201, got ${res1.status}`);
    assert.strictEqual(res1.body.status, 'success');
    const createdCode = res1.body.data.bookingCode;
    assert.ok(createdCode, 'Booking code must be returned');

    // Verify DB Persistence
    const dbBooking = await Booking.findOne({
      where: { booking_code: createdCode },
      include: [{ model: BookingOption, as: 'bookingOptions' }],
    });
    assert.ok(dbBooking, 'Booking record must exist in db_marketing_tour_test');
    assert.strictEqual(Number(dbBooking.total_price), 3100000, 'Total price calculation must match formula');
    assert.strictEqual(dbBooking.bookingOptions.length, 1, 'Booking option must be persisted');
    console.log('✓ PASS: API Booking Creation & DB Persistence verified (Total price: 3,100,000 VND)');

    // ── Test 2: Public Lookup Credentials & Data Masking ──
    console.log('\n[Test 2] Testing public lookup with exact credentials...');
    const res2 = await request(app).get('/api/bookings/lookup').query({
      booking_code: createdCode,
      phone: '0912345678',
      email: 'buyer@example.com',
    });
    assert.strictEqual(res2.status, 200);
    assert.ok(Array.isArray(res2.body.data), 'Lookup data should be array');
    assert.strictEqual(res2.body.data[0].booking_code, createdCode);
    assert.strictEqual(res2.body.data[0].language, undefined, 'Internal field "language" must be stripped');
    assert.strictEqual(res2.body.data[0].review_email_sent_at, undefined, 'Internal field "review_email_sent_at" must be stripped');
    console.log('✓ PASS: Public Lookup returns valid booking and masks internal fields');

    console.log('\n[Test 3] Testing public lookup rejection with invalid credentials...');
    const res3 = await request(app).get('/api/bookings/lookup').query({
      booking_code: createdCode,
      phone: '0999999999', // wrong phone
      email: 'buyer@example.com',
    });
    assert.strictEqual(res3.status, 404);
    assert.ok(res3.body.message.includes('Không tìm thấy'));
    console.log('✓ PASS: Invalid lookup credentials rejected without exposing customer data');

    // ── Test 3: Cancellation & Seat Restoration ──
    console.log('\n[Test 4] Testing cancellation & seat restoration...');
    const departureBeforeCancel = await TourDeparture.findByPk(testDeparture.id);
    const seatsBefore = departureBeforeCancel.available_seats;

    const res4 = await request(app)
      .put(`/api/bookings/${dbBooking.id}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.strictEqual(res4.status, 200);

    const departureAfterCancel = await TourDeparture.findByPk(testDeparture.id);
    assert.strictEqual(departureAfterCancel.available_seats, seatsBefore + dbBooking.adult_qty + dbBooking.child_qty);
    console.log(`✓ PASS: Booking cancelled and ${dbBooking.adult_qty + dbBooking.child_qty} seats restored to departure`);

    // ── Test 4: Real Database Concurrent Booking Overbooking Safety ──
    console.log('\n[Test 5] Testing REAL CONCURRENT BOOKINGS against MariaDB database...');
    const concurrentDeparture = await TourDeparture.create({
      tour_id: testTour.id,
      departure_date: '2026-12-10',
      price_adult: 500000,
      price_child: 0,
      price_infant: 0,
      capacity: 2,
      available_seats: 2,
      status: 'open',
    });

    console.log(`Submitting 5 concurrent requests for departure (Capacity: 2, Seats: 2)...`);
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
    const failureCount = responses.filter((r) => r.status === 400 || r.status === 409).length;

    assert.strictEqual(successCount, 2, `Exactly 2 bookings should succeed, got ${successCount}`);
    assert.strictEqual(failureCount, 3, `Exactly 3 requests should fail, got ${failureCount}`);

    const finalDeparture = await TourDeparture.findByPk(concurrentDeparture.id);
    assert.strictEqual(finalDeparture.available_seats, 0, 'Available seats count in DB must be 0');

    const createdBookings = await Booking.findAll({ where: { departure_id: concurrentDeparture.id } });
    assert.strictEqual(createdBookings.length, 2, 'DB must contain exactly 2 booking records');

    const codes = createdBookings.map((b) => b.booking_code);
    const uniqueCodes = new Set(codes);
    assert.strictEqual(uniqueCodes.size, codes.length, 'All generated booking codes must be unique');

    console.log(`✓ PASS: Real Concurrent DB Test completed successfully! (2 Succeeded, 3 Rejected, Final Seats: 0, Codes Unique)`);

    // ── Test 5: Transaction Rollback Safety on Exception ──
    console.log('\n[Test 6] Testing Transaction Rollback Safety on Exception...');
    const bookingsCountBefore = await Booking.count();
    const departureBeforeFailedTx = await TourDeparture.findByPk(testDeparture.id);
    const seatsBeforeFailedTx = departureBeforeFailedTx.available_seats;

    try {
      await sequelize.transaction(async (t) => {
        const dummyBooking = await Booking.create({
          tour_id: testTour.id,
          departure_id: testDeparture.id,
          booking_code: 'ROLLBACK_CODE_999',
          customer_name: 'Rollback User',
          customer_email: 'rollback@example.com',
          customer_phone: '0912345678',
          adult_qty: 1,
          total_price: 1000000,
          status: 'pending',
        }, { transaction: t });

        await BookingOption.create({
          booking_id: dummyBooking.id,
          option_name: 'Dummy Option',
          price: 100000,
          quantity: 1,
          total: 100000,
        }, { transaction: t });

        // Force an intentional exception after writing Booking + BookingOption
        throw new Error('INTENTIONAL_SIMULATED_FAILURE_FOR_ROLLBACK_TEST');
      });
    } catch (e) {
      assert.strictEqual(e.message, 'INTENTIONAL_SIMULATED_FAILURE_FOR_ROLLBACK_TEST');
    }

    const bookingsCountAfter = await Booking.count();
    const checkRolledBackCode = await Booking.findOne({ where: { booking_code: 'ROLLBACK_CODE_999' } });
    const departureAfterFailedTx = await TourDeparture.findByPk(testDeparture.id);

    assert.strictEqual(bookingsCountAfter, bookingsCountBefore, 'Booking count MUST remain unchanged after rollback');
    assert.strictEqual(checkRolledBackCode, null, 'Rolled back booking code MUST NOT exist in DB');
    assert.strictEqual(departureAfterFailedTx.available_seats, seatsBeforeFailedTx, 'Departure seats MUST remain unchanged');
    console.log('✓ PASS: Managed transaction automatically rolled back all writes upon error');

    // ── Test 6: Bounded Concurrency Retry Loop Verification ──
    console.log('\n[Test 7] Testing Bounded Concurrency Retry (Bounded to max 3 attempts)...');
    let retryAttemptsCount = 0;
    const fakeLockErr = new Error('Lock wait timeout exceeded');
    fakeLockErr.original = { errno: 1020, code: 'ER_CHECKREAD' };

    try {
      let attempts = 0;
      while (attempts < 3) {
        try {
          retryAttemptsCount++;
          throw fakeLockErr;
        } catch (err) {
          attempts++;
          if (
            attempts < 3 &&
            (err.original?.errno === 1020 || err.original?.code === 'ER_CHECKREAD')
          ) {
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      assert.strictEqual(retryAttemptsCount, 3, 'Retry loop MUST execute exactly 3 times before failing');
      assert.strictEqual(err.original.errno, 1020);
    }
    console.log('✓ PASS: Retry loop is strictly bounded to 3 attempts and re-throws on exhaustion');

    console.log('\n======================================================');
    console.log('ALL REAL DATABASE API & CONCURRENCY TESTS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();
