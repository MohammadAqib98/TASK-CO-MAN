import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup default request interceptors to auto-inject token
  useEffect(() => {
    const token = localStorage.getItem('task_co_man_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to restore user session:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('task_co_man_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed, please check credentials.';
      return { success: false, message };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
        role
      });
      const { token, ...userData } = response.data;

      localStorage.setItem('task_co_man_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('task_co_man_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
