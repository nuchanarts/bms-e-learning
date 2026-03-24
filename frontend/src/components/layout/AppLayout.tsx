import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps { children: ReactNode }

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/courses', icon: '🎓', label: 'คอร์สเรียน' },
    { to: '/certificates', icon: '🏆', label: 'ใบประกาศ' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', icon: '⚙️', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="sticky top-0 z-50 px-6 pt-6 pb-3 animate-[slideDown_0.6s_ease]">
          <div className="glass-card max-w-7xl mx-auto px-8 py-5 flex items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 32px rgba(123,104,238,0.5)', animation: 'pulse 3s ease-in-out infinite' }}
              >
                🏥
              </div>
              <div>
                <h1 className="text-xl font-extrabold" style={{ background: 'linear-gradient(135deg, #4A3F7A 0%, #7B68EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  รพ.สต. Learning Hub
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>แพลตฟอร์มสื่อการสอนออนไลน์</p>
              </div>
            </div>

            {/* Nav pills */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                    style={active
                      ? { background: 'var(--gradient-primary)', color: 'white', boxShadow: '0 4px 16px rgba(123,104,238,0.4)' }
                      : { color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User + Logout */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(123,104,238,0.2)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                  {user?.name?.charAt(0) ?? 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่'}</p>
                </div>
              </div>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-6 py-6 animate-[fadeUp_0.6s_ease]">
          {children}
        </main>
      </div>
    </div>
  );
}
