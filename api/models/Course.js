const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Course title is required.'],
	},
	description: {
		type: String,
		required: [true, 'Description is required.'],
	},
	weeks: {
		type: Number,
		required: [true, 'Number of weeks is required.'],
	},
	tuition: {
		type: Number,
		required: [true, 'Number of weeks is required.'],
	},
	minimumSkill: {
		type: String,
		required: [true, 'Minimim Skill info is required.'],
		enum: ['beginner', 'elementary', 'intermediate', 'advanced', 'native'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
});

// Static method to calculate average tuition of courses
CourseSchema.statics.getAverage = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' },
				averageWeek: { $avg: '$weeks' },
			},
		},
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.round(obj[0].averageCost / 10) * 10,
			averageWeek: Math.round(obj[0].averageWeek),
		});
	} catch (err) {
		// LATER: throw custom Handler?
		console.log(err);
	}
};

// Call getAverage Cost & Duration(weeks) after save
CourseSchema.post('save', async function () {
	this.constructor.getAverage(this.bootcamp);
});

// Call getAverage Cost & Duration(weeks) after save
CourseSchema.pre('remove', async function () {
	this.constructor.getAverage(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
