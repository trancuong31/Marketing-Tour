import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const validImagePath = path.resolve(
    testDirectory,
    '../../backend/uploads/tours/tour-1785739441405-6896510.jpg.jpg'
);

const currentTour = {
    id: 100,
    title: 'Phu Quoc Current Tour',
    slug: 'phu-quoc-current-tour',
    summary: 'Current tour summary',
    status: 'active',
    category_id: 1,
    Category: { id: 1, name: 'Domestic tours' },
    departures: [],
    pickupLocations: [],
    options: [],
    images: [],
};

const relatedTours = [
    { id: 201, title: 'Phu Quoc Related 1', thumbnail_url: '/uploads/not-present.webp' },
    { id: 202, title: 'Phu Quoc Related 2', thumbnail_url: null },
    { id: 203, title: 'Phu Quoc Related 3', thumbnail_url: '/uploads/not-present.webp' },
    { id: 204, title: 'Phu Quoc Related 4', thumbnail_url: '/uploads/not-present.webp' },
    {
        id: 205,
        title: 'Phu Quoc Related 5',
        thumbnail_url: null,
        images: [{ image_url: '/uploads/tours/tour-1785739441405-6896510.jpg.jpg' }],
    },
].map((tour) => ({
    ...tour,
    slug: `phu-quoc-related-${tour.id}`,
    summary: 'Related tour summary',
    status: 'active',
    category_id: 1,
    Category: { id: 1, name: 'Domestic tours' },
    tour_badge: 'featured',
    departures: [{ id: tour.id + 1000 }],
    images: [],
}));

test.describe('Related tours cards and carousel', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('i18nextLng', 'vi'));

        await page.route('**/api/**', async (route) => {
            const { pathname } = new URL(route.request().url());
            if (pathname === '/api/tours/phu-quoc-current-tour') {
                await route.fulfill({ json: { status: 'success', data: currentTour } });
            } else if (pathname === '/api/tours/featured-reviews' || pathname.endsWith('/votes')) {
                await route.fulfill({ json: { status: 'success', data: [] } });
            } else if (pathname === '/api/tours') {
                await route.fulfill({ json: { status: 'success', data: [currentTour, ...relatedTours] } });
            } else {
                await route.fulfill({ json: { status: 'success', data: [] } });
            }
        });

        await page.route('**/uploads/**', async (route) => {
            const pathname = new URL(route.request().url()).pathname;
            if (pathname === '/uploads/tours/tour-1785739441405-6896510.jpg.jpg') {
                await route.fulfill({ path: validImagePath, contentType: 'image/jpeg' });
            } else {
                await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
            }
        });
    });

    test('shows loaded, missing, and failed images with a decodable fallback', async ({ page }) => {
        await page.goto('/tours/phu-quoc-current-tour');
        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Tour liên quan dành cho bạn' }),
        });

        const loadedImage = section.locator('img[alt="Phu Quoc Related 5"]');
        await expect.poll(() => loadedImage.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);

        const missingImage = section.locator('img[alt="Phu Quoc Related 2"]');
        await expect(missingImage).toHaveAttribute('src', '/placeholder-tour.svg');
        await expect.poll(() => missingImage.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);

        const failedImage = section.locator('img[alt="Phu Quoc Related 3"]');
        await expect.poll(() => failedImage.getAttribute('src')).toBe('/placeholder-tour.svg');
        await expect.poll(() => failedImage.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    });

    test('advances to the next related-tour card without changing the carousel layout', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto('/tours/phu-quoc-current-tour');
        const section = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Tour liên quan dành cho bạn' }),
        });

        await expect(section.locator('a[href^="/tours/"]')).toHaveCount(4);
        await expect(section.getByRole('heading', { name: 'Phu Quoc Related 5' })).toBeVisible();
        await section.getByRole('button', { name: 'Xem tour liên quan tiếp theo' }).click();
        await expect(section.getByRole('heading', { name: 'Phu Quoc Related 4' })).toBeVisible();

        await page.setViewportSize({ width: 390, height: 844 });
        await expect(section.locator('a[href^="/tours/"]')).toHaveCount(1);
        await expect(section.getByRole('heading', { name: 'Phu Quoc Related 4' })).toBeVisible();
        await section.getByRole('button', { name: 'Xem tour liên quan tiếp theo' }).click();
        await expect(section.getByRole('heading', { name: 'Phu Quoc Related 3' })).toBeVisible();
    });
});