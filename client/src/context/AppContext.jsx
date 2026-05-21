import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [projectsLoading, setProjectsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // --- TOAST SYSTEMS ---
  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- PROJECTS API CRUD ---
  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Fetch Projects Error:', error);
      showToast(error.response?.data?.message || 'Failed to load projects.', 'error');
    } finally {
      setProjectsLoading(false);
    }
  }, [showToast]);

  const createProject = async (name, description, members, teamRoles) => {
    try {
      const response = await axios.post(`${API_URL}/projects`, { name, description, members, teamRoles });
      setProjects((prev) => [response.data, ...prev]);
      showToast('Project created successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const updateProject = async (id, name, description, members, teamRoles) => {
    try {
      const response = await axios.put(`${API_URL}/projects/${id}`, { name, description, members, teamRoles });
      setProjects((prev) => prev.map((p) => (p._id === id ? response.data : p)));
      showToast('Project updated successfully!', 'success');
      // Refresh tasks in case the assignee or memberships altered
      fetchTasks();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`${API_URL}/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      // Remove all local tasks associated with this project as well
      setTasks((prev) => prev.filter((t) => t.projectId?._id !== id && t.projectId !== id));
      showToast('Project and tasks deleted successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete project.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const addTeamMember = async (projectId, email, projectRole, roleDescription) => {
    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/team`, {
        email,
        projectRole,
        roleDescription
      });
      setProjects((prev) => prev.map((p) => (p._id === projectId ? response.data : p)));
      showToast('Team member successfully assigned/updated!', 'success');
      fetchTasks();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to manage team member.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // --- TASKS API CRUD ---
  const fetchTasks = useCallback(async (filters = {}) => {
    setTasksLoading(true);
    try {
      const params = {};
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assigneeId) params.assigneeId = filters.assigneeId;

      const response = await axios.get(`${API_URL}/tasks`, { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch Tasks Error:', error);
      showToast(error.response?.data?.message || 'Failed to load tasks.', 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [showToast]);

  const createTask = async (taskData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, taskData);
      setTasks((prev) => [response.data, ...prev]);
      showToast('Task assigned successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? response.data : t)));
      showToast('Task updated successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully!', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // --- USERS API FETCH (Admin Only) ---
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch Users Error (Commonly logged by members due to admin blocks):', error);
      // Suppress showing error toast for members as it is completely normal they cannot fetch all users
    } finally {
      setUsersLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        users,
        toasts,
        projectsLoading,
        tasksLoading,
        usersLoading,
        showToast,
        removeToast,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        addTeamMember,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        fetchUsers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
