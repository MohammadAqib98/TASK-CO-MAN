import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { Plus, Pencil, Trash2, Users, Calendar, X } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const {
    projects,
    users,
    tasks,
    fetchProjects,
    fetchUsers,
    fetchTasks,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    projectsLoading
  } = useContext(AppContext);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamRolesState, setTeamRolesState] = useState({});

  // Team Tree & Manage Team Modal States
  const [treeModalOpen, setTreeModalOpen] = useState(false);
  const [manageTeamModalOpen, setManageTeamModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  
  // Manage Team Form State
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDesc, setMemberDesc] = useState('');
  const [isSubmittingTeamMember, setIsSubmittingTeamMember] = useState(false);

  // Keep activeProject in sync with latest changes in context projects
  useEffect(() => {
    if (activeProject) {
      const latestProj = projects.find((p) => p._id === activeProject._id);
      if (latestProj) {
        setActiveProject(latestProj);
      }
    }
  }, [projects, activeProject]);

  // Fetch projects, tasks, and users list
  useEffect(() => {
    fetchProjects();
    fetchTasks();
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [fetchProjects, fetchUsers, fetchTasks, user]);

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  // Modal controls
  const openCreateModal = () => {
    setModalMode('create');
    setName('');
    setDescription('');
    setSelectedMembers([user._id]); // Default: include the creator admin
    setTeamRolesState({
      [user._id]: {
        projectRole: 'Team Leader',
        roleDescription: 'Corporate Project Owner, system designer, and overall lead.'
      }
    });
    setCurrentProjectId(null);
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setModalMode('edit');
    setCurrentProjectId(project._id);
    setName(project.name);
    setDescription(project.description || '');
    setSelectedMembers(project.members.map((m) => m._id));
    
    // Build initial teamRolesState from project's populated teamRoles array
    const initialRoles = {};
    project.teamRoles?.forEach((r) => {
      const uId = r.user?._id || r.user;
      if (uId) {
        initialRoles[uId] = {
          projectRole: r.projectRole || '',
          roleDescription: r.roleDescription || ''
        };
      }
    });
    
    // Make sure the project creator has a team role initialized
    const creatorId = project.createdBy?._id || project.createdBy;
    if (creatorId && !initialRoles[creatorId]) {
      initialRoles[creatorId] = {
        projectRole: 'Team Leader',
        roleDescription: 'Corporate Project Owner, system designer, and overall lead.'
      };
    }

    setTeamRolesState(initialRoles);
    setModalOpen(true);
  };

  // Toggle member checkboxes
  const handleToggleMember = (userId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(userId)) {
        // Keep at least one admin, but otherwise allow removal
        return prev.filter((id) => id !== userId);
      } else {
        // Initialize empty roles if not present
        if (!teamRolesState[userId]) {
          setTeamRolesState((prevRoles) => ({
            ...prevRoles,
            [userId]: {
              projectRole: '',
              roleDescription: ''
            }
          }));
        }
        return [...prev, userId];
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    // Filter teamRolesState to only include selected members
    const teamRolesPayload = selectedMembers.map((userId) => {
      const roleData = teamRolesState[userId] || {};
      return {
        user: userId,
        projectRole: roleData.projectRole || 'Team Member',
        roleDescription: roleData.roleDescription || 'General execution and task tracking'
      };
    });

    let result;
    if (modalMode === 'create') {
      result = await createProject(name, description, selectedMembers, teamRolesPayload);
    } else {
      result = await updateProject(currentProjectId, name, description, selectedMembers, teamRolesPayload);
    }

    if (result.success) {
      setModalOpen(false);
    }
  };

  const handleDelete = async (projectId, projectName) => {
    if (window.confirm(`Warning: Deleting project "${projectName}" will permanently delete all associated tasks. Proceed?`)) {
      await deleteProject(projectId);
    }
  };

  const openTreeModal = (project) => {
    setActiveProject(project);
    setTreeModalOpen(true);
  };

  const openManageTeamModal = (project) => {
    setActiveProject(project);
    setMemberEmail('');
    setMemberRole('');
    setMemberDesc('');
    setManageTeamModalOpen(true);
  };

  const handleManageTeamSubmit = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setIsSubmittingTeamMember(true);
    const result = await addTeamMember(
      activeProject._id,
      memberEmail.trim(),
      memberRole.trim(),
      memberDesc.trim()
    );
    setIsSubmittingTeamMember(false);

    if (result.success) {
      setMemberEmail('');
      setMemberRole('');
      setMemberDesc('');
    }
  };

  // Helper to extract first initials for user avatar
  const getInitials = (userName) => {
    if (!userName) return 'U';
    const parts = userName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  // Calculate project completion statistics
  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter((t) => t.projectId?._id === projectId || t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'Done').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-title-block">
          <h1 className="page-main-title">Team Projects</h1>
          <p className="page-sub-title">
            {isAdmin 
              ? 'Initiate and manage project scopes, scopes of work, and teammate authorizations' 
              : 'Active corporate projects and scope configurations you are assigned to'}
          </p>
        </div>

        {isAdmin && (
          <button className="action-btn" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid Display */}
      {projectsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
          Retrieving projects checklist...
        </div>
      ) : projects.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '350px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '3rem' }}>📂</div>
          <div>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 700 }}>No Projects Found</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '300px' }}>
              {isAdmin 
                ? 'Create a new project workspace to begin assigning work scopes.' 
                : 'You are not assigned to any projects currently. Ask your administrator.'}
            </p>
          </div>
          {isAdmin && (
            <button className="action-btn" onClick={openCreateModal} style={{ padding: '8px 16px' }}>
              Create a Project Workspace
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <article key={project._id} className="project-card">
              <div className="project-card-header">
                <h3 className="project-card-title">{project.name}</h3>
                
                {/* Admin controls */}
                {isAdmin && (
                  <div className="project-admin-actions">
                    <button
                      className="card-icon-btn"
                      onClick={() => openEditModal(project)}
                      title="Edit project details"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="card-icon-btn delete"
                      onClick={() => handleDelete(project._id, project.name)}
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <p className="project-card-desc">
                {project.description || 'No description provided for this project.'}
              </p>

              {/* Dynamic Project Progress Bar */}
              {(() => {
                const { total, completed, percent } = getProjectStats(project._id);
                return (
                  <div className="project-progress-section" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Progress</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{percent}% ({completed}/{total})</span>
                    </div>
                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(79, 70, 229, 0.05)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)',
                        borderRadius: '3px',
                        transition: 'width 0.8s ease-in-out',
                        boxShadow: '0 0 6px rgba(79, 70, 229, 0.3)'
                      }} />
                    </div>
                  </div>
                );
              })()}

              {/* Team Hierarchy & Management Actions */}
              {(() => {
                const isCreator = project.createdBy && (project.createdBy._id === user._id || project.createdBy === user._id);
                const isCreatorOrAdmin = isAdmin && isCreator;
                return (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button
                      className="action-btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                      onClick={() => openTreeModal(project)}
                    >
                      🌳 View Tree
                    </button>
                    {isCreatorOrAdmin && (
                      <button
                        className="action-btn"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                        onClick={() => openManageTeamModal(project)}
                      >
                        👥 Manage Team
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className="project-card-footer">
                {/* Visual Avatar Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Team Assigned ({project.members?.length || 0})
                  </span>
                  <div className="project-members-stack">
                    {(() => {
                      const sortedMembers = [...(project.members || [])].sort((a, b) => {
                        const aId = a._id ? a._id.toString() : '';
                        const bId = b._id ? b._id.toString() : '';
                        const creatorId = project.createdBy && (project.createdBy._id ? project.createdBy._id.toString() : project.createdBy.toString());
                        
                        const aIsCreator = creatorId && aId === creatorId;
                        const bIsCreator = creatorId && bId === creatorId;
                        
                        if (aIsCreator && !bIsCreator) return -1;
                        if (!aIsCreator && bIsCreator) return 1;
                        if (a.role === 'admin' && b.role !== 'admin') return -1;
                        if (a.role !== 'admin' && b.role === 'admin') return 1;
                        return 0;
                      });

                      return sortedMembers.map((member) => {
                        const isLeader = project.createdBy && (member._id === (project.createdBy._id || project.createdBy) || member.role === 'admin');
                        return (
                          <div
                            key={member._id}
                            className={`member-avatar-mini ${isLeader ? 'leader' : ''}`}
                            title={`${member.name} (${isLeader ? 'Team Leader' : 'Team Member'})`}
                          >
                            {isLeader && <span className="leader-crown">👑</span>}
                            {getInitials(member.name)}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Tasks Count */}
                <div className="project-tasks-count" title="Total active tasks inside project">
                  <Calendar size={13} style={{ color: 'var(--primary)' }} />
                  <span>{getProjectStats(project._id).total} Tasks</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Admin Creator/Editor Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? 'Create Project Workspace' : 'Edit Project Details'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide a summary description of project boundaries and team responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Team Members Selection Checklist */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={14} style={{ color: 'var(--primary)' }} />
                    <span>Authorize Teammates</span>
                  </label>
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {users.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        No members available.
                      </span>
                    ) : (
                      users.map((item) => (
                        <div
                          key={item._id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '10px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            backgroundColor: selectedMembers.includes(item._id) ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
                            borderColor: selectedMembers.includes(item._id) ? 'var(--primary)' : 'var(--border-color)',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              fontSize: '0.88rem'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(item._id)}
                              onChange={() => handleToggleMember(item._id)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.email} ({item.role === 'admin' ? 'Team Leader' : 'Team Member'})</span>
                            </div>
                          </label>

                          {/* Role Details Inputs if Selected */}
                          {selectedMembers.includes(item._id) && (
                            <div 
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px', 
                                marginTop: '4px',
                                paddingLeft: '26px',
                                borderLeft: '2px solid var(--primary-light)'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Assign Project Role</span>
                                <input
                                  type="text"
                                  placeholder={item.role === 'admin' ? 'Team Leader' : 'e.g. Lead Designer'}
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '4px' }}
                                  value={teamRolesState[item._id]?.projectRole || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTeamRolesState((prev) => ({
                                      ...prev,
                                      [item._id]: {
                                        ...prev[item._id],
                                        projectRole: val
                                      }
                                    }));
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Role Description</span>
                                <textarea
                                  placeholder="What are their key responsibilities on this team?"
                                  className="form-textarea"
                                  style={{ padding: '6px 10px', fontSize: '0.8rem', minHeight: '50px', borderRadius: '4px' }}
                                  value={teamRolesState[item._id]?.roleDescription || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTeamRolesState((prev) => ({
                                      ...prev,
                                      [item._id]: {
                                        ...prev[item._id],
                                        roleDescription: val
                                      }
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn">
                  {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌳 Team Tree Hierarchy Modal */}
      {treeModalOpen && activeProject && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌳 {activeProject.name} Team Tree Hierarchy</span>
              </h2>
              <button
                onClick={() => setTreeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowX: 'auto', backgroundColor: 'var(--bg-app)', padding: '24px' }}>
              <div className="org-tree-scroll-container">
                <div className="org-tree-wrapper">
                  {/* Team Leader Node */}
                  <div className="org-tree-root-container">
                    {(() => {
                      const leader = activeProject.createdBy;
                      const leaderRoleData = activeProject.teamRoles?.find(
                        (r) => r.user?._id === (leader?._id || leader) || r.user === (leader?._id || leader)
                      );
                      const leaderRole = leaderRoleData?.projectRole || 'Team Leader';
                      const leaderDesc = leaderRoleData?.roleDescription || 'Corporate Project Owner, system designer, and overall lead.';
                      
                      return (
                        <div className="org-tree-node leader">
                          <div className="node-avatar-wrapper">
                            <div className="node-avatar">
                              {leader ? getInitials(leader.name) : 'L'}
                            </div>
                            <span className="node-crown-icon" title="Team Leader">👑</span>
                          </div>
                          <h4 className="node-name">{leader ? leader.name : 'Unknown Leader'}</h4>
                          <p className="node-email">{leader ? leader.email : ''}</p>
                          <span className="node-role-badge">{leaderRole}</span>
                          <p className="node-role-desc">{leaderDesc}</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Connecting lines & Members */}
                  {(() => {
                    const creatorIdStr = (activeProject.createdBy?._id || activeProject.createdBy || '').toString();
                    const treeMembers = (activeProject.members || []).filter(
                      (m) => m._id.toString() !== creatorIdStr
                    );

                    if (treeMembers.length === 0) {
                      return (
                        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👥</div>
                          <span>No team members are assigned yet. Assign teammates via <strong>Manage Team</strong> to build the tree!</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="org-tree-connector-v line-down" />
                        <div className="org-tree-members-container">
                          {treeMembers.map((member, index) => {
                            const customRoleData = activeProject.teamRoles?.find(
                              (r) => (r.user?._id || r.user || '').toString() === member._id.toString()
                            );
                            const projectRole = customRoleData?.projectRole || 'Team Member';
                            const roleDescription = customRoleData?.roleDescription || 'General execution and task tracking';

                            return (
                              <div className="org-tree-member-column" key={member._id}>
                                <div className="org-tree-connector-h-container">
                                  {/* Left side connector */}
                                  <div 
                                    className="org-tree-connector-h" 
                                    style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
                                  />
                                  {/* Down connector */}
                                  <div className="org-tree-connector-v line-down-sub" />
                                  {/* Right side connector */}
                                  <div 
                                    className="org-tree-connector-h" 
                                    style={{ visibility: index === treeMembers.length - 1 ? 'hidden' : 'visible' }}
                                  />
                                </div>

                                <div className="org-tree-node member">
                                  <div className="node-avatar-wrapper">
                                    <div className="node-avatar">
                                      {getInitials(member.name)}
                                    </div>
                                  </div>
                                  <h4 className="node-name">{member.name}</h4>
                                  <p className="node-email">{member.email}</p>
                                  <span className="node-role-badge">{projectRole}</span>
                                  <p className="node-role-desc">{roleDescription}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-btn" onClick={() => setTreeModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Manage Project Team & Custom Roles Modal */}
      {manageTeamModalOpen && activeProject && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '650px', width: '90%' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👥 Team Builder: {activeProject.name}</span>
              </h2>
              <button
                onClick={() => setManageTeamModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              
              {/* Form to Assign/Invite a Teammate by email with Custom Role */}
              <form onSubmit={handleManageTeamSubmit}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Assign Teammate & Project Role
                </h3>
                <div className="team-builder-form-grid">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Teammate Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                      placeholder="e.g. alice@taskmanager.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Project Role</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                        placeholder="e.g. Lead UI/UX Designer"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Role Description</label>
                    <textarea
                      className="form-textarea"
                      style={{ padding: '8px 12px', fontSize: '0.88rem', minHeight: '60px' }}
                      placeholder="e.g. Handles style guides, client mockups, and page layouts..."
                      value={memberDesc}
                      onChange={(e) => setMemberDesc(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="action-btn" 
                    style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem' }}
                    disabled={isSubmittingTeamMember}
                  >
                    {isSubmittingTeamMember ? 'Assigning...' : 'Assign/Update Teammate'}
                  </button>
                </div>
              </form>

              {/* Roster list */}
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', marginTop: '20px' }}>
                Current Team Roster
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Roster of members */}
                {(() => {
                  const sortedMembers = [...(activeProject.members || [])].sort((a, b) => {
                    const isALeader = (activeProject.createdBy?._id || activeProject.createdBy || '').toString() === a._id.toString();
                    const isBLeader = (activeProject.createdBy?._id || activeProject.createdBy || '').toString() === b._id.toString();
                    if (isALeader && !isBLeader) return -1;
                    if (!isALeader && isBLeader) return 1;
                    return 0;
                  });

                  return sortedMembers.map((member) => {
                    const isLeader = (activeProject.createdBy?._id || activeProject.createdBy || '').toString() === member._id.toString();
                    const roleData = activeProject.teamRoles?.find(
                      (r) => (r.user?._id || r.user || '').toString() === member._id.toString()
                    );
                    const projectRole = isLeader 
                      ? (roleData?.projectRole || 'Team Leader')
                      : (roleData?.projectRole || 'Team Member');
                    const roleDescription = isLeader 
                      ? (roleData?.roleDescription || 'Corporate Project Owner, system designer, and overall lead.')
                      : (roleData?.roleDescription || 'General execution and task tracking');

                    return (
                      <div key={member._id} className="team-member-item-row">
                        <div className="member-info-col">
                          <div className="member-name-email">
                            {member.name} <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '0.8rem' }}>({member.email})</span>
                            {isLeader && <span style={{ marginLeft: '6px', fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Leader 👑</span>}
                          </div>
                          <div className="member-role-txt">{projectRole}</div>
                          <div className="member-desc-txt">{roleDescription}</div>
                        </div>

                        {/* If it's a team member, provide a quick 'load-to-form' action to edit */}
                        {!isLeader && (
                          <button
                            type="button"
                            className="action-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setMemberEmail(member.email);
                              setMemberRole(projectRole);
                              setMemberDesc(roleDescription);
                            }}
                          >
                            Edit Role
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

            </div>

            <div className="modal-footer">
              <button className="action-btn" onClick={() => setManageTeamModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
