const express = require('express');
const {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateMe,
	updatePassword,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me/update/info', protect, updateMe);
router.put('/me/update/password', protect, updatePassword);
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
