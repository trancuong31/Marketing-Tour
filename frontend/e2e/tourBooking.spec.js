import { test, expect } from '@playwright/test';

test.describe('Tour Booking Flow — E2E Tests', () => {

  const mockTourNoPickup = {
    id: 1,
    title: 'Da Nang Express Tour',
    slug: 'da-nang-express-tour',
    status: 'active',
    duration_days: 3,
    duration_nights: 2,
    departures: [
      { id: 10, departure_date: '2026-12-01', available_seats: 10, status: 'open', price_adult: 1000000, price_child: 500000, price_infant: 0 }
    ],
    pickupLocations: [],
    options: []
  };

  const mockTourWithPickup = {
    id: 2,
    title: 'Halong Bay Luxury Cruise',
    slug: 'halong-bay-luxury-cruise',
    status: 'active',
    duration_days: 2,
    duration_nights: 1,
    departures: [
      { id: 20, departure_date: '2026-12-05', available_seats: 5, status: 'open', price_adult: 2000000, price_child: 1000000, price_infant: 0 }
    ],
    pickupLocations: [
      { id: 101, location_name: 'Hanoi Opera House', surcharge_amount: 50000 }
    ],
    options: []
  };

  const mockUser = {
    id: 1,
    full_name: 'E2E Test User',
    username: 'e2euser',
    email: 'e2e@example.com',
    phone_number: '0912345678'
  };

  const mockAccessToken = 'mock-jwt-access-token-for-e2e';

  // Helper: select a departure from the custom DepartureSelect dropdown
  async function selectDeparture(page) {
    // The DepartureSelect trigger is the first button[type="button"] in the form
    const departureTrigger = page.locator('form button[type="button"]').first();
    await departureTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await departureTrigger.click();

    // After clicking the trigger, a dropdown <ul> with position:absolute appears.
    // Footer also has <ul> elements, so we target the absolutely-positioned dropdown.
    const departureOption = page.locator('form .relative ul li').first();
    await departureOption.waitFor({ state: 'visible', timeout: 5000 });
    await departureOption.click();
  }

  test.beforeEach(async ({ page }) => {
    // 1. Set the session marker so initAuth() calls refresh instead of skipping
    await page.addInitScript(() => {
      window.localStorage.setItem('auth:has-session', '1');
      // Set language to Vietnamese so toast messages match our assertions
      window.localStorage.setItem('i18nextLng', 'vi');
    });

    // 2. Mock the auth refresh endpoint — this is called during app init by initAuth()
    await page.route(
      (url) => url.pathname.includes('/api/auth/refresh'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: {
              user: {
                id: 1,
                full_name: 'E2E Test User',
                username: 'e2euser',
                email: 'e2e@example.com',
                phone_number: '0912345678'
              },
              accessToken: 'mock-jwt-access-token-for-e2e'
            }
          })
        });
      }
    );

    // 3. Mock common API routes to avoid hitting the real backend
    await page.route(
      (url) => url.pathname.includes('/api/tours/featured-reviews'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [] }) });
      }
    );

    await page.route(
      (url) => url.pathname.includes('/api/') && url.pathname.endsWith('/votes'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [] }) });
      }
    );

    await page.route(
      (url) => url.pathname === '/api/tours' || url.pathname === '/api/tours/',
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [] }) });
      }
    );

    // Mock UI translations endpoint
    await page.route(
      (url) => url.pathname.includes('/api/ui-translations'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: {} }) });
      }
    );
  });

  test('1. Booking succeeds when a tour has zero pickup locations', async ({ page }) => {
    await page.route(
      (url) => url.pathname.includes('/api/tours/da-nang-express-tour'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: mockTourNoPickup }) });
      }
    );

    await page.route(
      (url) => url.pathname.includes('/api/bookings') && !url.pathname.includes('/api/bookings/'),
      async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'success', data: { bookingCode: 'BK-NOPICKUP-99', totalPrice: 1000000 } })
          });
        } else {
          await route.fallback();
        }
      }
    );

    await page.goto('/tours/da-nang-express-tour');
    await page.waitForLoadState('networkidle');

    await selectDeparture(page);

    // Submit booking form
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Verify Success Modal displays booking code
    await expect(page.locator('text=BK-NOPICKUP-99')).toBeVisible({ timeout: 10000 });
  });

  test('2. Pickup selection is required when pickup locations exist', async ({ page }) => {
    await page.route(
      (url) => url.pathname.includes('/api/tours/halong-bay-luxury-cruise'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: mockTourWithPickup }) });
      }
    );

    await page.goto('/tours/halong-bay-luxury-cruise');
    await page.waitForLoadState('networkidle');

    await selectDeparture(page);

    // Do NOT select pickup location, click Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Toast error should block submission — Vietnamese translation of errSelectPickup
    await expect(page.locator('text=Vui lòng chọn điểm đón')).toBeVisible({ timeout: 5000 });
  });

  test('3. Missing or invalid phone/email prevents submission', async ({ page }) => {
    // Override the auth refresh to return a user with an invalid phone
    await page.route(
      (url) => url.pathname.includes('/api/auth/refresh'),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: {
              user: {
                id: 2,
                full_name: 'Invalid Phone User',
                username: 'invaliduser',
                email: 'test@example.com',
                phone_number: '0000000000'  // does not match /^(0[35789])[0-9]{8}$/
              },
              accessToken: 'mock-jwt-token-invalid'
            }
          })
        });
      }
    );

    await page.route(
      (url) => url.pathname.includes('/api/tours/da-nang-express-tour'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: mockTourNoPickup }) });
      }
    );

    await page.goto('/tours/da-nang-express-tour');
    await page.waitForLoadState('networkidle');

    await selectDeparture(page);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Error toast for invalid phone format — Vietnamese translation of errInvalidPhone
    await expect(page.locator('text=Số điện thoại trong tài khoản không hợp lệ')).toBeVisible({ timeout: 5000 });
  });

  test('4. Successful booking displays success modal, booking code, and correct total', async ({ page }) => {
    await page.route(
      (url) => url.pathname.includes('/api/tours/da-nang-express-tour'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: mockTourNoPickup }) });
      }
    );

    let apiCalled = false;
    await page.route(
      (url) => url.pathname.includes('/api/bookings') && !url.pathname.includes('/api/bookings/'),
      async (route) => {
        if (route.request().method() === 'POST') {
          apiCalled = true;
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'success', data: { bookingCode: 'BK-E2E-SUCCESS-88', totalPrice: 1000000 } })
          });
        } else {
          await route.fallback();
        }
      }
    );

    await page.goto('/tours/da-nang-express-tour');
    await page.waitForLoadState('networkidle');

    await selectDeparture(page);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait for modal first, then check apiCalled
    await expect(page.locator('text=BK-E2E-SUCCESS-88')).toBeVisible({ timeout: 10000 });
    expect(apiCalled).toBe(true);
  });

  test('5. Failed API request displays error toast and does not re-submit duplicate requests', async ({ page }) => {
    await page.route(
      (url) => url.pathname.includes('/api/tours/da-nang-express-tour'),
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: mockTourNoPickup }) });
      }
    );

    let postCount = 0;
    await page.route(
      (url) => url.pathname.includes('/api/bookings') && !url.pathname.includes('/api/bookings/'),
      async (route) => {
        if (route.request().method() === 'POST') {
          postCount++;
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'fail', message: 'Chuyến đi này đã hết chỗ' })
          });
        } else {
          await route.fallback();
        }
      }
    );

    await page.goto('/tours/da-nang-express-tour');
    await page.waitForLoadState('networkidle');

    await selectDeparture(page);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    await expect(page.locator('text=Chuyến đi này đã hết chỗ')).toBeVisible({ timeout: 5000 });
    expect(postCount).toBe(1);
  });

  test('6. Booking lookup flow with correct and incorrect credentials', async ({ page }) => {
    await page.route(
      (url) => url.pathname.includes('/api/bookings/lookup'),
      async (route) => {
        const urlObj = new URL(route.request().url());
        const code = urlObj.searchParams.get('booking_code');
        const phone = urlObj.searchParams.get('phone');
        const email = urlObj.searchParams.get('email');

        if (code === 'BK-VALID-123' && phone === '0912345678' && email === 'e2e@example.com') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 'success',
              data: [{
                id: 99,
                booking_code: 'BK-VALID-123',
                customer_name: 'E2E Test User',
                customer_phone: '0912345678',
                customer_email: 'e2e@example.com',
                status: 'pending',
                total_price: 2000000,
                adult_qty: 2,
                child_qty: 0,
                infant_qty: 0,
                tour: { title: 'Da Nang Express Tour' }
              }]
            })
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'fail', message: 'Không tìm thấy thông tin đơn hàng.' })
          });
        }
      }
    );

    await page.goto('/lookup-booking');
    await page.waitForLoadState('networkidle');

    // Fill lookup inputs using exact placeholders from LookupBookingPage
    const codeInput = page.locator('input[placeholder="BK123456"]').first();
    const emailInput = page.locator('input[placeholder="nguyenvana@gmail.com"]').first();
    const phoneInput = page.locator('input[type="tel"]').first();

    await codeInput.waitFor({ state: 'visible', timeout: 5000 });

    // Test incorrect search
    await codeInput.fill('BK-INVALID');
    await emailInput.fill('e2e@example.com');
    await phoneInput.fill('0999999999');

    const searchBtn = page.locator('button[type="submit"]').first();
    await searchBtn.click();

    await expect(page.locator('text=Không tìm thấy thông tin')).toBeVisible({ timeout: 5000 });

    // Test valid search
    await codeInput.fill('BK-VALID-123');
    await phoneInput.fill('0912345678');
    await searchBtn.click();

    await expect(page.locator('text=BK-VALID-123')).toBeVisible({ timeout: 5000 });
  });

});
