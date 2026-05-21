const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assigneeId } = req.query;
    let query = {};

    // Find projects where the user is either the creator or a member
    const visibleProjects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });
    const visibleProjectIds = visibleProjects.map((p) => p._id);

    // Filter by project visibility
    if (projectId) {
      // If a specific project was requested, ensure the user has access to it
      const hasAccess = visibleProjectIds.some((id) => id.toString() === projectId.toString());
      if (!hasAccess) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
      }
      query.projectId = projectId;
    } else {
      query.projectId = { $in: visibleProjectIds };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assigneeId) {
      query.assigneeId = assigneeId;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email role')
      .sort({ dueDate: 1 }); // Sort by due date (soonest first)

    res.json(tasks);
  } catch (error) {
    console.error('Get Tasks Error:', error.message);
    res.status(500).json({ message: 'Server error fetching tasks', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name members createdBy')
      .populate('assigneeId', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Access control: User must be project creator or member of the project
    const isMember = task.projectId.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );
    const isProjectCreator = task.projectId.createdBy && task.projectId.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isProjectCreator) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    // Remove raw members/creator arrays from project populate for response cleanliness
    const taskObj = task.toObject();
    if (taskObj.projectId) {
      delete taskObj.projectId.members;
      delete taskObj.projectId.createdBy;
    }

    res.json(taskObj);
  } catch (error) {
    console.error('Get Task By ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching task details', error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, priority, status, dueDate } = req.body;

    if (!title || !projectId || !dueDate) {
      return res.status(400).json({ message: 'Please provide all required fields (title, projectId, dueDate)' });
    }

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Access control: Only project creator or members can create tasks in this project
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some((mId) => mId.toString() === req.user._id.toString());
    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this project' });
    }

    // Verify if assignee is part of the project (if assigned)
    if (assigneeId) {
      const isProjectMember = project.members.some(
        (mId) => mId.toString() === assigneeId.toString()
      );
      if (!isProjectMember) {
        return res.status(400).json({ message: 'Assignee must be a member of the project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId: assigneeId || null,
      priority: priority || 'Medium',
      status: status || 'Todo',
      dueDate
    });

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email role');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assigneeId, priority, status, dueDate } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Access control: User must be project creator or member to update the task
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Not authorized to modify tasks in this project' });
    }

    // Role-based authorization and field restriction
    if (req.user.role !== 'admin') {
      // Member can ONLY update status
      if (title || description || assigneeId || priority || dueDate) {
        return res.status(403).json({
          message: 'Access Denied: Members are only permitted to update task status'
        });
      }

      if (status) {
        task.status = status;
      }
    } else {
      // Admin path: full update access
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (dueDate) task.dueDate = dueDate;
      
      if (assigneeId !== undefined) {
        if (assigneeId === null || assigneeId === '') {
          task.assigneeId = null;
        } else {
          // Verify assignee is in project
          const isProjectMember = project.members.some(
            (mId) => mId.toString() === assigneeId.toString()
          );
          if (!isProjectMember) {
            return res.status(400).json({ message: 'Assignee must be a member of the project' });
          }
          task.assigneeId = assigneeId;
        }
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name')
      .populate('assigneeId', 'name email role');

    res.json(populatedTask);
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({ message: 'Server error updating task', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    // Access control: Only project creator can delete tasks
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    if (!isCreator) {
      return res.status(403).json({ message: 'Not authorized to delete tasks in this project' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task successfully deleted' });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({ message: 'Server error deleting task', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
