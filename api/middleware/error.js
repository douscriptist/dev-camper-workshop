const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log to console for dev
	console.log(err.stack.red);

	// Mongoose bad ObjectId - CastError
	if (err.name === 'CastError') {
		const message = `Resource not found with id of ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
		data: null,
	});
};

module.exports = errorHandler;
