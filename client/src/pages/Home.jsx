import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Cpu, 
  Chrome, 
  Sparkles, 
  Users, 
  Clock 
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{
      backgroundColor: '#090D16',
      color: '#FFFFFF',
      minHeight: '100vh',
      fontFamily: 'var(--font-main)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background Glow Blobs */}
      <div className="auth-bg-glow one" style={{ top: '-10%', left: '-10%', width: '600px', height: '600px', opacity: 0.15 }}></div>
      <div className="auth-bg-glow two" style={{ bottom: '10%', right: '-10%', width: '500px', height: '500px', opacity: 0.1 }}></div>

      {/* Header Navigation */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 8%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
        >
          TASK-CO-MAN⚡
        </div>
        <nav style={{ display: 'flex', gap: '32px', fontSize: '0.9rem', fontWeight: 500 }} className="hide-on-mobile">
          <a href="#features" style={{ color: 'var(--text-light)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#FFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}>Features</a>
          <a href="#about" style={{ color: 'var(--text-light)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#FFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}>Technology</a>
          <a href="#demo" style={{ color: 'var(--text-light)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#FFF'} onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}>Quick Start</a>
        </nav>
        <div>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="action-btn"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '8px 16px'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="action-btn"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 8% 80px 8%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          border: '1px solid rgba(79, 70, 229, 0.3)',
          borderRadius: '99px',
          padding: '6px 16px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#818CF8',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          boxShadow: '0 0 15px rgba(79, 70, 229, 0.1)'
        }}>
          <Sparkles size={13} />
          <span>Next-Generation Project Workflow</span>
        </div>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 850,
          letterSpacing: '-1.5px',
          lineHeight: '1.1',
          maxWidth: '850px',
          marginBottom: '20px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Synchronize Team Goals.<br />Accelerate Milestone Delivery.
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-light)',
          maxWidth: '650px',
          lineHeight: '1.6',
          marginBottom: '40px',
          fontWeight: 400
        }}>
          TASK-CO-MAN is a premium, high-speed Team Task Manager featuring interactive Kanban boards, role-based workflows, dynamic health scoring, and glowing overdue trackers.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="action-btn"
              style={{ padding: '12px 28px', fontSize: '0.95rem', boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/signup')}
                className="action-btn"
                style={{ padding: '12px 28px', fontSize: '0.95rem', boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)' }}
              >
                <span>Get Started for Free</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="action-btn-secondary"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.95rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Explore Live Demo
              </button>
            </>
          )}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" style={{
        padding: '100px 8%',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.8px', color: '#FFF' }}>
            Built for Velocity and Scope Control
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '10px' }}>
            Experience enterprise-grade task workflows with bespoke premium widgets.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px'
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease'
          }}
          className="hover-card-landing"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)', color: '#818CF8', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Role-Based Authority (RBAC)</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Distinct Administrator and Member permissions secure your data. Admins possess full workspace CRUD, while teammates track assigned scopes.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease'
          }}
          className="hover-card-landing"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Kanban Workflow Boards</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Organize team tasks across four visual lifecycle columns: Todo, In Progress, Review, and Done. Features detailed parameter drawers and filters.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease'
          }}
          className="hover-card-landing"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Workspace Health Metrics</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Automatic completion score banners and interactive linear progress meters track milestones per project, keeping team velocity visible.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s ease'
          }}
          className="hover-card-landing"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ color: '#FFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Intelligent Overdue Triggers</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Active tasks past their target deadlines are automatically highlighted in red with warning alerts on dashboard checklist lists and workflow boards.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack & About Section */}
      <section id="about" style={{
        padding: '100px 8%',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Our Technical Core
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.8px', color: '#FFF', marginBottom: '20px' }}>
              Crafted with a Modern Full-Stack Architecture
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '32px' }}>
              TASK-CO-MAN utilizes the industry-standard MERN architecture, utilizing raw React and custom Vanilla CSS styling to provide recruiters with an optimized, clean portfolio showcase without heavy precompiled template bloat.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <Chrome size={18} style={{ color: '#818CF8', marginTop: '3px' }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem' }}>React & Vite</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '4px' }}>Hyper-speed, lightweight client bundling.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <Cpu size={18} style={{ color: '#818CF8', marginTop: '3px' }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem' }}>Express Router</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '4px' }}>Secure, high-velocity API endpoint guards.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <Database size={18} style={{ color: '#818CF8', marginTop: '3px' }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem' }}>MongoDB Database</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '4px' }}>Flexible document scaling with indexing.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <CheckCircle2 size={18} style={{ color: '#818CF8', marginTop: '3px' }} />
                <div>
                  <h4 style={{ color: '#FFF', fontWeight: 600, fontSize: '0.95rem' }}>JWT Cryptography</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '4px' }}>Secure state encryption & session preservation.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual Showcase Block */}
          <div style={{
            flex: '1 1 350px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(129, 140, 248, 0.02) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
            <h3 style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Clean Design Philosophy</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto 24px auto' }}>
              We chose customized Vanilla CSS styling to demonstrate robust foundational knowledge, delivering absolute aesthetic control.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '99px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              color: '#FFF'
            }}>
              <span>100% Bespoke Stylesheets</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Showcase Section */}
      <section id="demo" style={{
        padding: '100px 8% 120px 8%',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Instant Evaluation
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.8px', color: '#FFF', marginBottom: '20px' }}>
            Test with Pre-Configured Demo Teammates
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '40px' }}>
            We pre-filled your local server with fully functional datasets! Use the one-tap glowing logins on our authentication page to evaluate features instantaneously.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="action-btn"
            style={{ padding: '14px 36px', fontSize: '1rem', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 25px rgba(79, 70, 229, 0.5)' }}
          >
            <span>Launch Live Demo App</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '40px 8%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        backgroundColor: '#05070A',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          © {new Date().getFullYear()} TASK-CO-MAN⚡. Crafted for recruiter and live showcase evaluation.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>MERN Stack Portfolio Showcase</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
