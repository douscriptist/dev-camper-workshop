const express = require('express');
const { getReviews, getReview, addReview } = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.get(
	'/',
	advancedResults(Review, { path: 'bootcamp', select: 'name description' }),
	getReviews
);

router.post('/', protect, authorize('user', 'admin'), addReview);

router.get('/:id', getReview);

module.exports = router;
