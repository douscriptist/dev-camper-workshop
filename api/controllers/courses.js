const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
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
		const courses = await Course.find({ bootcamp: req.params.bootcampId });
		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate('bootcamp', [
		'name',
		'description',
	]);

	// Check course is available
	if (!course) {
		return next(
			new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		msg: `Get a course. ID: ${req.params.id}`,
		data: course,
	});
});

// @desc      Add/Create a course
// @route     POST /api/v1/bootcamp/:bootcampId/courses
// @access    Private
exports.createCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;

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

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		msg: 'Created new course.',
		data: course,
	});
});

// @desc      Update a course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	// Check course is exists
	if (!course) {
		return next(
			new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		msg: `Updated the course. ID: ${req.params.id}`,
		data: course,
	});
});

// @desc      Delete a course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	// Check course is exists
	if (!course) {
		return next(
			new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
		);
	}

	await course.remove();

	res.status(200).json({
		success: true,
		msg: `Deleted the course. ID: ${req.params.id}`,
		data: {},
	});
});
