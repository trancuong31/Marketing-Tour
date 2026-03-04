const express = require('express');
const { getApprovedVotes, createVote } = require('../controllers/voteController');
const { validate } = require('../middlewares/validate');
const { createVoteSchema } = require('../validations/bookingValidation');

const router = express.Router();

// Đánh giá thuộc tour → /api/tours/:id/votes (mount tại routes/index.js)
router.get('/:id/votes', getApprovedVotes);
router.post('/:id/votes', validate(createVoteSchema), createVote);

module.exports = router;
