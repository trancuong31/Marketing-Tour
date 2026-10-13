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
});