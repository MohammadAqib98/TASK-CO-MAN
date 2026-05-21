import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, User, ArrowRight, Lock, Mail } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member'); // Default to member
  const [submitting, setSubmitting] = useState(false);

  const { signup, user } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  // Redirect to dashboard if session exists
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Visual client validation
    if (!name || !email || !password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password, role);
    setSubmitting(false);

    if (result.success) {
      showToast(`Welcome to TASK-CO-MAN, ${name}! Your account has been registered.`, 'success');
      navigate('/dashboard', { replace: true });
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow one"></div>
      <div className="auth-bg-glow two"></div>

      <div className="auth-card">
        <div className="auth-header">
          <div 
            className="auth-logo" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
          >
            TASK-CO-MAN⚡
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.25rem', marginTop: '12px' }}>Create Workspace Account</h2>
          <p className="auth-subtitle">Begin managing projects and tasks as a team</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={12} />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={12} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="e.g. test@taskmanager.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={12} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Dynamic Role Selection Cards */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ marginBottom: '8px', display: 'block' }}>Choose Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <div
                onClick={() => setRole('member')}
                style={{
                  border: `1px solid ${role === 'member' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: role === 'member' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <User size={18} style={{ color: role === 'member' ? '#818CF8' : 'var(--text-light)' }} />
                <span style={{ color: '#FFF', fontSize: '0.82rem', fontWeight: 600 }}>Team Member</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Update statuses of assigned tasks
                </span>
              </div>

              <div
                onClick={() => setRole('admin')}
                style={{
                  border: `1px solid ${role === 'admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <ShieldCheck size={18} style={{ color: role === 'admin' ? '#FCA5A5' : 'var(--text-light)' }} />
                <span style={{ color: '#FFF', fontSize: '0.82rem', fontWeight: 600 }}>Team Leader</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Create projects, manage tasks, and lead the team
                </span>
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {submitting ? 'Registering Account...' : 'Get Started'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="auth-switch-prompt">
          Already have an account?{' '}
          <span className="auth-switch-link" onClick={() => navigate('/login')}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
