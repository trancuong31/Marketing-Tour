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

/**
 * Check if a date (YYYY-MM-DD) is strictly before today in Vietnam timezone
 */
export const isDateBeforeToday = (dateStr) => {
    if (!dateStr) return false;
    const cleanStr = String(dateStr).split('T')[0];
    const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
    return cleanStr < todayStr;
};

/**
 * Check if a booking's departure date is in the past
 */
export const isBookingDepartureExpired = (booking) => {
    if (!booking) return false;
    const rawDate = booking.departure?.departure_date || booking.departure_date_snapshot;
    return isDateBeforeToday(rawDate);
};

