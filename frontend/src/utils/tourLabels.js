const normalizeLabel = (value = '') => value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();

export const getCategoryDisplayName = (category, t) => {
    if (!category) return '';

    const isInternational = Number(category.is_international) === 1 || category.is_international === true;
    const isDomestic = Number(category.is_international) === 0 || category.is_international === false;

    if (isInternational) {
        return t('tour.list.internationalLabel', 'Tour Quốc Tế');
    }

    if (isDomestic) {
        return t('tour.list.domesticLabel', 'Tour Nội Địa');
    }

    const categoryText = normalizeLabel(`${category.slug || ''} ${category.name || ''}`);

    if (categoryText.includes('international') || categoryText.includes('quoc te')) {
        return t('tour.list.internationalLabel', 'Tour Quốc Tế');
    }

    if (categoryText.includes('domestic') || categoryText.includes('noi dia')) {
        return t('tour.list.domesticLabel', 'Tour Nội Địa');
    }

    return category.name || '';
};
