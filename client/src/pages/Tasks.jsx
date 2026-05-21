import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { Plus, Pencil, Trash2, Calendar, User, Eye, X, FilterX, Clock } from 'lucide-react';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const {
    tasks,
    projects,
    users,
    fetchTasks,
    fetchProjects,
    fetchUsers,
    createTask,
    updateTask,
    deleteTask,
    tasksLoading
  } = useContext(AppContext);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'member-status'
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');

  const location = useLocation();

  // Filter States
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  // Load datasets on mount
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    if (user && user.role === 'admin') {
      fetchUsers();
    }

    // Capture dynamic redirect filters from the dashboard
    if (location.state) {
      if (location.state.initialFilterStatus) {
        setFilterStatus(location.state.initialFilterStatus);
      }
      if (location.state.initialFilterOverdue) {
        setFilterOverdue(true);
      }
    }
  }, [fetchTasks, fetchProjects, fetchUsers, user, location.state]);

  if (!user) return null;
  const isAdmin = user.role === 'admin';

  // Reactive Logic: Find members belonging ONLY to the selected project
  const getSelectedProjectMembers = () => {
    if (!projectId) return [];
    const proj = projects.find((p) => p._id === projectId);
    return proj ? proj.members : [];
  };

  // Check if a task is past due date (and not done)
  const isOverdue = (task) => {
    return task.status !== 'Done' && new Date(task.dueDate) < new Date();
  };

  // Convert Mongoose ISO Date strings to YYYY-MM-DD for date inputs
  const formatInputDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  const openCreateModal = () => {
    setModalMode('create');
    setTitle('');
    setDescription('');
    // Auto-select first project if available
    setProjectId(projects.length > 0 ? projects[0]._id : '');
    setAssigneeId('');
    setPriority('Medium');
    setStatus('Todo');
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(formatInputDate(tomorrow));
    
    setCurrentTaskId(null);
    setModalOpen(true);
  };

  const handleCardClick = (task) => {
    setCurrentTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setProjectId(task.projectId?._id || task.projectId || '');
    setAssigneeId(task.assigneeId?._id || task.assigneeId || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(formatInputDate(task.dueDate));

    if (isAdmin) {
      setModalMode('edit');
    } else {
      // Member mode: if the task is assigned to them (or they belong to the project)
      setModalMode('member-status');
    }
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !projectId || !dueDate) return;

    let result;
    if (modalMode === 'create') {
      result = await createTask({
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        priority,
        status,
        dueDate
      });
    } else if (modalMode === 'edit') {
      result = await updateTask(currentTaskId, {
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        priority,
        status,
        dueDate
      });
    } else {
      // Member-status only path
      result = await updateTask(currentTaskId, { status });
    }

    if (result.success) {
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      const result = await deleteTask(currentTaskId);
      if (result.success) {
        setModalOpen(false);
      }
    }
  };

  const clearFilters = () => {
    setFilterProject('');
    setFilterPriority('');
    setFilterAssignee('');
    setFilterStatus('');
    setFilterOverdue(false);
  };

  // Filter Tasks Client-side based on Top Filter Toggles
  const filteredTasks = tasks.filter((t) => {
    const projMatch = !filterProject || t.projectId?._id === filterProject || t.projectId === filterProject;
    const priMatch = !filterPriority || t.priority === filterPriority;
    const assMatch = !filterAssignee || t.assigneeId?._id === filterAssignee || t.assigneeId === filterAssignee;
    const statusMatch = !filterStatus || t.status === filterStatus;
    const overdueMatch = !filterOverdue || isOverdue(t);
    return projMatch && priMatch && assMatch && statusMatch && overdueMatch;
  });

  // Segregate Tasks into 4 Kanban Boards
  const todoTasks = filteredTasks.filter((t) => t.status === 'Todo');
  const progressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const reviewTasks = filteredTasks.filter((t) => t.status === 'Review');
  const doneTasks = filteredTasks.filter((t) => t.status === 'Done');

  // Format initials for tiny avatar circle
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div className="page-title-block">
          <h1 className="page-main-title">Teammate Workflows</h1>
          <p className="page-sub-title">Collaborate, organize, and prioritize tasks on Kanban Boards</p>
        </div>

        {isAdmin && (
          <button className="action-btn" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Multidimensional Filters Bar */}
      <div className="tasks-filter-bar">
        <div className="filter-left" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Project Filter */}
          <div className="filter-group">
            <span className="filter-label">Project:</span>
            <select
              className="filter-select"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <span className="filter-label">Priority:</span>
            <select
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="filter-group">
            <span className="filter-label">Assignee:</span>
            <select
              className="filter-select"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="">All Members</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.role === 'admin' ? 'Team Leader' : 'Team Member'})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Overdue Checkbox Toggle */}
          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: filterOverdue ? 'var(--danger-text)' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)'
            }}>
              <input
                type="checkbox"
                checked={filterOverdue}
                onChange={(e) => setFilterOverdue(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span>⚠️ Overdue Only</span>
            </label>
          </div>
        </div>

        {/* Reset filter button */}
        {(filterProject || filterPriority || filterAssignee || filterStatus || filterOverdue) && (
          <button className="action-btn-secondary" onClick={clearFilters} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <FilterX size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Kanban Board Layout */}
      {tasksLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
          Syncing task board...
        </div>
      ) : (
        <div className="tasks-board">
          
          {/* Column 1: TODO */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title-block">
                <span className="column-bullet todo"></span>
                <span className="column-title">To Do</span>
              </div>
              <span className="column-count">{todoTasks.length}</span>
            </div>
            
            <div className="task-cards-list">
              {todoTasks.map((task) => (
                <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''}`} onClick={() => handleCardClick(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <h4 className="task-card-title">{task.title}</h4>
                    {isOverdue(task) && <span style={{ color: 'var(--danger-text)', padding: '2px', display: 'flex' }} title="Overdue!"><Clock size={14} /></span>}
                  </div>
                  <p className="task-card-desc">{task.description || 'No description provided.'}</p>
                  
                  <div className="task-card-footer">
                    <span className="task-item-project-pill" style={{ fontSize: '0.65rem' }}>
                      {task.projectId?.name || 'Project'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge-pill priority-${task.priority.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                      {task.assigneeId ? (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', fontSize: '0.58rem', margin: 0 }} title={`Assigned to ${task.assigneeId.name}`}>
                          {getInitials(task.assigneeId.name)}
                        </div>
                      ) : (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', background: '#E2E8F0', color: '#64748B', margin: 0 }} title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title-block">
                <span className="column-bullet progress"></span>
                <span className="column-title">In Progress</span>
              </div>
              <span className="column-count">{progressTasks.length}</span>
            </div>

            <div className="task-cards-list">
              {progressTasks.map((task) => (
                <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''}`} onClick={() => handleCardClick(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <h4 className="task-card-title">{task.title}</h4>
                    {isOverdue(task) && <span style={{ color: 'var(--danger-text)', padding: '2px', display: 'flex' }} title="Overdue!"><Clock size={14} /></span>}
                  </div>
                  <p className="task-card-desc">{task.description || 'No description provided.'}</p>

                  <div className="task-card-footer">
                    <span className="task-item-project-pill" style={{ fontSize: '0.65rem' }}>
                      {task.projectId?.name || 'Project'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge-pill priority-${task.priority.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                      {task.assigneeId ? (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', fontSize: '0.58rem', margin: 0 }} title={`Assigned to ${task.assigneeId.name}`}>
                          {getInitials(task.assigneeId.name)}
                        </div>
                      ) : (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', background: '#E2E8F0', color: '#64748B', margin: 0 }} title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: REVIEW */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title-block">
                <span className="column-bullet review"></span>
                <span className="column-title">Review</span>
              </div>
              <span className="column-count">{reviewTasks.length}</span>
            </div>

            <div className="task-cards-list">
              {reviewTasks.map((task) => (
                <div key={task._id} className={`task-card ${isOverdue(task) ? 'overdue' : ''}`} onClick={() => handleCardClick(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <h4 className="task-card-title">{task.title}</h4>
                    {isOverdue(task) && <span style={{ color: 'var(--danger-text)', padding: '2px', display: 'flex' }} title="Overdue!"><Clock size={14} /></span>}
                  </div>
                  <p className="task-card-desc">{task.description || 'No description provided.'}</p>

                  <div className="task-card-footer">
                    <span className="task-item-project-pill" style={{ fontSize: '0.65rem' }}>
                      {task.projectId?.name || 'Project'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge-pill priority-${task.priority.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                      {task.assigneeId ? (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', fontSize: '0.58rem', margin: 0 }} title={`Assigned to ${task.assigneeId.name}`}>
                          {getInitials(task.assigneeId.name)}
                        </div>
                      ) : (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', background: '#E2E8F0', color: '#64748B', margin: 0 }} title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: DONE */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title-block">
                <span className="column-bullet done"></span>
                <span className="column-title">Done</span>
              </div>
              <span className="column-count">{doneTasks.length}</span>
            </div>

            <div className="task-cards-list">
              {doneTasks.map((task) => (
                <div key={task._id} className="task-card" onClick={() => handleCardClick(task)}>
                  <h4 className="task-card-title" style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{task.title}</h4>
                  <p className="task-card-desc">{task.description || 'No description provided.'}</p>

                  <div className="task-card-footer">
                    <span className="task-item-project-pill" style={{ fontSize: '0.65rem', backgroundColor: '#E2E8F0', color: '#64748B' }}>
                      {task.projectId?.name || 'Project'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-pill status-todo" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                      {task.assigneeId ? (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', fontSize: '0.58rem', margin: 0, opacity: 0.6 }} title={`Assigned to ${task.assigneeId.name}`}>
                          {getInitials(task.assigneeId.name)}
                        </div>
                      ) : (
                        <div className="member-avatar-mini" style={{ width: '22px', height: '22px', background: '#E2E8F0', color: '#64748B', margin: 0 }} title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Action Dialog Drawer Modal (Admin and Member specific) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' && 'Assign New Task'}
                {modalMode === 'edit' && 'Edit Task Parameters'}
                {modalMode === 'member-status' && 'Update Task Status'}
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
                {modalMode === 'member-status' ? (
                  /* Teammate Path: View details, can ONLY edit Status dropdown */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
                        {description || 'No description details provided.'}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <div>
                        <strong>Project:</strong> <span style={{ color: 'var(--text-main)' }}>{projects.find((p) => p._id === projectId)?.name || 'Project'}</span>
                      </div>
                      <div>
                        <strong>Due Date:</strong> <span style={{ color: 'var(--text-main)' }}>{dueDate}</span>
                      </div>
                      <div>
                        <strong>Priority:</strong> <span style={{ color: 'var(--text-main)' }}>{priority}</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '8px' }}>
                      <label className="form-label">Update Status</label>
                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Admin Path: Complete controls */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Task Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Set up auth middleware"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Detail the task checklist and execution guidelines..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Associated Project *</label>
                        <select
                          className="form-select"
                          value={projectId}
                          onChange={(e) => {
                            setProjectId(e.target.value);
                            setAssigneeId(''); // Reset assignee since team roster alters
                          }}
                          required
                        >
                          <option value="" disabled>-- Select Project --</option>
                          {projects.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Assignee</label>
                        <select
                          className="form-select"
                          value={assigneeId}
                          onChange={(e) => setAssigneeId(e.target.value)}
                          disabled={!projectId}
                        >
                          <option value="">-- Unassigned --</option>
                          {getSelectedProjectMembers().map((item) => (
                            <option key={item._id} value={item._id}>{item.name} ({item.role === 'admin' ? 'Team Leader' : 'Team Member'})</option>
                          ))}
                        </select>
                        {!projectId && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>Please select a project first</span>}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Due Date *</label>
                        <input
                          type="date"
                          className="form-input"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ justifyContent: modalMode === 'edit' ? 'space-between' : 'flex-end' }}>
                {modalMode === 'edit' && (
                  <button
                    type="button"
                    className="action-btn-secondary"
                    style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} />
                    <span>Delete Task</span>
                  </button>
                )}
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="action-btn">
                    {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
