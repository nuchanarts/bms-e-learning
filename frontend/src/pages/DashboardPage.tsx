import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface DashboardData {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  courses: Array<{
    id: string;
    title: string;
    progressPercent: number;
    isCompleted: boolean;
    totalVideos: number;
    completedVideos: number;
  }>;
}

const statCards = [
  { key: 'totalCourses', label: 'คอร์สทั้งหมด', icon: '📚', color: '#7B68EE' },
  { key: 'completedCourses', label: 'เรียนจบแล้ว', icon: '✅', color: '#4CAF50' },
  { key: 'inProgressCourses', label: 'กำลังเรียน', icon: '▶️', color: '#FFA726' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="glass-card p-8 animate-[fadeUp_0.5s_ease]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>ยินดีต้อนรับ 👋</p>
            <h2 className="text-3xl font-extrabold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.name}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่ รพ.สต.'} — มาเรียนรู้ต่อกันเลย!
            </p>
          </div>
          <Link to="/courses">
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 24px rgba(123,104,238,0.5)' }}>
              <span>🎓</span> ดูคอร์สทั้งหมด
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map(({ key, label, icon, color }, i) => (
          <div key={key}
            className="glass-card p-8 relative overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] cursor-default"
            style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
            <p className="text-5xl font-extrabold" style={{ background: `linear-gradient(135deg, #4A3F7A, ${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {data ? (data as any)[key] : 0}
            </p>
            <span className="absolute bottom-4 right-4 text-5xl opacity-10 select-none">{icon}</span>
          </div>
        ))}
      </div>

      {/* Course progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>ความคืบหน้าการเรียน</h3>
          <Link to="/courses" className="text-sm font-semibold hover:underline" style={{ color: '#7B68EE' }}>ดูทั้งหมด →</Link>
        </div>

        {!data || data.courses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-5xl mb-4">📚</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>ยังไม่มีคอร์สในระบบ</p>
            <Link to="/courses" className="text-sm" style={{ color: '#7B68EE' }}>เริ่มเรียนคอร์สแรกของคุณ →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <div className="glass-card p-6 transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(123,104,238,0.2)] cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-base leading-snug flex-1 pr-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h4>
                    {course.isCompleted && (
                      <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.3)' }}>
                        ✅ จบแล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
                    {course.completedVideos}/{course.totalVideos} วิดีโอ
                  </p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(123,104,238,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${course.progressPercent}%`, background: course.isCompleted ? 'var(--gradient-success)' : 'var(--gradient-primary)' }} />
                  </div>
                  <p className="text-xs mt-2 text-right font-semibold" style={{ color: 'var(--text-tertiary)' }}>{course.progressPercent}%</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
