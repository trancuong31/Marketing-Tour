/**
 * Entity statuses
 */
const TOUR_BADGE = {
    FEATURED: 'featured',
    PROMOTION: 'promotion',
    NONE: 'none'
};

/**
 * Check if a status is valid
 */
const isValidStatus = (status) => Object.values(TOUR_BADGE).includes(status);

module.exports = { TOUR_BADGE, isValidStatus };
