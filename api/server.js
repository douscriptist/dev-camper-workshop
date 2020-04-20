const express = require('express');
const dotenv = require('dotenv');

// Load env file
dotenv.config({ path: './config/config.env' });

const app = express();

// ROUTES
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));

const PORT = process.env.PORT || 4500;

app.listen(
	PORT,
	console.log(
		`Server running in "${process.env.NODE_ENV}" mode on port ${PORT}`
	)
);
