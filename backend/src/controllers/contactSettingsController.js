const { ContactSetting } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const {
    DEFAULT_CONTACT_SETTINGS,
    EMPTY_CONTACT_SETTINGS,
    toPublicContactSettings,
} = require('../constants/contactSettings');

const readSettings = async () => {
    const row = await ContactSetting.findByPk(1);
    return row?.configuration || EMPTY_CONTACT_SETTINGS;
};

const getPublicContactSettings = catchAsync(async (_req, res) => {
    res.status(200).json({
        status: 'success',
        data: toPublicContactSettings(await readSettings()),
    });
});

const getAdminContactSettings = catchAsync(async (_req, res) => {
    const row = await ContactSetting.findByPk(1);
    res.status(200).json({
        status: 'success',
        data: {
            configuration: row?.configuration || DEFAULT_CONTACT_SETTINGS,
            updated_at: row?.updated_at || null,
            created_at: row?.created_at || null,
        },
    });
});

const updateContactSettings = catchAsync(async (req, res) => {
    const now = new Date();
    await ContactSetting.upsert({
        id: 1,
        configuration: req.body,
        updated_by: req.user.id,
        updated_at: now,
    }, { fields: ['id', 'configuration', 'updated_by', 'updated_at'] });
    const row = await ContactSetting.findByPk(1);

    res.status(200).json({
        status: 'success',
        message: 'Contact settings saved.',
        data: {
            configuration: row?.configuration || req.body,
            updated_at: row?.updated_at || now,
            created_at: row?.created_at || null,
        },
    });
});

module.exports = {
    getPublicContactSettings,
    getAdminContactSettings,
    updateContactSettings,
};