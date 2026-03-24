import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseService, type Course } from '../../services/courseService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseService.list()
      .then(setCourses)
      .catch(() => setError('ไม่สามารถโหลดคอร์สได้'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>🎓 คอร์สเรียนทั้งหมด</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>เลือกคอร์สที่ต้องการเรียนรู้</p>
          </div>
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาคอร์ส..."
              className="w-full px-5 py-3 pr-12 rounded-2xl text-sm outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid rgba(123,104,238,0.2)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = '#7B68EE'}
              onBlur={e => e.target.style.borderColor = 'rgba(123,104,238,0.2)'}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔍</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="glass-card px-5 py-3 flex items-center gap-2">
          <span className="text-xl">📚</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{courses.length} คอร์ส</span>
        </div>
        {search && (
          <div className="glass-card px-5 py-3 flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>พบ {filtered.length} รายการ</span>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">❌</p>
          <p className="font-semibold" style={{ color: '#dc2626' }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'ไม่พบคอร์สที่ค้นหา' : 'ยังไม่มีคอร์สในระบบ'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((course, i) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <div
                className="glass-card p-6 h-full flex flex-col transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-[rgba(123,104,238,0.4)] cursor-pointer"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Icon placeholder */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: 'linear-gradient(135deg, rgba(123,104,238,0.15), rgba(123,104,238,0.05))', border: '2px solid rgba(123,104,238,0.2)' }}>
                  🎬
                </div>
                <h3 className="text-base font-bold mb-2 flex-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(123,104,238,0.1)', color: '#7B68EE' }}>
                    {course.videos?.length ?? 0} วิดีโอ
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>เริ่มเรียน →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
