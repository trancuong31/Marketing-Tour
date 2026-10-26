import { describe, expect, it } from 'vitest';
import { getRelatedTours } from '@/features/tour/utils/relatedTours';

const makeTour = (id, title, summary = 'Shared Phu Quoc summary') => ({
    id,
    title,
    slug: `phu-quoc-tour-${id}`,
    summary,
    status: 'active',
    tour_badge: 'featured',
    departures: [{ id: id + 100 }],
});

describe('getRelatedTours', () => {
    it('keeps distinct tours with identical source summaries and removes repeated IDs', () => {
        const first = makeTour(20, 'Phu Quoc Nature Park');
        const second = makeTour(21, 'Phu Quoc Island Escape');
        const tours = [first, second, { ...second, title: 'Duplicate API row' }];

        const related = getRelatedTours(makeTour(1, 'Phu Quoc Current Tour'), tours);

        expect(related.map(({ id }) => id)).toEqual([21, 20]);
        expect(related[0].title).toBe('Phu Quoc Island Escape');
        expect(related[0].summary).toBe(related[1].summary);
    });

    it('safely handles null currentTour, null tours, or tours with null title/summary without throwing', () => {
        expect(getRelatedTours(null, [])).toEqual([]);
        expect(getRelatedTours(undefined, null)).toEqual([]);
        expect(getRelatedTours({ id: 1, title: null, summary: null }, null)).toEqual([]);

        const tourWithNulls = {
            id: 2,
            title: null,
            slug: 'test-tour',
            summary: null,
            status: 'active',
            departures: [],
        };
        const candidateTours = [
            null,
            { id: 3, title: null, slug: 'tour-3', status: 'active', departures: [] },
            makeTour(4, 'Ha Noi City Tour'),
        ];

        expect(() => getRelatedTours(tourWithNulls, candidateTours)).not.toThrow();
        const results = getRelatedTours(tourWithNulls, candidateTours);
        expect(results.length).toBeGreaterThanOrEqual(1);
    });
});