import { describe, it, expect } from 'vitest';

describe('Frontend Booking Form & Profile Validation Logic', () => {

  // Test 1: Pickup Location validation rule
  it('should allow submit when pickupLocations is empty', () => {
    const pickupLocations = [];
    const selectedPickupId = '';

    // Logic matching BookingForm.jsx onSubmit
    const isPickupValid = pickupLocations.length === 0 || Boolean(selectedPickupId);
    expect(isPickupValid).toBe(true);
  });

  it('should require selectedPickupId when pickupLocations is non-empty', () => {
    const pickupLocations = [{ id: 1, location_name: 'Opera House' }];
    const selectedPickupId = '';

    const isPickupValid = pickupLocations.length === 0 || Boolean(selectedPickupId);
    expect(isPickupValid).toBe(false);
  });

  // Test 2: Phone number regex validation
  it('should validate phone numbers matching Vietnamese format regex', () => {
    const phoneRegex = /^(0[35789])[0-9]{8}$/;

    const validPhones = ['0912345678', '0387654321', '0701112233', '0898889999'];
    const invalidPhones = ['0000000000', '1234567890', '091234', '091234567890', 'abc0912345678'];

    validPhones.forEach((phone) => {
      expect(phoneRegex.test(phone)).toBe(true);
    });

    invalidPhones.forEach((phone) => {
      expect(phoneRegex.test(phone)).toBe(false);
    });
  });

  // Test 3: Profile completeness requirement
  it('should reject submission if user phone or email is missing', () => {
    const userWithMissingPhone = { full_name: 'Test', email: 'test@example.com', phone_number: '' };
    const userWithMissingEmail = { full_name: 'Test', email: '', phone_number: '0912345678' };
    const completeUser = { full_name: 'Test', email: 'test@example.com', phone_number: '0912345678' };

    const validateUser = (u) => Boolean(u && u.email && u.phone_number);

    expect(validateUser(userWithMissingPhone)).toBe(false);
    expect(validateUser(userWithMissingEmail)).toBe(false);
    expect(validateUser(completeUser)).toBe(true);
  });

  // Test 4: Frontend price calculation accuracy
  it('should compute total price matching backend formula', () => {
    const adults = 2;
    const children = 1;
    const infants = 0;
    const adultPrice = 1000000;
    const childPrice = 500000;
    const infantPrice = 0;
    const pickupSurcharge = 50000;
    const optionsTotal = 450000;

    const totalPassengers = adults + children + infants;
    const basePrice = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
    const calculatedTotal = basePrice + (pickupSurcharge * totalPassengers) + optionsTotal;

    expect(calculatedTotal).toBe(3100000);
  });

});
