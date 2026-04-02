const express = require('express');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const uploadBanner = require('../middlewares/uploadBanner');
const {
    login,
    getAllTours,
    createTour,
    updateTour,
    deleteTour,
    getBookings,
    updateBookingStatus,
    getVotes,
    updateVoteStatus,
    getAllGuides,
    createGuide,
    updateGuide,
    deleteTourImage,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    deleteBooking,
} = require('../controllers/adminController');

const router = express.Router();

// ── Auth (public) ──
router.post('/login', login);

// ── Bảo vệ tất cả routes bên dưới bằng JWT ──
router.use(authenticate);

// ── Tour CRUD ──
router.get('/tours', getAllTours);
router.post('/tours', upload.array('images', 10), createTour);
router.put('/tours/:id', upload.array('images', 10), updateTour);
router.delete('/tours/:id', deleteTour);
router.delete('/tour-images/:id', deleteTourImage);

// ── Booking ──
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

// ── Vote ──
router.get('/votes', getVotes);
router.put('/votes/:id', updateVoteStatus);

// ── Guide ──
router.get('/guides', getAllGuides);
router.post('/guides', createGuide);
router.put('/guides/:id', updateGuide);

// ── Banner ──
router.get('/banners', getAllBanners);
router.post('/banners', uploadBanner.single('image'), createBanner);
router.put('/banners/:id', uploadBanner.single('image'), updateBanner);
router.delete('/banners/:id', deleteBanner);

module.exports = router;

