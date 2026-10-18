import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import viTour from '@/i18n/vi/tour.json';
import enTour from '@/i18n/en/tour.json';
import zhTour from '@/i18n/zh/tour.json';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (_key, fallback) => fallback,
    }),
}));

vi.mock('react-router-dom', () => ({
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('lucide-react', () => ({
    Clock: () => <span />,
}));

vi.mock('@/utils/imageUrl', () => ({
    getImageUrl: () => '/tour.jpg',
    onImgError: () => undefined,
}));

import TourCard from '@/components/tour/TourCard';
import { hasUnavailableTourContent } from '@/features/tour/utils/localeContent';

describe('localized unavailable content state', () => {
    it.each(['vi', 'en', 'zh'])('detects missing and unverified content for %s', (language) => {
        expect(hasUnavailableTourContent({
            locale_content_status: { summary: 'missing' },
            language,
        })).toBe(true);
        expect(hasUnavailableTourContent({
            locale_content_status: { summary: 'unverified' },
            language,
        })).toBe(true);
    });

    it('does not flag complete localized content', () => {
        expect(hasUnavailableTourContent({
            locale_content_status: { title: 'available', summary: 'available' },
            Category: { locale_content_status: { name: 'available' } },
            itineraries: [{ locale_content_status: { content: 'available' } }],
        })).toBe(false);
    });

    it('renders a visible status when a localized field is missing', () => {
        const markup = renderToStaticMarkup(
            <TourCard
                tour={{
                    title: null,
                    slug: null,
                    summary: null,
                    locale_content_status: {
                        title: 'available',
                        summary: 'missing',
                    },
                    departures: [],
                }}
            />
        );

        expect(markup).toContain('role="status"');
        expect(markup).toContain('Some tour content is unavailable or under review.');
    });

    it.each([
        ['vi', viTour],
        ['en', enTour],
        ['zh', zhTour],
    ])('provides localized unavailable-content messages for %s', (_language, resources) => {
        expect(resources.detail.titleUnavailable).toBeTruthy();
        expect(resources.detail.contentUnavailable).toBeTruthy();
    });
});
