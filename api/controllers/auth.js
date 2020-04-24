const crypto = require('crypto');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

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

	sendTokenResponse(user, 200, res);
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

	sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update user details (self not admin privilages)
// @route     PUT /api/v1/auth/me/update/info
// @access    Private
exports.updateMe = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update user password (self not admin privilages)
// @route     PUT /api/v1/auth/me/update/password
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// Check current password is correct
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect.', 401));
	}

	// Set the new password
	user.password = req.body.newPassword;
	await user.save();

	// Send back token // after change password logout all
	sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	// If user exists
	if (!user) {
		return next(
			new ErrorResponse(
				'There is no related user registered with this email',
				404
			)
		);
	}

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. If was that you please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset Confirmation',
			message,
		});
		res.status(200).json({
			success: true,
			message: 'Email sent.',
		});
	} catch (err) {
		console.log(err);

		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new ErrorResponse('Email could not be sent. Please try again later.', 500)
		);
	}
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resetToken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// Get hashed password
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resetToken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('Token is invalid.', 400));
	}

	// Set New Password & Set token and expire undefined
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password Reset Successfull',
			message: 'Your password changed successfully.',
		});
	} catch (err) {
		console.log(err);
	}

	// send token because logout from all after reset password
	sendTokenResponse(user, 200, res);
});

// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create Token // Comes from User model as methods not statics
	const token = user.getSignedJWTToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};
