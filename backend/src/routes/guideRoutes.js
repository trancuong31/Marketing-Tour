const express = require('express');
const { getGuideBySlug, getGuides } = require('../controllers/guideController');

const router = express.Router();

router.get('/', getGuides);
router.get('/:slug', getGuideBySlug);

module.exports = router;
