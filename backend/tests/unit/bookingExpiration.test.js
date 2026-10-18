const { autoCancelExpiredBookings, getBookingPassengerCount } = require('../../src/services/bookingExpirationService');
const { Booking, TourDeparture, Notification } = require('../../src/models');
const { sequelize } = require('../../src/config/database');

jest.mock('../../src/models', () => {
    return {
        Booking: {
            findAll: jest.fn(),
            findByPk: jest.fn(),
        },
        TourDeparture: {
            findByPk: jest.fn(),
        },
        Tour: {},
        TourTranslation: {},
        Notification: {
            create: jest.fn(),
        },
    };
});

jest.mock('../../src/config/database', () => {
    return {
        sequelize: {
            transaction: jest.fn(async (cb) => cb({ LOCK: { UPDATE: 'UPDATE' } })),
        },
    };
});

describe('bookingExpirationService - autoCancelExpiredBookings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should correctly calculate passenger count', () => {
        expect(getBookingPassengerCount({ adult_qty: 2, child_qty: 1, infant_qty: 1 })).toBe(4);
        expect(getBookingPassengerCount({})).toBe(0);
    });

    it('should return scanned 0 when no expired pending bookings exist', async () => {
        Booking.findAll.mockResolvedValue([
            {
                id: 1,
                status: 'pending',
                departure: { departure_date: '2026-12-31' },
            },
        ]);

        const result = await autoCancelExpiredBookings({ referenceDate: '2026-10-18' });
        expect(result).toEqual({ scanned: 0, cancelled: 0, failed: 0 });
        expect(Booking.findByPk).not.toHaveBeenCalled();
    });

    it('should auto-cancel expired pending booking and restore seats', async () => {
        const mockBooking = {
            id: 101,
            booking_code: 'BK101',
            status: 'pending',
            departure_id: 20,
            adult_qty: 2,
            child_qty: 0,
            infant_qty: 0,
            user_id: 5,
            admin_note: null,
            language: 'vi',
            departure: {
                id: 20,
                departure_date: '2026-10-10',
            },
            Tour: {
                title: 'Tour Da Nang',
                slug: 'tour-da-nang',
            },
            update: jest.fn().mockResolvedValue(true),
        };

        const mockDeparture = {
            id: 20,
            capacity: 30,
            available_seats: 10,
            update: jest.fn().mockResolvedValue(true),
        };

        Booking.findAll.mockResolvedValue([mockBooking]);
        Booking.findByPk.mockResolvedValue(mockBooking);
        TourDeparture.findByPk.mockResolvedValue(mockDeparture);
        Notification.create.mockResolvedValue(true);

        const result = await autoCancelExpiredBookings({ referenceDate: '2026-10-18' });

        expect(result.scanned).toBe(1);
        expect(result.cancelled).toBe(1);
        expect(result.failed).toBe(0);

        // Check seats restored: 10 + 2 = 12
        expect(mockDeparture.update).toHaveBeenCalledWith(
            { available_seats: 12, status: 'open' },
            expect.any(Object)
        );

        // Check booking updated
        expect(mockBooking.update).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'cancelled',
                admin_note: expect.stringContaining('Hệ thống tự động hủy'),
            }),
            expect.any(Object)
        );

        // Check notification created
        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 5,
                type: 'booking',
                related_id: 101,
            }),
            expect.any(Object)
        );
    });

    it('should handle snapshot date when departure relation is absent', async () => {
        const mockBooking = {
            id: 102,
            booking_code: 'BK102',
            status: 'pending',
            departure_id: null,
            departure_date_snapshot: '2026-10-15',
            adult_qty: 1,
            child_qty: 0,
            infant_qty: 0,
            user_id: null,
            admin_note: 'Ghi chu cu',
            update: jest.fn().mockResolvedValue(true),
        };

        Booking.findAll.mockResolvedValue([mockBooking]);
        Booking.findByPk.mockResolvedValue(mockBooking);

        const result = await autoCancelExpiredBookings({ referenceDate: '2026-10-18' });

        expect(result.scanned).toBe(1);
        expect(result.cancelled).toBe(1);
        expect(mockBooking.update).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'cancelled',
                admin_note: expect.stringContaining('Ghi chu cu | Hệ thống tự động hủy'),
            }),
            expect.any(Object)
        );
        expect(Notification.create).not.toHaveBeenCalled();
    });
});
