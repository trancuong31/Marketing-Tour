const express = require('express');
const { getApprovedVotes, createVote, getFeaturedVotes, likeVote, deleteVote, checkVoteEligibility } = require('../controllers/voteController');
const { validate } = require('../middlewares/validate');
const { createVoteSchema } = require('../validations/bookingValidation');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth');
const uploadVote = require('../middlewares/uploadVote');

const router = express.Router();

// Đánh giá thuộc tour → /api/tours/:id/votes (mount tại routes/index.js)
router.get('/featured-reviews', getFeaturedVotes);
router.get('/:id/votes', optionalAuthenticate, getApprovedVotes);
router.get('/:id/vote-eligibility', authenticate, checkVoteEligibility);
router.post('/votes/:id/like', authenticate, likeVote); // POST /api/tours/votes/:id/like
router.delete('/votes/:id', authenticate, deleteVote);
router.post(
    '/:id/votes',
    authenticate,
    uploadVote.array('images', 5),
    validate(createVoteSchema),
    createVote
);

module.exports = router;
