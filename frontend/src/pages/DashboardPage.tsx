import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface DashboardData {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLearningSeconds: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | null;
  courses: Array<{
    id: string;
    title: string;
    progressPercent: number;
    isCompleted: boolean;
    totalVideos: number;
    completedVideos: number;
    resumeVideoId?: string | null;
    resumeVideoTitle?: string | null;
    resumeSeconds?: number | null;
  }>;
}

const TIER_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  BRONZE: { label: 'Bronze', icon: '🥉', color: '#CD7F32' },
  SILVER: { label: 'Silver', icon: '🥈', color: '#A8A9AD' },
  GOLD: { label: 'Gold', icon: '🥇', color: '#FFD700' },
  PLATINUM: { label: 'Platinum', icon: '💎', color: '#E5E4E2' },
};

const THUMBS = [
  'linear-gradient(135deg,#7B68EE,#9B8FFF)',
  'linear-gradient(135deg,#EC4899,#F9A8D4)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#3B82F6,#93C5FD)',
  'linear-gradient(135deg,#8B5CF6,#C4B5FD)',
];

const ICONS = ['💊', '🩺', '🏥', '🧬', '💉', '🩻', '🏃', '🍎'];

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    Promise.all([api.get<DashboardData>('/dashboard'), api.get<Announcement[]>('/announcements')])
      .then(([d, a]) => {
        setData(d.data);
        setAnnouncements(a.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const totalHours = data ? Math.floor((data.totalLearningSeconds ?? 0) / 3600) : 0;
  const totalMins = data ? Math.floor(((data.totalLearningSeconds ?? 0) % 3600) / 60) : 0;
  const tier = data?.tier ? TIER_CONFIG[data.tier] : null;

  const stats = [
    {
      label: 'คอร์สที่เรียน',
      sub: 'หลักสูตร',
      value: data?.totalCourses ?? 0,
      iconColor: '#3B82F6',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.85 }}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      bar: 'linear-gradient(90deg,#2563EB,#60A5FA)',
    },
    {
      label: 'เรียนสำเร็จ',
      sub: 'คอร์ส',
      value: data?.completedCourses ?? 0,
      iconColor: '#10B981',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.85 }}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      bar: 'linear-gradient(90deg,#10B981,#34D399)',
    },
    {
      label: 'กำลังเรียน',
      sub: 'คอร์ส',
      value: data?.inProgressCourses ?? 0,
      iconColor: '#F59E0B',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.85 }}
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      bar: 'linear-gradient(90deg,#F59E0B,#FCD34D)',
    },
    {
      label: 'ประกาศนียบัตร',
      sub: 'ใบ',
      value: data?.completedCourses ?? 0,
      iconColor: '#8B5CF6',
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.85 }}
        >
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      ),
      bar: 'linear-gradient(90deg,#8B5CF6,#C4B5FD)',
    },
  ];

  return (
    <div className="anim-up">
      {/* ─── Announcements ─── */}
      {announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {announcements.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                background: a.pinned ? 'rgba(245,158,11,0.08)' : 'var(--card)',
                border: `1px solid ${a.pinned ? 'rgba(245,158,11,0.35)' : 'var(--border)'}`,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                {a.pinned ? '📌' : '📢'}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 3,
                  }}
                >
                  {a.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {a.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Hero Banner ─── */}
      <div className="hero-banner">
        <div className="hero-content">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div>
              <p className="hero-greeting">ยินดีต้อนรับกลับมา 👋</p>
              <h2 className="hero-name">{user?.name}</h2>
              <p className="hero-sub">
                {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'เจ้าหน้าที่สาธารณสุข'} · รพ.สต.บ้านสวน ·
                เชียงใหม่
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>
                    เรียนต่อเนื่อง{' '}
                    {Math.max(1, Math.ceil((data?.totalLearningSeconds ?? 0) / 86400))} วัน
                  </span>
                </div>
                {(data?.totalLearningSeconds ?? 0) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 20,
                      padding: '5px 14px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>🕐</span>
                    <span
                      style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}
                    >
                      {totalHours > 0 ? `${totalHours} ชั่วโมง` : `${totalMins} นาที`} สะสม
                    </span>
                  </div>
                )}
                {tier && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 20,
                      padding: '5px 14px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{tier.icon}</span>
                    <span
                      style={{ fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}
                    >
                      {tier.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Progress ring display */}
            {data && data.totalCourses > 0 && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - data.completedCourses / data.totalCourses)}`}
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '40px 40px',
                        transition: 'stroke-dashoffset 1s ease',
                      }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                      {Math.round((data.completedCourses / data.totalCourses) * 100)}%
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  ความคืบหน้า
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <div>
                <div className="stat-label">{s.label}</div>
                <div
                  className="stat-value"
                  style={{ color: s.iconColor, WebkitTextFillColor: s.iconColor }}
                >
                  {s.value}
                </div>
                <div className="stat-sub">{s.sub}</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${s.iconColor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
            </div>
            <div className="stat-card-bar" style={{ background: s.bar, marginTop: 14 }} />
          </div>
        ))}
      </div>

      {/* ─── My Courses ─── */}
      <div className="section-header">
        <h3 className="section-title">📖 คอร์สที่กำลังเรียน</h3>
        <Link to="/courses" className="section-link">
          ดูทั้งหมด →
        </Link>
      </div>

      {!data || data.courses.length === 0 ? (
        <div className="card" style={{ padding: '40px 24px' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">ยังไม่มีคอร์สในระบบ</div>
            <div className="empty-state-sub">เริ่มเรียนคอร์สแรกของคุณ</div>
            <Link
              to="/courses"
              className="btn-primary"
              style={{ display: 'inline-flex', marginTop: 20 }}
            >
              เริ่มเรียนเลย
            </Link>
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {data.courses.map((course, i) => (
            <div
              key={course.id}
              className="course-card"
              data-testid="course-progress"
              style={{ cursor: 'default', textDecoration: 'none' }}
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="course-thumb" style={{ background: THUMBS[i % THUMBS.length] }}>
                <span className="course-thumb-icon" style={{ fontSize: 44 }}>
                  {ICONS[i % ICONS.length]}
                </span>
              </div>
              <div className="course-body">
                <div className="course-title">{course.title}</div>
                <div className="course-meta">
                  <span className="course-videos">
                    ✅ {course.completedVideos}/{course.totalVideos} บท
                  </span>
                  {course.isCompleted ? (
                    <span className="badge badge-green" data-testid="completed-badge">
                      จบแล้ว
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                      {course.progressPercent}%
                    </span>
                  )}
                </div>
                <div className="course-progress-bar" style={{ marginTop: 10 }}>
                  <div
                    className="course-progress-fill"
                    style={{
                      width: `${course.progressPercent}%`,
                      background: course.isCompleted
                        ? 'linear-gradient(90deg,#10B981,#34D399)'
                        : 'linear-gradient(90deg,#7B68EE,#9B8FFF)',
                    }}
                  />
                </div>
                {!course.isCompleted && course.resumeVideoId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.id}?resume=${course.resumeVideoId}`);
                    }}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'linear-gradient(90deg,#7B68EE,#9B8FFF)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    ▶ เรียนต่อ
                    {course.resumeVideoTitle && (
                      <span
                        style={{
                          fontWeight: 400,
                          opacity: 0.85,
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        — {course.resumeVideoTitle}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
