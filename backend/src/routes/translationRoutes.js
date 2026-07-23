const express = require('express');
const { getTranslationsByLanguage } = require('../controllers/uiTranslationController');

const router = express.Router();

router.get('/:language', getTranslationsByLanguage);

module.exports = router;
