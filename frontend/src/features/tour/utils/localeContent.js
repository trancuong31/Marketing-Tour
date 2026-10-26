const CHECKED_TOUR_CONTENT_FIELDS = [
    'title',
    'summary',
    'highlights',
    'price_includes',
    'price_excludes',
    'terms_and_notes',
    'cancellation_policy',
];

export const hasUnavailableTourContent = (tour, fields = CHECKED_TOUR_CONTENT_FIELDS) =>
    fields.some((field) => {
        const status = tour?.locale_content_status?.[field];
        return status !== undefined && status !== 'available';
    });
