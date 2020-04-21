const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env file
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

const app = express();

// Middlawares
// app.use(logger); // Custom logger
// @Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
// @Prod Middlewares
// Body parser
app.use(express.json());

// ROUTES
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

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
