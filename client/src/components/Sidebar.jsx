import React, { useContext } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  // Helper to extract first initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <>
      {/* Mobile Sidebar backdrop overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <span>TASK-CO-MAN</span>
          </Link>
          <span className="badge">v1.0</span>
          {/* Close button inside sidebar on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: 'none',
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#FFF',
              cursor: 'pointer'
            }}
            className="menu-toggle-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section-label">Core Navigation</div>
          
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {getInitials(user.name)}
            </div>
            <div className="user-info">
              <span className="user-name" title={user.name}>{user.name}</span>
              <span className="user-role">{user.role === 'admin' ? 'Team Leader' : 'Team Member'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="logout-button"
            title="Log Out of Session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
