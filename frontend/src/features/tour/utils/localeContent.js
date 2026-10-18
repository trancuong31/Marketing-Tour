const hasUnavailableStatus = (status = {}) =>
    Object.values(status || {}).some((value) => value !== 'available');

export const hasUnavailableTourContent = (tour) =>
    hasUnavailableStatus(tour?.locale_content_status)
    || hasUnavailableStatus(tour?.Category?.locale_content_status)
    || (tour?.itineraries || []).some((itinerary) =>
        hasUnavailableStatus(itinerary?.locale_content_status)
    );
