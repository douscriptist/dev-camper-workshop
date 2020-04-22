const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env file & variables
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect Database
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/source/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/source/_data/courses.json`, 'utf-8')
);

// Import into Database
const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		await Course.create(courses);

		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

// Delete Data
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		await Course.deleteMany();

		console.log('Data Destroyed...'.red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '-import') {
	importData();
} else if (process.argv[2] === '-destroy') {
	deleteData();
}