const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env file
dotenv.config({ path: './config/config.env' });

// Connect to DB
connectDB();

const app = express();

// Middlawares

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// @Dev Logging Middleware // app.use(logger); // Custom logger
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Sanitize Data
app.use(mongoSanitize());

// Set Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 mins
	max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS // If API is public
app.use(cors());

// File Uploading
app.use(fileUpload());

// Set static folder for upload images etc.
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/reviews', require('./routes/reviews'));

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
