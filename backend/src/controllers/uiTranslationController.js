const { catchAsync } = require('../utils/catchAsync');
const {
    getPublicTranslations,
    getAdminTranslations,
    createTranslation,
    updateTranslation,
    deleteTranslation,
} = require('../services/uiTranslationService');

const getTranslationsByLanguage = catchAsync(async (req, res) => {
    const data = await getPublicTranslations(req.params.language);
    res.status(200).json(data);
});

const listTranslations = catchAsync(async (req, res) => {
    const data = await getAdminTranslations(req.query);
    res.status(200).json({ status: 'success', data });
});

const createUiTranslation = catchAsync(async (req, res) => {
    const data = await createTranslation(req.body);
    res.status(201).json({ status: 'success', data });
});

const updateUiTranslation = catchAsync(async (req, res) => {
    const data = await updateTranslation(req.params.id, req.body);
    res.status(200).json({ status: 'success', data });
});

const deleteUiTranslation = catchAsync(async (req, res) => {
    await deleteTranslation(req.params.id);
    res.status(204).send();
});

module.exports = {
    getTranslationsByLanguage,
    listTranslations,
    createUiTranslation,
    updateUiTranslation,
    deleteUiTranslation,
};
