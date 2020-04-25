const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Review title is required.'],
		maxlength: 80,
	},
	text: {
		type: String,
		required: [true, 'Please add your opinion.'],
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [true, 'Rating is required.'],
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Bootcamp',
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Review', ReviewSchema);
