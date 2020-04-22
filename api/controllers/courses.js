const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;

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
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		query = Course.find().populate('bootcamp', ['name', 'description']);
		// or alternative
		// .populate({
		// 	path: 'bootcamp',
		// 	select: 'name description',
		// });
	}

	const courses = await query;

	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses,
	});
});
