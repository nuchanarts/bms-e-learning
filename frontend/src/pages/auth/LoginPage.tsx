import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ position: 'relative' }}>
      {/* Orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div className="text-center mb-8 animate-[slideDown_0.6s_ease]">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 12px 40px rgba(123,104,238,0.5)', animation: 'pulse 3s ease-in-out infinite' }}>
            🏥
          </div>
          <h1 className="text-3xl font-extrabold" style={{ background: 'linear-gradient(135deg,#4A3F7A,#7B68EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            รพ.สต. Learning Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>แพลตฟอร์มสื่อการสอนออนไลน์</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 animate-[fadeUp_0.6s_ease]">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>เข้าสู่ระบบ</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
              role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>อีเมล</label>
              <input
                name="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@bgs.local"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = '#7B68EE'}
                onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>รหัสผ่าน</label>
              <input
                name="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = '#7B68EE'}
                onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">
              เข้าสู่ระบบ
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#7B68EE' }}>สมัครสมาชิก</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
