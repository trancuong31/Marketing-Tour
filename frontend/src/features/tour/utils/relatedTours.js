const RELATED_DESTINATION_KEYWORDS = [
    'phu quoc',
    'hon thom',
    'ha noi',
    'ho chi minh',
    'sapa',
    'fansipan',
    'da nang',
    'hoi an',
    'ba na',
    'malaysia',
    'singapore',
    'dai loan',
    'cao hung',
    'dai trung',
    'dai bac',
    'x park',
];

const RELATED_STOP_WORDS = new Set([
    'tour',
    'kham',
    'pha',
    'hanh',
    'trinh',
    'nghi',
    'duong',
    'chinh',
    'phuc',
    'ngay',
    'dem',
    'nature',
    'park',
]);

const getTourCategoryId = (tour) => tour?.category_id || tour?.Category?.id || null;

const normalizeSearchText = (text = '') => text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getTourSearchText = (tour) => normalizeSearchText([
    tour?.title,
    tour?.slug,
    tour?.summary,
    tour?.Category?.name,
].filter(Boolean).join(' '));

const getDestinationKeywords = (tour) => {
    const searchText = getTourSearchText(tour);
    const knownKeywords = RELATED_DESTINATION_KEYWORDS.filter((keyword) => searchText.includes(keyword));

    if (knownKeywords.length > 0) {
        return knownKeywords;
    }

    return normalizeSearchText(tour?.title)
        .split(' ')
        .filter((word) => word.length > 2 && !RELATED_STOP_WORDS.has(word))
        .slice(0, 5);
};

const getDestinationScore = (currentKeywords, candidateText) => currentKeywords.reduce((score, keyword) => {
    if (!candidateText.includes(keyword)) return score;
    return score + (keyword.includes(' ') ? 90 : 45);
}, 0);

const mergeUniqueTours = (groups) => {
    const seen = new Set();

    return groups.flat().filter((tour) => {
        if (!tour || seen.has(tour.id)) return false;
        seen.add(tour.id);
        return true;
    });
};

export const getRelatedTours = (currentTour, tours) => {
    const currentCategoryId = getTourCategoryId(currentTour);
    const currentKeywords = getDestinationKeywords(currentTour);

    const candidates = tours.filter((tour) => {
        if (!tour || tour.id === currentTour?.id) return false;
        return tour.slug !== currentTour?.slug && tour.status !== 'hidden' && tour.status !== 'sold_out';
    });

    const withDestinationScore = candidates.map((tour) => ({
        tour,
        destinationScore: getDestinationScore(currentKeywords, getTourSearchText(tour)),
        hasOpenDepartures: (tour.departures || []).length > 0,
    }));

    const byRelevance = (a, b) => (
        Number(b.hasOpenDepartures) - Number(a.hasOpenDepartures)
        || b.destinationScore - a.destinationScore
        || b.tour.id - a.tour.id
    );

    const promotionTours = withDestinationScore
        .filter(({ tour }) => tour.tour_badge === 'promotion')
        .sort(byRelevance)
        .map(({ tour }) => tour);

    const featuredTours = withDestinationScore
        .filter(({ tour }) => tour.tour_badge === 'featured')
        .sort(byRelevance)
        .map(({ tour }) => tour);

    const keywordTours = withDestinationScore
        .filter(({ destinationScore }) => destinationScore > 0)
        .sort(byRelevance)
        .map(({ tour }) => tour);

    const categoryTours = withDestinationScore
        .filter(({ tour }) => currentCategoryId && getTourCategoryId(tour) === currentCategoryId)
        .sort(byRelevance)
        .map(({ tour }) => tour);

    const fallbackTours = withDestinationScore
        .sort(byRelevance)
        .map(({ tour }) => tour);

    return mergeUniqueTours([promotionTours, featuredTours, keywordTours, categoryTours, fallbackTours]).slice(0, 5);
};