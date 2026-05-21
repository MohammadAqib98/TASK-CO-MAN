import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, Calendar, ShieldCheck, User } from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  // Generate dynamic breadcrumbs based on active URL
  const getBreadcrumbs = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Overview / Dashboard';
      case '/projects':
        return 'Workspace / Projects';
      case '/tasks':
        return 'Workflow / Tasks Board';
      default:
        return 'TASK-CO-MAN / Workspace';
    }
  };

  // Format today's date elegantly
  const formatToday = () => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="header-bar">
      <div className="header-title-section">
        {/* Mobile menu trigger */}
        <button
          className="menu-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        
        <div className="breadcrumbs">
          {getBreadcrumbs()}
        </div>
      </div>

      <div className="header-actions">
        {/* Current Date Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: '500',
            backgroundColor: 'var(--primary-light)',
            padding: '6px 12px',
            borderRadius: '6px',
          }}
          className="hide-on-mobile"
        >
          <Calendar size={14} className="text-primary" style={{ color: 'var(--primary)' }} />
          <span>{formatToday()}</span>
        </div>

        {/* Role Indicator Badge */}
        <div
          className={`badge-pill ${user.role === 'admin' ? 'priority-high' : 'status-in-progress'}`}
          style={{
            fontWeight: '700',
            letterSpacing: '0.5px',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px'
          }}
        >
          {user.role === 'admin' ? (
            <ShieldCheck size={14} />
          ) : (
            <User size={14} />
          )}
          <span>{user.role === 'admin' ? 'Team Leader' : 'Team Member'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
