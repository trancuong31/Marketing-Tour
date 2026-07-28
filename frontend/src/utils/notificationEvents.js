export const NOTIFICATIONS_REFRESH_EVENT = 'tourTravel:notifications:refresh';

export const emitNotificationsRefresh = (detail = {}) => {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT, { detail }));
};
