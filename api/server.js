const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env file
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

const app = express();

// Middlawares

// Body parser
app.use(express.json());

// @Dev Logging Middleware // app.use(logger); // Custom logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// File Uploading
app.use(fileUpload());

// Set static folder for upload images etc.
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));

app.use(errorHandler);

const PORT = process.env.PORT || 4500;

const server = app.listen(
	PORT,
	console.log(
		`Server running in "${process.env.NODE_ENV}" mode on port ${PORT}`.blue.bold
	)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.bgRed.bold);
	// Close server & exit process
	server.close(() => process.exit(1));
});
