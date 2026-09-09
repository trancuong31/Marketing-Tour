/**
 * Safely get YYYY-MM-DD date string in target timezone (default Asia/Ho_Chi_Minh)
 * avoiding UTC offset mismatch between Node server and tour destination location.
 */
const getTodayDateString = (timeZone = 'Asia/Ho_Chi_Minh') => {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
};

module.exports = {
    getTodayDateString,
};
