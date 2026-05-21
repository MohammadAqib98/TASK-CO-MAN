import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Determine redirection target (default: /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      showToast('Welcome back to TASK-CO-MAN!', 'success');
      navigate(from, { replace: true });
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-page">
      {/* Visual background atmospheric glowing blobs */}
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
          <h2 style={{ color: '#FFF', fontSize: '1.25rem', marginTop: '12px' }}>Sign in to Workspace</h2>
          <p className="auth-subtitle">Enter credentials to synchronize team goals</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={12} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder="e.g. admin@taskmanager.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={12} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="auth-switch-prompt">
          Don't have an account?{' '}
          <span className="auth-switch-link" onClick={() => navigate('/signup')}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
