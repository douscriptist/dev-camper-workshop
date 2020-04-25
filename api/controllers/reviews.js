const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/bootcamps/:bootcampId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
	// If there is bootcamp if in query
	if (req.params.bootcampId) {
		// Check bootcamp is available
		const bootcamp = await Bootcamp.findById(req.params.bootcampId);
		if (!bootcamp) {
			return next(
				new ErrorResponse(
					`Bootcamp not found with id of ${req.params.bootcampId}`,
					404
				)
			);
		}
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate('bootcamp', [
		'name',
		'description',
	]);

	// Check review is available
	if (!review) {
		return next(
			new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		msg: `Get a review. ID: ${req.params.id}`,
		data: review,
	});
});

// @desc      Add/Create a review
// @route     POST /api/v1/bootcamp/:bootcampId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);
	// Check bootcamp is exists
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	// Authorizing the just only users and admins can add review ON ROUTES/review.js

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		msg: 'Review added successfully.',
		data: review,
	});
});

// @desc      Update a review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	// Check review is exists
	if (!review) {
		return next(
			new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure is the owner of review?
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update review ${req.params.id}.`,
				401
			)
		);
	}

	// findByIdAndUpdate do not trigger hooks of mongoose so in the callback used doc.save()
	review = await Review.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		},
		async (err, doc) => {
			if (err) {
				console.log(err);
				return next(new ErrorResponse('Server Error', 500));
			}
			await doc.save();
		}
	);

	res.status(200).json({
		success: true,
		msg: `Updated the review. ID: ${req.params.id}`,
		data: review,
	});
});

// @desc      Delete a review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	// Check review is exists
	if (!review) {
		return next(
			new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure is the owner of review?
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update review ${req.params.id}.`,
				401
			)
		);
	}

	await review.remove();

	res.status(200).json({
		success: true,
		msg: `Deleted the review. ID: ${req.params.id}`,
		data: {},
	});
});
