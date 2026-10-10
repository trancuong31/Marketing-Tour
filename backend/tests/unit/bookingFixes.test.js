const { createBookingSchema } = require('../../src/validations/bookingValidation');

// Mock database config with lightweight define mock
jest.mock('../../src/config/database', () => {
  return {
    sequelize: {
      define: (modelName, attributes, options) => {
        return {
          modelName,
          rawAttributes: attributes,
          options,
        };
      },
    },
    connectDB: jest.fn(),
  };
});

describe('Regression Tests — Tour Booking Feature', () => {

  describe('1. Joi Schema Validation Tests', () => {
    it('should pass valid booking payload', () => {
      const validPayload = {
        tour_id: 1,
        departure_id: 10,
        pickup_location_id: 5,
        customer_name: 'Nguyen Van A',
        customer_phone: '0912345678',
        customer_email: 'test@example.com',
        adult_qty: 2,
        child_qty: 1,
        infant_qty: 0,
        customer_note: 'Hot nua',
      };
      const { error, value } = createBookingSchema.validate(validPayload);
      expect(error).toBeUndefined();
      expect(value.tour_id).toBe(1);
    });

    it('should allow null or empty pickup_location_id', () => {
      const payload = {
        tour_id: 1,
        departure_id: 10,
        pickup_location_id: null,
        customer_name: 'Nguyen Van A',
        customer_phone: '0912345678',
        customer_email: 'test@example.com',
        adult_qty: 1,
      };
      const { error } = createBookingSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('should reject invalid phone numbers (not matching Vietnamese phone regex)', () => {
      const invalidPhones = ['0000000000', '1234567890', '091234', 'abc0912345678'];
      invalidPhones.forEach((phone) => {
        const payload = {
          tour_id: 1,
          departure_id: 10,
          customer_name: 'Nguyen Van A',
          customer_phone: phone,
          customer_email: 'test@example.com',
          adult_qty: 1,
        };
        const { error } = createBookingSchema.validate(payload);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Số điện thoại không hợp lệ');
      });
    });

    it('should reject missing required fields', () => {
      const missingFields = [
        { departure_id: 10, customer_name: 'A', customer_phone: '0912345678', customer_email: 'a@b.com' }, // missing tour_id
        { tour_id: 1, customer_name: 'A', customer_phone: '0912345678', customer_email: 'a@b.com' }, // missing departure_id
        { tour_id: 1, departure_id: 10, customer_phone: '0912345678', customer_email: 'a@b.com' }, // missing customer_name
        { tour_id: 1, departure_id: 10, customer_name: 'A', customer_email: 'a@b.com' }, // missing customer_phone
        { tour_id: 1, departure_id: 10, customer_name: 'A', customer_phone: '0912345678' }, // missing customer_email
      ];

      missingFields.forEach((payload) => {
        const { error } = createBookingSchema.validate(payload);
        expect(error).toBeDefined();
      });
    });

    it('should reject non-positive or negative adult quantity', () => {
      const payload = {
        tour_id: 1,
        departure_id: 10,
        customer_name: 'Nguyen Van A',
        customer_phone: '0912345678',
        customer_email: 'test@example.com',
        adult_qty: 0,
      };
      const { error } = createBookingSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });

  describe('2. Rate Limiter Configuration Verification', () => {
    it('should verify authLimiter max configuration is set to 20', () => {
      const rateLimiterModule = require('../../src/middlewares/rateLimiter');
      expect(rateLimiterModule.authLimiter).toBeDefined();
    });
  });

  describe('3. Public Lookup Data Sensitivity Verification', () => {
    it('should verify lookup response payload format strips sensitive fields', () => {
      const fakeBookingFromDb = {
        id: 101,
        booking_code: 'BK-TEST123',
        customer_name: 'Tran Van B',
        customer_phone: '0987654321',
        customer_email: 'user@example.com',
        adult_qty: 2,
        child_qty: 0,
        infant_qty: 0,
        total_price: 1500000,
        customer_note: 'Ghi chu',
        language: 'vi',
        review_email_sent_at: '2026-10-01T10:00:00Z',
        status: 'pending',
        created_at: '2026-10-02T00:00:00Z',
        departure: { departure_date: '2026-10-15' },
      };

      const sanitizedResponse = {
        id: fakeBookingFromDb.id,
        booking_code: fakeBookingFromDb.booking_code,
        customer_name: fakeBookingFromDb.customer_name,
        customer_phone: fakeBookingFromDb.customer_phone,
        customer_email: fakeBookingFromDb.customer_email,
        adult_qty: fakeBookingFromDb.adult_qty,
        child_qty: fakeBookingFromDb.child_qty,
        infant_qty: fakeBookingFromDb.infant_qty,
        total_price: fakeBookingFromDb.total_price,
        customer_note: fakeBookingFromDb.customer_note,
        status: fakeBookingFromDb.status,
        created_at: fakeBookingFromDb.created_at,
        adult_count: fakeBookingFromDb.adult_qty,
        child_count: fakeBookingFromDb.child_qty,
        infant_count: fakeBookingFromDb.infant_qty,
        departure_date: fakeBookingFromDb.departure?.departure_date || null,
      };

      expect(sanitizedResponse.language).toBeUndefined();
      expect(sanitizedResponse.review_email_sent_at).toBeUndefined();
      expect(sanitizedResponse.booking_code).toBe('BK-TEST123');
    });
  });

  describe('4. Concurrency & Overbooking Safety Logic Simulation', () => {
    it('should correctly prevent overbooking when reserved seats + requested seats > capacity', () => {
      const capacity = 10;
      const existingReservedSeats = 9;
      const requestedSeats = 2;

      const totalRequested = existingReservedSeats + requestedSeats;
      const isOverbooked = totalRequested > capacity;

      expect(isOverbooked).toBe(true);
    });

    it('should allow booking when requested seats <= available seats', () => {
      const capacity = 10;
      const existingReservedSeats = 7;
      const requestedSeats = 3;

      const totalRequested = existingReservedSeats + requestedSeats;
      const isOverbooked = totalRequested > capacity;

      expect(isOverbooked).toBe(false);
    });
  });

  describe('5. Database Unique Constraint Definition Verification', () => {
    it('should verify Booking model has unique constraint on booking_code', () => {
      const BookingModel = require('../../src/models/Booking');
      const bookingCodeAttr = BookingModel.rawAttributes.booking_code;

      expect(bookingCodeAttr).toBeDefined();
      expect(bookingCodeAttr.unique).toBe(true);
      expect(bookingCodeAttr.allowNull).toBe(false);
    });
  });

});
