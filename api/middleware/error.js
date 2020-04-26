const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log to console for dev
	// console.log(err.stack.red);
	console.log(err.stack.red);

	// Mongoose bad ObjectId - CastError
	if (err.name === 'CastError') {
		const message = `Resource not found.`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose duplicate key - MongoError - 11000
	if (err.code === 11000) {
		const message = 'Duplicate field value entered.';
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation error - ValidationError
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map((value) => value.message);
		error = new ErrorResponse(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
		data: null,
	});
};

module.exports = errorHandler;
