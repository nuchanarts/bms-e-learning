import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, type Course } from '../../services/courseService';
import { certificateService } from '../../services/certificateService';
import { bundleService, type Bundle } from '../../services/bundleService';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import StatsBar from '../../components/ui/StatsBar';

const THUMBS = [
  { bg: 'linear-gradient(135deg,#7B68EE,#9B8FFF)', icon: '💊' },
  { bg: 'linear-gradient(135deg,#EC4899,#F9A8D4)', icon: '🩺' },
  { bg: 'linear-gradient(135deg,#10B981,#34D399)', icon: '🏥' },
  { bg: 'linear-gradient(135deg,#F59E0B,#FCD34D)', icon: '🧬' },
  { bg: 'linear-gradient(135deg,#3B82F6,#93C5FD)', icon: '💉' },
  { bg: 'linear-gradient(135deg,#8B5CF6,#C4B5FD)', icon: '🩻' },
  { bg: 'linear-gradient(135deg,#EF4444,#FCA5A5)', icon: '🏃' },
  { bg: 'linear-gradient(135deg,#14B8A6,#5EEAD4)', icon: '🍎' },
];

interface Stats {
  totalCourses: number;
  totalLearners: number;
  totalCertificates: number;
  totalHospitals: number;
}

function CourseThumb({ course, i }: { course: Course; i: number }) {
  const thumb = THUMBS[i % THUMBS.length];
  const [imgFailed, setImgFailed] = useState(false);
  if (course.thumbnailUrl && !imgFailed) {
    return (
      <div
        className="course-thumb"
        style={{ background: '#f3f4f6', padding: 0, overflow: 'hidden' }}
      >
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }
  return (
    <div className="course-thumb" style={{ background: thumb.bg }}>
      <span className="course-thumb-icon">{thumb.icon}</span>
    </div>
  );
}

export default function CourseListPage() {
  const { add, remove, has } = useCart();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');
  const [adminCategories, setAdminCategories] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      courseService.list(),
      certificateService.list(),
      api.get<{ categories: string }>('/settings/public'),
      bundleService.list(),
      api.get<Stats>('/stats'),
    ])
      .then(([c, certs, settingsRes, b, statsRes]) => {
        setCourses(c);
        setCompletedCourseIds(new Set(certs.map((cert) => cert.courseId)));
        const cats = settingsRes.data.categories
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
        setAdminCategories(cats);
        setBundles(b);
        setStats(statsRes.data);
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => {
        setLoading(false);
        setStatsLoading(false);
      });
  }, []);

  const featured = courses.filter((c) => (c as any).isFeatured);
  const courseCats = Array.from(new Set(courses.map((c) => c.category ?? 'ทั่วไป')));
  const mergedCats =
    adminCategories.length > 0
      ? ['ทั้งหมด', ...adminCategories, ...courseCats.filter((c) => !adminCategories.includes(c))]
      : ['ทั้งหมด', ...courseCats];

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'ทั้งหมด' || (c.category ?? 'ทั่วไป') === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading)
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );

  return (
    <div className="anim-up">
      {/* Stats Bar */}
      {stats ? (
        <StatsBar {...stats} loading={statsLoading} />
      ) : (
        <StatsBar
          totalCourses={0}
          totalLearners={0}
          totalCertificates={0}
          totalHospitals={0}
          loading
        />
      )}

      {/* Bundles section */}
      {bundles.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🎁 แพ็กเกจคอร์สเรียน
          </h2>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {bundles.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{
                  minWidth: 280,
                  padding: 18,
                  flexShrink: 0,
                  border: '2px solid rgba(245,158,11,0.3)',
                  background: 'linear-gradient(135deg,rgba(255,243,205,0.4),rgba(255,249,231,0.7))',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>
                  {b.name}
                </div>
                {b.description && (
                  <div style={{ fontSize: 11, color: '#78350F', marginBottom: 8, lineHeight: 1.4 }}>
                    {b.description}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {b.courses.map((bc) => (
                    <span
                      key={bc.courseId}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: 'rgba(245,158,11,0.2)',
                        color: '#92400E',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {bc.course.title}
                    </span>
                  ))}
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#D97706' }}>
                    ฿{b.price.toLocaleString()}
                  </div>
                  <button
                    onClick={() => navigate(`/bundles/${b.id}`)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: 'none',
                      background: '#F59E0B',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    ดูแพ็กเกจ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured section */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ⭐ คอร์สแนะนำ
          </h2>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {featured.map((course, i) => {
              return (
                <div
                  key={course.id}
                  className="course-card"
                  style={{
                    minWidth: 260,
                    maxWidth: 280,
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    border: '2px solid rgba(245,158,11,0.4)',
                  }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 2,
                      background: '#F59E0B',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    ⭐ แนะนำ
                  </div>
                  <CourseThumb course={course} i={i} />
                  <div className="course-body">
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                      }}
                    >
                      {course.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {course.category ?? 'ทั่วไป'}
                    </div>
                    {(course as any).avgRating && (
                      <div
                        style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, marginTop: 4 }}
                      >
                        {'★'.repeat(Math.round((course as any).avgRating))}
                        {'☆'.repeat(5 - Math.round((course as any).avgRating))}{' '}
                        {(course as any).avgRating} ({(course as any).ratingCount})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            🎓 คอร์สเรียนทั้งหมด
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            มีทั้งหมด {courses.length} คอร์ส
          </p>
        </div>
        <div className="search-input-wrapper" style={{ flex: '1 1 260px', maxWidth: 360 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาคอร์ส..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      {mergedCats.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {mergedCats.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                background: activeCategory === cat ? 'var(--primary)' : 'var(--bg)',
                color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {search && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          พบ <strong>{filtered.length}</strong> คอร์สจากการค้นหา "{search}"
        </p>
      )}

      {error ? (
        <div className="card" style={{ padding: 40 }}>
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title" style={{ color: '#DC2626' }}>
              {error}
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40 }}>
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">
              {search ? 'ไม่พบคอร์สที่ค้นหา' : 'ยังไม่มีคอร์สในระบบ'}
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="btn-secondary"
                style={{ marginTop: 16 }}
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {filtered.map((course, i) => {
            const inCart = has(course.id);
            const c = course as any;
            return (
              <div
                key={course.id}
                className="course-card"
                data-testid="course-card"
                data-completed={completedCourseIds.has(course.id) ? 'true' : 'false'}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <CourseThumb course={course} i={i} />
                <div className="course-body">
                  <div
                    className="course-badge"
                    style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}
                  >
                    <span className="badge badge-purple">{course.category ?? 'ทั่วไป'}</span>
                    {c.isNew && (
                      <span className="badge" style={{ background: '#D1FAE5', color: '#065F46' }}>
                        ✨ ใหม่
                      </span>
                    )}
                    {c.isFeatured && (
                      <span className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
                        ⭐ แนะนำ
                      </span>
                    )}
                    {course.price ? (
                      <span className="badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
                        💳 ฿{course.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="badge badge-green">ฟรี</span>
                    )}
                  </div>
                  <div className="course-title">{course.title}</div>
                  <div className="course-desc">{course.description}</div>
                  {/* Rating + Enroll count */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      marginBottom: 8,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {c.avgRating && (
                      <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                        ★ {c.avgRating} ({c.ratingCount})
                      </span>
                    )}
                    {c.enrollCount > 0 && <span>👤 {c.enrollCount.toLocaleString()} คน</span>}
                  </div>
                  <div className="course-meta">
                    <span className="course-videos">🎬 {course.videos?.length ?? 0} วิดีโอ</span>
                    {course.price ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          inCart
                            ? remove(course.id)
                            : add({
                                id: course.id,
                                title: course.title,
                                price: course.price!,
                                category: course.category,
                              });
                        }}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 20,
                          border: `1.5px solid ${inCart ? 'rgba(239,68,68,0.3)' : 'var(--border-strong)'}`,
                          background: inCart ? 'rgba(239,68,68,0.07)' : 'var(--primary-light)',
                          color: inCart ? '#DC2626' : 'var(--primary)',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {inCart ? '✕ ลบออก' : '🛒 ใส่ตะกร้า'}
                      </button>
                    ) : (
                      <span className="course-arrow">เริ่มเรียน →</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
