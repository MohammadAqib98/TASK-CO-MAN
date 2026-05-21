const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(requireRole('admin'), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask) // Both admins and members can access, but controller handles restrictions
  .delete(requireRole('admin'), deleteTask);

module.exports = router;
