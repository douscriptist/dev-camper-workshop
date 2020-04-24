const express = require('express');
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsByDistance,
	bootcampUploadPhoto,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', require('./courses'));

router.route('/radius/:zipcode/:distance').get(getBootcampsByDistance);
router
	.route('/:id/photo')
	.put(protect, authorize('publisher', 'admin'), bootcampUploadPhoto);
router
	.route('/:id')
	.get(getBootcamp)
	.put(protect, authorize('publisher', 'admin'), updateBootcamp)
	.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
router
	.route('/')
	.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
	.post(protect, authorize('publisher', 'admin'), createBootcamp);

module.exports = router;
