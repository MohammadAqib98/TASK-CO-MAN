const User = require('../models/User');

// @desc    Get all users (for project/task assignment)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get Users Error:', error.message);
    res.status(500).json({ message: 'Server error fetching user list', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(req.user);
  } catch (error) {
    console.error('Get Me Error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile details', error: error.message });
  }
};

module.exports = {
  getUsers,
  getCurrentUser
};
