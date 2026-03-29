const express = require('express');
const { getBannersByPosition } = require('../controllers/tourController');

const router = express.Router();

// GET /api/banners?position=hero|left_home|right_home
router.get('/', getBannersByPosition);

module.exports = router;
