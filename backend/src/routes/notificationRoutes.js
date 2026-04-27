const express = require('express');
const { getMyNotifications, markAllAsRead, markOneAsRead } = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/mark-as-read', markAllAsRead);
router.patch('/:id/mark-as-read', markOneAsRead);

module.exports = router;
