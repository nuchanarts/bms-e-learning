import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

interface Analytics { totalUsers: number; totalCourses: number; certificatesIssued: number; completedProgressCount: number; }
interface CourseItem { id: string; title: string; isActive: boolean; }

const statCards = [
  { key: 'totalUsers', label: 'ผู้ใช้ทั้งหมด', icon: '👥', color: '#7B68EE' },
  { key: 'totalCourses', label: 'คอร์สทั้งหมด', icon: '📚', color: '#3b82f6' },
  { key: 'certificatesIssued', label: 'ใบประกาศที่ออก', icon: '🏆', color: '#4CAF50' },
  { key: 'completedProgressCount', label: 'หมวดที่เรียนจบ', icon: '✅', color: '#FFA726' },
];

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    const [a, c] = await Promise.all([api.get<Analytics>('/admin/analytics'), api.get<CourseItem[]>('/courses')]);
    setAnalytics(a.data);
    setCourses(c.data);
  };

  useEffect(() => { loadData().catch(console.error).finally(() => setLoading(false)); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/courses', form);
      setForm({ title: '', description: '' });
      setSuccessMsg('เพิ่มคอร์สสำเร็จ!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadData();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบคอร์สนี้?')) return;
    await api.delete(`/admin/courses/${id}`);
    await loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
        <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>⚙️ Admin Panel</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>จัดการระบบ E-Learning</p>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon, color }, i) => (
            <div key={key} className="glass-card p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg,${color},${color}66)` }} />
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
              <p className="text-4xl font-extrabold" style={{ background: `linear-gradient(135deg,#4A3F7A,${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {(analytics as any)[key]}
              </p>
              <span className="absolute bottom-3 right-3 text-4xl opacity-10 select-none">{icon}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Create form */}
        <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>➕</span> เพิ่มคอร์สใหม่
          </h3>
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d32', border: '1px solid rgba(76,175,80,0.3)' }}>
              ✅ {successMsg}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
              placeholder="ชื่อคอร์ส"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#7B68EE'}
              onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
              required
            />
            <textarea
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300 resize-none"
              style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
              placeholder="คำอธิบายคอร์ส"
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              onFocus={e => e.target.style.borderColor = '#7B68EE'}
              onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
              required
            />
            <Button type="submit" isLoading={saving} className="w-full">บันทึกคอร์ส</Button>
          </form>
        </div>

        {/* Course list */}
        <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>📋</span> จัดการคอร์ส ({courses.length})
          </h3>
          {courses.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>ยังไม่มีคอร์สในระบบ</p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center justify-between p-3 rounded-2xl transition-all duration-300 hover:bg-white/50"
                  style={{ border: '1px solid rgba(123,104,238,0.1)' }}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">🎬</span>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="flex-shrink-0 ml-2 px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
