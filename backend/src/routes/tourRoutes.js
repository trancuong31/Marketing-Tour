const express = require('express');
const { getTours, getTourBySlug } = require('../controllers/tourController');

const router = express.Router();

router.get('/', getTours);
router.get('/:slug', getTourBySlug);

module.exports = router;
