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

module.exports = mongoose.model('Course', CourseSchema);
