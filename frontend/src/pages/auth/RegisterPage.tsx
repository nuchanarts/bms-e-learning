import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

const fields = [
  { key: 'name' as const, label: 'ชื่อ-นามสกุล', type: 'text', placeholder: 'ชื่อของคุณ', icon: '👤' },
  { key: 'email' as const, label: 'อีเมล', type: 'email', placeholder: 'example@bgs.local', icon: '✉️' },
  { key: 'password' as const, label: 'รหัสผ่าน', type: 'password', placeholder: '••••••••', icon: '🔒' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate('/dashboard');
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ position: 'relative' }}>
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-8 animate-[slideDown_0.6s_ease]">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 12px 40px rgba(123,104,238,0.5)', animation: 'pulse 3s ease-in-out infinite' }}>
            🏥
          </div>
          <h1 className="text-3xl font-extrabold" style={{ background: 'linear-gradient(135deg,#4A3F7A,#7B68EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            สมัครสมาชิก
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>เข้าร่วมแพลตฟอร์มการเรียนรู้</p>
        </div>

        <div className="glass-card p-8 animate-[fadeUp_0.6s_ease]">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
              role="alert">
              <span>⚠️</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {icon} {label}
                </label>
                <input
                  name={key} type={type} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = '#7B68EE'}
                  onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
                  required
                />
              </div>
            ))}
            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">
              สมัครสมาชิก
            </Button>
          </form>
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#7B68EE' }}>เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
