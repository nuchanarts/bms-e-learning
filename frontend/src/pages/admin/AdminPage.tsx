import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface Analytics {
  totalUsers: number;
  totalCourses: number;
  certificatesIssued: number;
  completedProgressCount: number;
}
interface CourseItem {
  id: string;
  title: string;
  isActive: boolean;
}

const statCards = [
  {
    key: 'totalUsers',
    label: 'ผู้ใช้ทั้งหมด',
    icon: '👥',
    color: '#7B68EE',
    bar: 'linear-gradient(90deg,#7B68EE,#9B8FFF)',
  },
  {
    key: 'totalCourses',
    label: 'คอร์สทั้งหมด',
    icon: '📚',
    color: '#3B82F6',
    bar: 'linear-gradient(90deg,#3B82F6,#93C5FD)',
  },
  {
    key: 'certificatesIssued',
    label: 'ใบประกาศที่ออก',
    icon: '🏆',
    color: '#10B981',
    bar: 'linear-gradient(90deg,#10B981,#34D399)',
  },
  {
    key: 'completedProgressCount',
    label: 'หมวดที่เรียนจบ',
    icon: '✅',
    color: '#F59E0B',
    bar: 'linear-gradient(90deg,#F59E0B,#FCD34D)',
  },
];

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadData = async () => {
    const [a, c] = await Promise.all([
      api.get<Analytics>('/admin/analytics'),
      api.get<CourseItem[]>('/courses'),
    ]);
    setAnalytics(a.data);
    setCourses(c.data);
  };

  useEffect(() => {
    loadData()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/courses', form);
      setForm({ title: '', description: '' });
      setSuccessMsg('เพิ่มคอร์สสำเร็จ!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadData();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบคอร์สนี้?')) return;
    await api.delete(`/admin/courses/${id}`);
    await loadData();
  };

  const handleExportSheets = async () => {
    setExporting(true);
    setExportMsg(null);
    try {
      await api.post('/admin/export/sheets');
      setExportMsg({ ok: true, text: 'Export ไป Google Sheets สำเร็จ!' });
    } catch {
      setExportMsg({ ok: false, text: 'Export ไม่สำเร็จ — ตรวจสอบ GOOGLE_SHEETS_CREDENTIALS' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="anim-up">
      {/* ─── Header ─── */}
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
            ⚙️ Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            จัดการระบบ E-Learning รพ.สต.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <button onClick={handleExportSheets} disabled={exporting} className="btn-secondary">
            {exporting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> กำลัง
                Export...
              </>
            ) : (
              '📊 Export KPI → Google Sheets'
            )}
          </button>
          {exportMsg && (
            <p
              style={{ fontSize: 12, fontWeight: 600, color: exportMsg.ok ? '#16A34A' : '#DC2626' }}
            >
              {exportMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* ─── Analytics ─── */}
      {analytics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {statCards.map(({ key, label, icon, bar }) => (
            <div key={key} className="stat-card">
              <div className="stat-card-bar" style={{ background: bar }} />
              <div className="stat-card-icon">{icon}</div>
              <div className="stat-label">{label}</div>
              <div
                className="stat-value"
                style={{
                  background: bar,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 30,
                }}
              >
                {(analytics as Record<string, number>)[key]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Two columns ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Create course */}
        <div className="card" style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ➕ เพิ่มคอร์สใหม่
          </h3>

          {successMsg && <div className="alert-success">{successMsg}</div>}

          <form
            onSubmit={handleCreate}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div className="form-group">
              <label className="form-label">ชื่อคอร์ส</label>
              <input
                className="form-input"
                placeholder="ชื่อคอร์ส"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">คำอธิบาย</label>
              <textarea
                className="form-input"
                placeholder="คำอธิบายคอร์ส"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                style={{ resize: 'vertical', minHeight: 90 }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{' '}
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึกคอร์ส'
              )}
            </button>
          </form>
        </div>

        {/* Course list */}
        <div className="card" style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            📋 คอร์สทั้งหมด
            <span className="badge badge-purple" style={{ marginLeft: 4 }}>
              {courses.length}
            </span>
          </h3>

          {courses.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-icon" style={{ fontSize: 36 }}>
                📭
              </div>
              <div className="empty-state-title" style={{ fontSize: 14 }}>
                ยังไม่มีคอร์ส
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                maxHeight: 340,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="table-row"
                  style={{ border: '1px solid var(--border)', borderRadius: 12 }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: 'linear-gradient(135deg,#7B68EE,#9B8FFF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      🎬
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {c.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.06)',
                      color: '#DC2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
