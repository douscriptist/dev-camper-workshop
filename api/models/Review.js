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

// Prevent user from submitting more than 1 review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to calculate average RATING
ReviewSchema.statics.getAvgRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: { $avg: '$rating' },
			},
		},
	]);

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: obj[0].averageRating.toFixed(1),
		});
	} catch (err) {
		console.log(err);
	}
};

// Call getAvgRating for calculating Rating after save
ReviewSchema.post('save', async function () {
	this.constructor.getAvgRating(this.bootcamp);
});
// // Call getAvgRating for calculating Rating after save
// ReviewSchema.post('findByIdAndUpdate', async function () {
// 	console.log('aaa');
// 	this.constructor.getAvgRating(this.bootcamp);
// });

// Call getAvgRating calculating Rating  after remove
ReviewSchema.post('remove', async function () {
	this.constructor.getAvgRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);
