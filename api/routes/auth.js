const express = require('express');
const {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateMe,
	updatePassword,
	logout,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/me/update/info', protect, updateMe);
router.put('/me/update/password', protect, updatePassword);
router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
