const Bootcamp = require('../models/Bootcamp');

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();
		res.status(200).json({
			success: true,
			msg: 'Show all bootcamps.',
			count: bootcamps.length,
			data: bootcamps,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
			msg: err.message,
		});
	}
};

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findById(req.params.id);

		// If there is no bootcamp
		if (!bootcamp) {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(200).json({
			success: true,
			msg: `Get a bootcamp. ID: ${req.params.id}`,
			data: bootcamp,
		});
	} catch (err) {
		if (err.name === 'CastError') {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(400).json({
			success: false,
			msg: err.message,
		});
	}
};

// @desc      Create a bootcamp
// @route     POST /api/v1/bootcamps/:id
// @access    Private
exports.createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({
			success: true,
			msg: 'Created new bootcamp.',
			data: bootcamp,
		});
	} catch (err) {
		res.status(400).json({
			success: false,
			msg: err.message,
		});
	}
};

// @desc      Update a bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!bootcamp) {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(200).json({
			success: true,
			msg: `Updated bootcamp. ID: ${req.params.id}`,
			data: bootcamp,
		});
	} catch (err) {
		if (err.name === 'CastError') {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(400).json({
			success: false,
			msg: err.message,
		});
	}
};

// @desc      Delete a bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

		if (!bootcamp) {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(200).json({
			success: true,
			msg: `Deleted a bootcamp. ID: ${req.params.id}`,
			data: {},
		});
	} catch (err) {
		if (err.name === 'CastError') {
			return res.status(400).json({
				success: false,
				msg: 'Not a valid id.',
				data: null,
			});
		}
		res.status(400).json({
			success: false,
			msg: err.message,
		});
	}
};
