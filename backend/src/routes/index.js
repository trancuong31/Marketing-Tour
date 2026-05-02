const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const tourRoutes = require('./tourRoutes');
const bookingRoutes = require('./bookingRoutes');
const voteRoutes = require('./voteRoutes');
const guideRoutes = require('./guideRoutes');
const bannerRoutes = require('./bannerRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// ── Auth API ──
router.use('/auth', authRoutes);

// ── Public API ──
router.use('/categories', categoryRoutes);
router.use('/tours', voteRoutes); // /api/tours/featured-reviews và /api/tours/:id/votes
router.use('/tours', tourRoutes); // /api/tours/:slug
router.use('/bookings', bookingRoutes);
router.use('/guides', guideRoutes);
router.use('/banners', bannerRoutes);

// ── User API ──
router.use('/users', userRoutes);
router.use('/notifications', require('./notificationRoutes'));

// ── Admin API ──
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'KyNghiTuyetVoi API đang hoạt động',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
