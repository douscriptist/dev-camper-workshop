const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// Protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	// Check the header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	// else if (req.cookies.token) {
	// 	token = req.cookies.token;
	// }

	// Check token exists
	if (!token) {
		return next(new ErrorResponse('Not authorized.', 401));
	}

	// Verify token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		console.log(decoded);

		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return next(new ErrorResponse('Not authorized.', 401));
	}
});
