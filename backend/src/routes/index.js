const express = require('express');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const tourRoutes = require('./tourRoutes');
const bookingRoutes = require('./bookingRoutes');
const voteRoutes = require('./voteRoutes');
const guideRoutes = require('./guideRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// ── Auth API ──
router.use('/auth', authRoutes);

// ── Public API ──
router.use('/categories', categoryRoutes);
router.use('/tours', tourRoutes);
router.use('/tours', voteRoutes); // /api/tours/:id/votes
router.use('/bookings', bookingRoutes);
router.use('/guides', guideRoutes);

// ── Admin API ──
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Marketing Tour API đang hoạt động',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
