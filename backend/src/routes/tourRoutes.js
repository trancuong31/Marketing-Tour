const express = require('express');
const { getTours, getTourBySlug, getDistinctPickupLocations } = require('../controllers/tourController');

const router = express.Router();

router.get('/', getTours);
router.get('/pickup-locations', getDistinctPickupLocations);
router.get('/:slug', getTourBySlug);


module.exports = router;
