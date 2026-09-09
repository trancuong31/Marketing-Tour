/**
 * Safely parse a pure YYYY-MM-DD or ISO date string into a Date object in local time
 * avoiding UTC midnight timezone shift bug for international users across timezones.
 */
export const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
        return new Date(dateStr);
    }
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
};

/**
 * Format a YYYY-MM-DD or ISO date string to locale date string without timezone shift
 */
export const formatLocalDate = (dateStr, locale = 'vi-VN') => {
    const d = parseLocalDate(dateStr);
    if (!d) return '';
    return d.toLocaleDateString(locale);
};
