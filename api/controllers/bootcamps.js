const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ['select', 'sort'];

	// Loop through removeFields & Delete from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create new query string
	let queryStr = JSON.stringify(reqQuery);

	// Create seatch operators ($gt, $lt etc.)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = Bootcamp.find(JSON.parse(queryStr));

	// Select Fields
	if (req.query.select) {
		// const fields = req.query.select.split(',').join(' ');
		const fields = req.query.select.replace(/,/g, ' ');
		query = query.select(fields);
	}

	// Sorting
	if (req.query.sort) {
		const sortBy = req.query.sort.replace(/,/g, ' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// Exec query
	const bootcamps = await query;

	res.status(200).json({
		success: true,
		msg: 'Show all bootcamps.',
		count: bootcamps.length,
		data: bootcamps,
	});
});

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	// If there is no bootcamp
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Get a bootcamp. ID: ${req.params.id}`,
		data: bootcamp,
	});
});

// @desc      Create a bootcamp
// @route     POST /api/v1/bootcamps/:id
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		msg: 'Created new bootcamp.',
		data: bootcamp,
	});
});

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Updated bootcamp. ID: ${req.params.id}`,
		data: bootcamp,
	});
});

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		msg: `Deleted a bootcamp. ID: ${req.params.id}`,
		data: {},
	});
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsByDistance = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat & lang from geocoder
	const location = await geocoder.geocode(zipcode);
	const lat = location[0].latitude;
	const lng = location[0].longitude;

	// Calculate radius using radian // Divide distance by radius of Earth // Earth Radius = 3,963 mi / 6,378 km
	const radius = distance / 6378;
	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	});
	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
