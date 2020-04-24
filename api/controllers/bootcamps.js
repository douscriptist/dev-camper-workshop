const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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
	// Add user to req.body // req.user comes from middleware so we can use
	req.body.user = req.user.id;

	// Check for published bootcamps // Because Limit = 2 per/publisher
	const publishedBootcamps = await Bootcamp.find({ user: req.user.id });
	// If the user is not an admin, they can only add 2 bootcamps
	// LATER: active bootcamps / after bootcamp dont delete? store as a passive/past
	if (publishedBootcamps.length >= 2 && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`The user with ID: ${req.user.id} already has 2 bootcamps active.`
			),
			400
		);
	}

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
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}

	await bootcamp.remove();

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

// @desc      Upload a photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file.`, 400));
	}

	const file = req.files.file;

	// Check if the image is photo?
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse(`Please upload an image file.`, 400));
	}

	// Check filesize
	if (file.size > process.env.FILE_MAX_UPLOAD_LIMIT) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${
					process.env.FILE_MAX_UPLOAD_LIMIT / 1000000
				}mb.`,
				400
			)
		);
	}

	// Create Custom filename
	file.name = `BOOTCAMP_${bootcamp._id}_${new Date()
		.toLocaleDateString('lv-LV')
		.split('.')
		.join('')}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.log(err);
			return next(
				new ErrorResponse('Problem with file upload. Try again later.', 500)
			);
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
		res.status(200).json({
			success: true,
			msg: `Uploaded photo succesfully.`,
			data: file.name,
		});
	});
});
