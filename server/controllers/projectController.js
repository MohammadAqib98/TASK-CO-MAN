const Project = require('../models/Project');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
  try {
    // Both admins and members can only see projects they created or are members of
    const query = {
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .populate('teamRoles.user', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error.message);
    res.status(500).json({ message: 'Server error fetching projects', error: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .populate('teamRoles.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control: User must be the project creator or a member of the project
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());

    if (!isCreator && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get Project By ID Error:', error.message);
    res.status(500).json({ message: 'Server error fetching project details', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, members, teamRoles } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Ensure createdBy is the admin and include them in the members if appropriate, or just set members as passed
    const projectMembers = members || [];
    // Optionally auto-add the creator admin to the members list
    if (!projectMembers.includes(req.user._id.toString())) {
      projectMembers.push(req.user._id);
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: projectMembers,
      teamRoles: teamRoles || []
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .populate('teamRoles.user', 'name email role');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create Project Error:', error.message);
    res.status(500).json({ message: 'Server error creating project', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { name, description, members, teamRoles } = req.body;
    
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control: Only the creator of the project can update it
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (members) {
      // Ensure admin creator remains a member if necessary, or just overwrite
      project.members = members;
    }
    if (teamRoles) {
      project.teamRoles = teamRoles;
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .populate('teamRoles.user', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    console.error('Update Project Error:', error.message);
    res.status(500).json({ message: 'Server error updating project', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control: Only the creator of the project can delete it
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Cascading delete tasks belonging to this project
    await Task.deleteMany({ projectId: req.params.id });

    // Remove the project
    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project and all associated tasks successfully deleted' });
  } catch (error) {
    console.error('Delete Project Error:', error.message);
    res.status(500).json({ message: 'Server error deleting project', error: error.message });
  }
};

// @desc    Add team member and role by email
// @route   POST /api/projects/:id/team
// @access  Private/Admin
const addTeamMemberByEmail = async (req, res) => {
  try {
    const { email, projectRole, roleDescription } = req.body;
    const projectId = req.params.id;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required to invite a teammate' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Access control: Only the project creator can add team members
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this project\'s team' });
    }

    // Find the user by email
    const User = require('../models/User');
    const memberUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!memberUser) {
      return res.status(404).json({ 
        message: `Teammate with email "${email}" is not registered on TASK-CO-MAN. Please verify they have signed up first.` 
      });
    }

    const memberUserId = memberUser._id;

    // Add to members list if not already present
    if (!project.members.includes(memberUserId)) {
      project.members.push(memberUserId);
    }

    // Update or add in teamRoles
    const roleIndex = project.teamRoles.findIndex(
      (r) => r.user.toString() === memberUserId.toString()
    );

    const roleData = {
      user: memberUserId,
      projectRole: projectRole || 'Team Member',
      roleDescription: roleDescription || 'General execution and task tracking'
    };

    if (roleIndex > -1) {
      project.teamRoles[roleIndex] = roleData;
    } else {
      project.teamRoles.push(roleData);
    }

    await project.save();

    const populatedProject = await Project.findById(projectId)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .populate('teamRoles.user', 'name email role');

    res.json(populatedProject);
  } catch (error) {
    console.error('Add Team Member By Email Error:', error.message);
    res.status(500).json({ message: 'Server error managing team roles', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMemberByEmail
};
