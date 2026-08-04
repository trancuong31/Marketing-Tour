const express = require('express');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const uploadBanner = require('../middlewares/uploadBanner');
const uploadGuide = require('../middlewares/uploadGuide');
const { translateContent } = require('../controllers/translateController');
const adminUserController = require('../controllers/adminUserController');
const {
    listTranslations,
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
    uploadGuideImage,
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
router.put('/translations/:id', updateUiTranslation);
router.delete('/translations/:id', deleteUiTranslation);

// ── Users ──
router.get('/users/roles', adminUserController.listRoles);
router.get('/users', adminUserController.listUsers);
router.get('/users/:id', adminUserController.getUserDetail);
router.patch('/users/:id/status', adminUserController.updateUserStatus);
router.patch('/users/:id/role', adminUserController.updateUserRole);
router.post('/users/:id/reset-password', adminUserController.sendResetPassword);

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
router.post('/guides/upload-image', uploadGuide.single('image'), uploadGuideImage);
router.post('/guides', createGuide);
router.put('/guides/:id', updateGuide);

// ── Banner ──
router.get('/banners', getAllBanners);
router.post('/banners', uploadBanner.single('image'), createBanner);
router.put('/banners/:id', uploadBanner.single('image'), updateBanner);
router.delete('/banners/:id', deleteBanner);

module.exports = router;

