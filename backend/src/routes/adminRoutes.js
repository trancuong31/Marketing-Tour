const express = require('express');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const uploadBanner = require('../middlewares/uploadBanner');
const { translateContent } = require('../controllers/translateController');
const {
    listTranslations,
    createUiTranslation,
    updateUiTranslation,
    deleteUiTranslation,
} = require('../controllers/uiTranslationController');
const {
    login,
    getAllTours,
    getTourById,
    createTour,
    updateTour,
    deleteTour,
    getBookings,
    getBookingOverview,
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
    getTopRatedTours,
    getReviewStats,
    deleteVote,
    replyToVote,
} = require('../controllers/adminController');

const router = express.Router();

// ── Auth (public) ──
router.post('/login', login);

// ── Bảo vệ tất cả routes bên dưới bằng JWT ──
router.use(authenticate);

// ── Translation ──
router.post('/translate', translateContent);
router.get('/translations', listTranslations);
router.post('/translations', createUiTranslation);
router.put('/translations/:id', updateUiTranslation);
router.delete('/translations/:id', deleteUiTranslation);

// ── Tour CRUD ──
router.get('/tours', getAllTours);
router.get('/tours/:id', getTourById);
router.post('/tours', upload.array('images', 10), createTour);
router.put('/tours/:id', upload.array('images', 10), updateTour);
router.delete('/tours/:id', deleteTour);
router.delete('/tour-images/:id', deleteTourImage);

// ── Booking ──
router.get('/bookings/overview', getBookingOverview);
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

// ── Vote ──
router.get('/votes/top', getTopRatedTours);
router.get('/votes/stats', getReviewStats);
router.get('/votes', getVotes);
router.delete('/votes/:id', deleteVote);
router.put('/votes/:id', updateVoteStatus);
router.post('/votes/:id/reply', replyToVote);

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

