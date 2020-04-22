const express = require('express');
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsByDistance,
} = require('../controllers/bootcamps');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', require('./courses'));

router.route('/radius/:zipcode/:distance').get(getBootcampsByDistance);

router.route('/').get(getBootcamps).post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
