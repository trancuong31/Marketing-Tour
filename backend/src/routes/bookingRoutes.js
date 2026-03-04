const express = require('express');
const { createBooking, getBookingHistory } = require('../controllers/bookingController');
const { validate } = require('../middlewares/validate');
const { createBookingSchema } = require('../validations/bookingValidation');

const router = express.Router();

router.post('/', validate(createBookingSchema), createBooking);
router.get('/history', getBookingHistory);

module.exports = router;
