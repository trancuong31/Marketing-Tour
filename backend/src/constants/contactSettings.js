const CONTACT_TYPES = {
    hotline: 'phone',
    email: 'email',
    facebook: 'facebook',
    zalo: 'zalo',
    wechat: 'wechat',
    quick_call: 'phone',
};

const createContact = ({
    id,
    type,
    labels,
    displayValue = '',
    destination = '',
    phoneNumber = '',
    accountIdentifier = '',
    icon,
    enabled = true,
    footerVisible = false,
    floatingVisible = false,
    footerOrder,
    floatingOrder,
    wechatAction = 'none',
}) => ({
    id,
    type,
    labels,
    displayValue,
    destination,
    phoneNumber,
    accountIdentifier,
    icon,
    enabled,
    footerVisible,
    floatingVisible,
    footerOrder,
    floatingOrder,
    wechatAction,
});

const DEFAULT_CONTACT_SETTINGS = {
    general: {
        heading: {
            vi: 'BẠN CẦN TRỢ GIÚP?',
            en: 'NEED HELP?',
            zh: '需要帮助？',
        },
        workingHours: {
            vi: '7h30 → 21h hằng ngày',
            en: 'Daily, 7:30 AM → 9:00 PM',
            zh: '每日 7:30 → 21:00',
        },
        description: { vi: '', en: '', zh: '' },
    },
    contacts: [
        createContact({
            id: 'hotline',
            type: 'phone',
            labels: { vi: 'Hotline', en: 'Hotline', zh: '服务热线' },
            displayValue: '1900 0000',
            destination: '19002045',
            icon: 'phone',
            enabled: true,
            footerVisible: true,
            footerOrder: 1,
            floatingOrder: 4,
        }),
        createContact({
            id: 'email',
            type: 'email',
            labels: { vi: 'Email', en: 'Email', zh: '电子邮件' },
            displayValue: 'info@kynghituyetvoi.vn',
            icon: 'mail',
            enabled: true,
            footerVisible: true,
            footerOrder: 2,
            floatingOrder: 5,
        }),
        createContact({
            id: 'facebook',
            type: 'facebook',
            labels: { vi: 'Facebook', en: 'Facebook', zh: 'Facebook' },
            displayValue: 'Facebook',
            icon: 'facebook',
            enabled: true,
            footerVisible: true,
            footerOrder: 3,
            floatingOrder: 6,
        }),
        createContact({
            id: 'zalo',
            type: 'zalo',
            labels: { vi: 'Zalo', en: 'Zalo', zh: 'Zalo' },
            displayValue: 'Zalo',
            destination: 'https://zalo.me/0987654321',
            phoneNumber: '0987654321',
            icon: 'zalo',
            enabled: true,
            footerVisible: true,
            floatingVisible: true,
            footerOrder: 4,
            floatingOrder: 2,
        }),
        createContact({
            id: 'wechat',
            type: 'wechat',
            labels: { vi: 'Chat WeChat', en: 'Chat WeChat', zh: '微信联系' },
            displayValue: 'WeChat',
            icon: 'wechat',
            enabled: true,
            footerVisible: true,
            floatingVisible: true,
            footerOrder: 5,
            floatingOrder: 1,
        }),
        createContact({
            id: 'quick_call',
            type: 'phone',
            labels: { vi: 'Gọi ngay', en: 'Call now', zh: '立即致电' },
            displayValue: '0987654321',
            destination: '0987654321',
            phoneNumber: '0987654321',
            icon: 'phone',
            enabled: true,
            floatingVisible: true,
            footerOrder: 6,
            floatingOrder: 3,
        }),
    ],
};

const EMPTY_CONTACT_SETTINGS = {
    general: {
        heading: { vi: '', en: '', zh: '' },
        workingHours: { vi: '', en: '', zh: '' },
        description: { vi: '', en: '', zh: '' },
    },
    contacts: [],
};

const PUBLIC_CONTACT_FIELDS = [
    'id',
    'type',
    'labels',
    'displayValue',
    'destination',
    'phoneNumber',
    'accountIdentifier',
    'icon',
    'enabled',
    'footerVisible',
    'floatingVisible',
    'footerOrder',
    'floatingOrder',
    'wechatAction',
];

const toPublicContactSettings = (settings) => ({
    general: {
        heading: { ...EMPTY_CONTACT_SETTINGS.general.heading, ...settings?.general?.heading },
        workingHours: { ...EMPTY_CONTACT_SETTINGS.general.workingHours, ...settings?.general?.workingHours },
        description: { ...EMPTY_CONTACT_SETTINGS.general.description, ...settings?.general?.description },
    },
    contacts: (settings?.contacts || []).map((contact) => (
        Object.fromEntries(PUBLIC_CONTACT_FIELDS.map((field) => [field, contact[field]]))
    )),
});

module.exports = {
    CONTACT_TYPES,
    DEFAULT_CONTACT_SETTINGS,
    EMPTY_CONTACT_SETTINGS,
    toPublicContactSettings,
};