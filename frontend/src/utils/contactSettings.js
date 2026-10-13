const PHONE_CHARACTERS = /[\s().-]/g;

export const getContactText = (translations, language) => (
    translations?.[language?.split('-')[0]] || translations?.vi || ''
);

export const getContactHref = (contact) => {
    if (contact.type === 'phone') {
        const number = String(contact.destination || '').replace(PHONE_CHARACTERS, '');
        return number ? `tel:${encodeURIComponent(number).replace('%2B', '+')}` : '';
    }

    if (contact.type === 'email') {
        const email = String(contact.displayValue || '').trim();
        return email ? `mailto:${encodeURIComponent(email).replace('%40', '@')}` : '';
    }

    if (contact.type === 'wechat') {
        return contact.wechatAction === 'url' ? contact.destination || '' : '';
    }

    return contact.destination || '';
};

export const isContactCopyAction = (contact) => (
    contact.type === 'wechat'
    && contact.wechatAction === 'copy'
    && Boolean(contact.accountIdentifier)
);

export const getVisibleContacts = (settings, location) => {
    const visibilityKey = `${location}Visible`;
    const orderKey = `${location}Order`;

    return (settings?.contacts || [])
        .filter((contact) => contact.enabled && contact[visibilityKey])
        .sort((first, second) => first[orderKey] - second[orderKey]);
};