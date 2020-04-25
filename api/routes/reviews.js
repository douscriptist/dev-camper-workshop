const express = require('express');
const {
	getReviews,
	getReview,
	addReview,
	updateReview,
	deleteReview,
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user', 'admin'), addReview);
router.get(
	'/',
	advancedResults(Review, { path: 'bootcamp', select: 'name description' }),
	getReviews
);

router.get('/:id', getReview);
router.put('/:id', protect, authorize('user', 'admin'), updateReview);
router.delete('/:id', protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
