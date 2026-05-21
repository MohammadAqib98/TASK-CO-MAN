const express = require('express');
const router = express.Router();
const { getUsers, getCurrentUser } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('admin'), getUsers);
router.get('/me', protect, getCurrentUser);

module.exports = router;
