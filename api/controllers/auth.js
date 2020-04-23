const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

const User = require('../models/User');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	// Create Token // Comes from User model as methods not statics
	const token = user.getSignedJWTToken();

	res.status(200).json({
		success: true,
		msg: 'Registered successfully.',
		token,
	});
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email & password
	if (!email || !password) {
		return next(new ErrorResponse('Email and password is required.', 400));
	}

	// Check if user exists
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		return next(new ErrorResponse('User not found.', 401));
	}

	// Check if password match
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return next(new ErrorResponse('Password is wrong.', 401));
	}

	// Create Token // Comes from User model as methods not statics
	const token = user.getSignedJWTToken();

	res.status(200).json({
		success: true,
		msg: 'Logged in successfully.',
		token,
	});
});
