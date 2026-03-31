import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LANGUAGES } from '../../contexts/LanguageContext';

const REMEMBER_KEY = 'bgs_remember_email';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError(t.login_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ─── Left brand panel ─── */}
      <div className="auth-left">
        <div className="auth-left-glow1" />
        <div className="auth-left-glow2" />
        <div className="auth-left-content">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">🏥</div>
            <div>
              <div className="auth-logo-name">รพ.สต. Learning Hub</div>
              <div className="auth-logo-sub">{t.nav_platform_sub}</div>
            </div>
          </div>

          <h1 className="auth-tagline">
            {t.login_tagline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < 2 && <br />}
              </span>
            ))}
          </h1>
          <p className="auth-tagline-sub">
            {t.login_tagline_sub.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>

          <div className="auth-feature">
            <span className="auth-feature-icon">🎓</span>
            <span className="auth-feature-text">{t.login_feat1}</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🏆</span>
            <span className="auth-feature-text">{t.login_feat2}</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">📊</span>
            <span className="auth-feature-text">{t.login_feat3}</span>
          </div>
        </div>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="auth-right">
        <div className="auth-form-box anim-up">
          {/* Language selector on auth page */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 16,
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                title={l.label}
                style={{
                  padding: '3px 8px',
                  borderRadius: 14,
                  border: `1px solid ${l.code === lang ? 'var(--primary)' : 'var(--border)'}`,
                  background: l.code === lang ? 'var(--primary)' : 'transparent',
                  color: l.code === lang ? '#fff' : 'var(--text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <h2 className="auth-form-title">{t.login_welcome}</h2>
          <p className="auth-form-sub">{t.login_subtitle}</p>

          {error && (
            <div className="alert-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t.login_email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="example@bgs.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {t.login_password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--text-muted)',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              {t.login_remember}
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  {t.login_loading}
                </>
              ) : (
                t.login_submit
              )}
            </button>
          </form>

          <p
            style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}
          >
            {t.login_no_account}{' '}
            <Link to="/register" className="auth-link">
              {t.login_register_link}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
