import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, AlertCircle, Clock, Layers, CheckSquare, Plus, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    tasks,
    projects,
    fetchTasks,
    fetchProjects,
    tasksLoading,
    projectsLoading,
    updateTask,
    showToast,
    addTeamMember
  } = useContext(AppContext);

  const navigate = useNavigate();

  // Admin Team Builder States
  const [selectedProjectId, setSelectedProjectId] = React.useState('');
  const [memberEmail, setMemberEmail] = React.useState('');
  const [memberRole, setMemberRole] = React.useState('');
  const [memberDesc, setMemberDesc] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-select the first project once loaded
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  // Load backend data on load
  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  if (!user) return null;

  // Filter Tasks Assigned to current User (Checklist section)
  const myTasks = tasks
    .filter((task) => task.assigneeId?._id === user._id)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Determine if a task is Overdue (Past due date, and NOT Done)
  const isOverdue = (task) => {
    return task.status !== 'Done' && new Date(task.dueDate) < new Date();
  };

  // Math Statistics based on active dataset (Admins see system-wide, Members see assigned project bounds)
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;

  // Format date display for checklist cards
  const formatTaskDate = (dateStr, isOverdueState) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle checklist click to instantly mark a task as Done
  const handleToggleComplete = async (task) => {
    const originalStatus = task.status;
    const newStatus = originalStatus === 'Done' ? 'Todo' : 'Done';
    
    showToast(`Updating task: "${task.title}" to ${newStatus}...`, 'info');
    
    const result = await updateTask(task._id, { status: newStatus });
    if (result.success) {
      showToast(`Task marked as ${newStatus}!`, 'success');
    }
  };

  const getInitials = (userName) => {
    if (!userName) return 'U';
    const parts = userName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName[0].toUpperCase();
  };

  const handleManageTeamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !memberEmail.trim()) return;

    setIsSubmitting(true);
    const result = await addTeamMember(
      selectedProjectId,
      memberEmail.trim(),
      memberRole.trim(),
      memberDesc.trim()
    );
    setIsSubmitting(false);

    if (result.success) {
      setMemberEmail('');
      setMemberRole('');
      setMemberDesc('');
    }
  };

  // Modern Mock Activity Logs representing recent updates
  const recentActivities = [
    {
      id: 'act-1',
      desc: <strong>Alice Smith</strong>,
      action: 'completed task "Design Notion-style mockups"',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 'act-2',
      desc: <strong>System Admin</strong>,
      action: 'created project "Mobile Application"',
      time: '1 day ago',
      type: 'create'
    },
    {
      id: 'act-3',
      desc: <strong>Bob Jones</strong>,
      action: 'joined project "Mobile Application"',
      time: '1 day ago',
      type: 'user'
    },
    {
      id: 'act-4',
      desc: <strong>System Admin</strong>,
      action: 'assigned task "Create core navigation router" to Bob Jones',
      time: '1 day ago',
      type: 'assign'
    },
    {
      id: 'act-5',
      desc: <strong>Alice Smith</strong>,
      action: 'started working on "Implement Express API endpoints"',
      time: '3 days ago',
      type: 'progress'
    }
  ];

  // Calculate completion percentage
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-title-block">
          <h1 className="page-main-title">Welcome back, {user.name.split(' ')[0]}👋</h1>
          <p className="page-sub-title">
            {user.role === 'admin' 
              ? 'Workspace overview across all active corporate initiatives' 
              : 'Your assigned work priorities and project updates'}
          </p>
        </div>

        {user.role === 'admin' && (
          <button
            className="action-btn"
            onClick={() => navigate('/tasks')}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        )}
      </div>

      {/* Workspace Health Indicator Banner */}
      <div className="workspace-health-banner" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(129, 140, 248, 0.02) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.12)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Workspace Health Score</span>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              {completionRate}% Completed
            </span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {totalTasksCount === 0 
              ? 'Get started by creating projects and assigning workflow tasks!' 
              : `Your team has completed ${completedCount} out of ${totalTasksCount} tasks. ${completionRate >= 80 ? 'Excellent work, you are hitting your milestone!' : 'Focus on completing In Progress and Review items to boost velocity.'}`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto', minWidth: '200px' }}>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'rgba(79, 70, 229, 0.03)',
            borderRadius: '5px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)',
              borderRadius: '5px',
              transition: 'width 1s ease-in-out',
              boxShadow: '0 0 10px rgba(79, 70, 229, 0.2)'
            }} />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-grid">
        <div 
          className="stat-card total" 
          onClick={() => navigate('/tasks')} 
          style={{ cursor: 'pointer' }}
          title="Click to view all tasks"
        >
          <div className="stat-icon-wrapper">
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{tasksLoading ? '...' : totalTasksCount}</span>
          </div>
        </div>

        <div 
          className="stat-card completed"
          onClick={() => navigate('/tasks', { state: { initialFilterStatus: 'Done' } })}
          style={{ cursor: 'pointer' }}
          title="Click to filter by completed tasks"
        >
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{tasksLoading ? '...' : completedCount}</span>
          </div>
        </div>

        <div 
          className="stat-card progress"
          onClick={() => navigate('/tasks', { state: { initialFilterStatus: 'In Progress' } })}
          style={{ cursor: 'pointer' }}
          title="Click to filter by in-progress tasks"
        >
          <div className="stat-icon-wrapper">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{tasksLoading ? '...' : inProgressCount}</span>
          </div>
        </div>

        <div 
          className="stat-card overdue"
          onClick={() => navigate('/tasks', { state: { initialFilterOverdue: true } })}
          style={{ cursor: 'pointer' }}
          title="Click to filter by overdue tasks"
        >
          <div className="stat-icon-wrapper">
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overdue</span>
            <span className="stat-value">{tasksLoading ? '...' : overdueCount}</span>
          </div>
        </div>
      </div>

      {/* Leader/Admin Team Builder & Tree Hub */}
      {user.role === 'admin' && projects.length > 0 && (
        <section className="section-panel" style={{ marginBottom: '24px' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🌳 Project Team Builder & Org Tree Hub</span>
            </h3>
            
            {/* Project Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selected Project:</span>
              <select
                className="form-select"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.88rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(() => {
              const activeProject = projects.find((p) => p._id === selectedProjectId);
              if (!activeProject) return null;

              const leader = activeProject.createdBy;
              const leaderRoleData = activeProject.teamRoles?.find(
                (r) => r.user?._id === (leader?._id || leader) || r.user === (leader?._id || leader)
              );
              const leaderRole = leaderRoleData?.projectRole || 'Team Leader';
              const leaderDesc = leaderRoleData?.roleDescription || 'Corporate Project Owner, system designer, and overall lead.';

              const creatorIdStr = (activeProject.createdBy?._id || activeProject.createdBy || '').toString();
              const treeMembers = (activeProject.members || []).filter(
                (m) => m._id.toString() !== creatorIdStr
              );

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* 1. Live Org Tree Visualizer */}
                  <div style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '24px',
                    overflowX: 'auto'
                  }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
                      🌳 Hierarchical Org Tree for {activeProject.name}
                    </h4>

                    <div className="org-tree-scroll-container" style={{ minHeight: '380px', padding: '10px 0' }}>
                      <div className="org-tree-wrapper">
                        {/* Leader */}
                        <div className="org-tree-root-container">
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
                        </div>

                        {/* Lines and Members */}
                        {treeMembers.length === 0 ? (
                          <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>👥</div>
                            <span>No members assigned yet. Use the Team Builder form below to add teammates!</span>
                          </div>
                        ) : (
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
                                      <div 
                                        className="org-tree-connector-h" 
                                        style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
                                      />
                                      <div className="org-tree-connector-v line-down-sub" />
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
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Team Builder & Roster (Side-by-Side Flex Layout) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    
                    {/* Form */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👥 Quick Add/Update Member</span>
                      </h4>
                      
                      <form onSubmit={handleManageTeamSubmit}>
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700 }}>MEMBER EMAIL ADDRESS *</label>
                          <input
                            type="email"
                            className="form-input"
                            style={{ padding: '8px 12px', fontSize: '0.88rem', border: '1px solid var(--border-color)' }}
                            placeholder="e.g. alice@taskmanager.com"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700 }}>PROJECT WORK ROLE</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '8px 12px', fontSize: '0.88rem', border: '1px solid var(--border-color)' }}
                            placeholder="e.g. Senior Frontend Architect"
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label className="form-label" style={{ fontSize: '0.72rem', fontWeight: 700 }}>ROLE DESCRIPTION / RESPONSIBILITY</label>
                          <textarea
                            className="form-textarea"
                            style={{ padding: '8px 12px', fontSize: '0.85rem', minHeight: '60px', border: '1px solid var(--border-color)' }}
                            placeholder="e.g. Designs landing frameworks, client portals, and coordinates styles."
                            value={memberDesc}
                            onChange={(e) => setMemberDesc(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          className="action-btn"
                          style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Processing...' : 'Assign/Update Member'}
                        </button>
                      </form>
                    </div>

                    {/* Active Roster List */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                        Teammate Roster ({activeProject.members?.length || 0})
                      </h4>
                      <div style={{ overflowY: 'auto', flex: 1, maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeProject.members?.map((m) => {
                          const isProjLeader = m._id.toString() === creatorIdStr;
                          const rData = activeProject.teamRoles?.find(
                            (r) => (r.user?._id || r.user || '').toString() === m._id.toString()
                          );
                          const roleName = isProjLeader ? (rData?.projectRole || 'Team Leader') : (rData?.projectRole || 'Team Member');
                          const roleDesc = isProjLeader ? (rData?.roleDescription || 'Corporate Project Owner, system designer, and overall lead.') : (rData?.roleDescription || 'General execution and task tracking');

                          return (
                            <div key={m._id} className="team-member-item-row" style={{ padding: '8px 12px', marginBottom: 0 }}>
                              <div className="member-info-col">
                                <div className="member-name-email" style={{ fontSize: '0.82rem' }}>
                                  {m.name} <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '0.75rem' }}>({m.email})</span>
                                  {isProjLeader && <span style={{ marginLeft: '4px', fontSize: '0.68rem', backgroundColor: '#FEF3C7', color: '#D97706', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>Leader 👑</span>}
                                </div>
                                <div className="member-role-txt" style={{ fontSize: '0.72rem' }}>{roleName}</div>
                                <div className="member-desc-txt" style={{ fontSize: '0.68rem' }}>{roleDesc}</div>
                              </div>

                              {!isProjLeader && (
                                <button
                                  type="button"
                                  className="action-btn-secondary"
                                  style={{ padding: '2px 6px', fontSize: '0.68rem' }}
                                  onClick={() => {
                                    setMemberEmail(m.email);
                                    setMemberRole(roleName);
                                    setMemberDesc(roleDesc);
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Main Sections */}
      <div className="dashboard-sections">
        {/* Left Hand Area: My Tasks Checklist */}
        <section className="section-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
              <span>My Tasks checklist ({myTasks.length})</span>
            </h3>
            <button
              onClick={() => navigate('/tasks')}
              className="action-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <span>View Board</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="panel-body" style={{ minHeight: '350px' }}>
            {tasksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                Syncing your checklist...
              </div>
            ) : myTasks.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '250px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>✨</div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600 }}>All caught up!</h4>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>No tasks assigned to you. Enjoy your day!</p>
                </div>
              </div>
            ) : (
              <div className="dashboard-task-list">
                {myTasks.map((task) => {
                  const overdueState = isOverdue(task);
                  return (
                    <div key={task._id} className="dashboard-task-item">
                      <div className="task-item-left">
                        {/* Interactive toggle bubble */}
                        <div className="task-checkbox-wrapper" onClick={() => handleToggleComplete(task)}>
                          {task.status === 'Done' ? (
                            <CheckCircle2 size={18} style={{ color: 'var(--status-done-text)' }} />
                          ) : (
                            <Circle size={18} style={{ color: overdueState ? 'var(--danger-text)' : 'var(--text-light)' }} />
                          )}
                        </div>
                        
                        <span
                          className="task-item-title"
                          style={{
                            textDecoration: task.status === 'Done' ? 'line-through' : 'none',
                            color: task.status === 'Done' ? 'var(--text-muted)' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate('/tasks')}
                        >
                          {task.title}
                        </span>

                        <span className="task-item-project-pill">
                          {task.projectId?.name || 'Project'}
                        </span>
                      </div>

                      <div className="task-item-right">
                        {/* Due Date Indicator */}
                        <div className={`due-date-pill ${overdueState ? 'overdue' : ''}`}>
                          <Clock size={12} />
                          <span>{formatTaskDate(task.dueDate, overdueState)}</span>
                          {overdueState && <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>(OVERDUE)</span>}
                        </div>

                        {/* Priority Badge */}
                        <span className={`badge-pill priority-${task.priority.toLowerCase()}`} style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Hand Area: Recent Activities Feed */}
        <section className="section-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Activity Log</h3>
          </div>

          <div className="panel-body" style={{ minHeight: '350px' }}>
            <div className="activity-feed">
              {recentActivities.map((act) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    <span>⚡</span>
                  </div>
                  <div className="activity-content">
                    <span className="activity-desc">
                      {act.desc} {act.action}
                    </span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
