import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'หน้าหลัก' },
  { to: '/courses', icon: '🎓', label: 'คอร์สเรียน' },
  { to: '/certificates', icon: '🏆', label: 'ใบประกาศ' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNav = [
    ...navItems,
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', icon: '⚙️', label: 'Admin Panel' }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── TOP NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Mobile hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            ☰
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="navbar-logo">
            <div className="navbar-logo-icon">🏥</div>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">รพ.สต. Learning Hub</span>
              <span className="navbar-logo-sub">แพลตฟอร์มสื่อการสอนออนไลน์</span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav className="navbar-links">
            {allNav.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`navbar-link ${active ? 'active' : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User area */}
          <div className="navbar-user">
            <div className="navbar-avatar" title={user?.name}>
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="navbar-user-name">{user?.name}</span>
            <button data-testid="logout-button" className="navbar-logout" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />
        <div className="mobile-drawer-panel">
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 6px 20px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 8,
            }}
          >
            <div
              className="navbar-logo-icon"
              style={{ width: 36, height: 36, borderRadius: 10, fontSize: 16 }}
            >
              🏥
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                รพ.สต. Learning Hub
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                แพลตฟอร์มสื่อการสอนออนไลน์
              </div>
            </div>
          </div>

          {allNav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-nav-link ${active ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* User info */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--bg)',
                marginBottom: 8,
              }}
            >
              <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่ รพ.สต.'}
                </div>
              </div>
            </div>
            <button
              data-testid="logout-button-mobile"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: '1px solid rgba(239,68,68,0.2)',
                background: 'rgba(239,68,68,0.06)',
                color: '#DC2626',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <main className="page-wrapper anim-in">{children}</main>
    </div>
  );
}
