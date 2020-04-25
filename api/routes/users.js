const express = require('express');
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// For all routes using admin role & protection so
router.use(protect);
router.use(authorize('admin'));

router.get('/', advancedResults(User), getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id', getUser);

module.exports = router;
