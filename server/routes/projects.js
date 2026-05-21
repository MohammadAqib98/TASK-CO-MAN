const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMemberByEmail
} = require('../controllers/projectController');
const { protect, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(requireRole('admin'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(requireRole('admin'), updateProject)
  .delete(requireRole('admin'), deleteProject);

router.route('/:id/team')
  .post(requireRole('admin'), addTeamMemberByEmail);

module.exports = router;
