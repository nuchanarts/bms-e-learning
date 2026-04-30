import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface TrainingRecord {
  id: string;
  recordDate: string;
  courseId: string | null;
  course: { id: string; title: string } | null;
  triageRed: number;
  triageYellow: number;
  triageGreen: number;
  vitalSigns: number;
  cc: number;
  hpi: number;
  procedures: number;
  labOrders: number;
  xrayOrders: number;
  medications: number;
  billing: number;
  otherExpenses: number;
  notes: string | null;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
}

const FIELDS = [
  { key: 'triageRed', label: 'กรองแดง (Triage Red)', color: '#DC2626' },
  { key: 'triageYellow', label: 'กรองเหลือง (Triage Yellow)', color: '#D97706' },
  { key: 'triageGreen', label: 'กรองเขียว (Triage Green)', color: '#16A34A' },
  { key: 'vitalSigns', label: 'บันทึก Vital Signs', color: '#2563EB' },
  { key: 'cc', label: 'บันทึก CC (Chief Complaint)', color: '#2563EB' },
  { key: 'hpi', label: 'บันทึก HPI (ประวัติปัจจุบัน)', color: '#2563EB' },
  { key: 'procedures', label: 'หัตการ (Procedures)', color: '#7C3AED' },
  { key: 'labOrders', label: 'ส่ง LAB', color: '#0891B2' },
  { key: 'xrayOrders', label: 'ส่ง X-Ray', color: '#0891B2' },
  { key: 'medications', label: 'สั่งยา', color: '#059669' },
  { key: 'billing', label: 'รายการบิล (คิดสิ้น)', color: '#374151' },
  { key: 'otherExpenses', label: 'ค่าใช้จ่ายอื่นๆ', color: '#374151' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

const emptyForm = (): Record<FieldKey, number> & {
  courseId: string;
  recordDate: string;
  notes: string;
} => ({
  courseId: '',
  recordDate: new Date().toISOString().split('T')[0],
  triageRed: 0,
  triageYellow: 0,
  triageGreen: 0,
  vitalSigns: 0,
  cc: 0,
  hpi: 0,
  procedures: 0,
  labOrders: 0,
  xrayOrders: 0,
  medications: 0,
  billing: 0,
  otherExpenses: 0,
  notes: '',
});

export default function TrainingRecordPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<TrainingRecord[]>('/training-records/my'),
      api.get<Course[]>('/courses?limit=200'),
    ])
      .then(([recs, crs]) => {
        setRecords(recs.data);
        const courseList = Array.isArray(crs.data) ? crs.data : ((crs.data as any).data ?? []);
        setCourses(courseList);
      })
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        recordDate: form.recordDate,
        notes: form.notes || undefined,
        courseId: form.courseId || undefined,
      };
      FIELDS.forEach(({ key }) => {
        payload[key] = Number(form[key]);
      });
      const { data } = await api.post<TrainingRecord>('/training-records', payload);
      setRecords((prev) => [data, ...prev]);
      setSuccess('บันทึกผลสำเร็จแล้ว');
      setShowForm(false);
      setForm(emptyForm());
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบบันทึกนี้?')) return;
    await api.delete(`/training-records/${id}`);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            บันทึกผลการปฏิบัติหลังอบรม
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            บันทึกจำนวน Case ที่ปฏิบัติจริงหลังเข้ารับการอบรม
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setError('');
            setSuccess('');
          }}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + บันทึกผลใหม่
        </button>
      </div>

      {success && (
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#15803D',
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>บันทึกผลการปฏิบัติ</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              ชื่อผู้บันทึก: <strong style={{ color: 'var(--primary)' }}>{user?.name}</strong>
            </p>

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#DC2626',
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {/* Course */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  คอร์ส / หลักสูตรการอบรม
                </label>
                <select
                  className="form-input"
                  value={form.courseId}
                  onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
                  style={{ fontSize: 13 }}
                >
                  <option value="">— ไม่ระบุคอร์ส —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  วันที่ปฏิบัติ
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={form.recordDate}
                  onChange={(e) => setForm((p) => ({ ...p, recordDate: e.target.value }))}
                  required
                />
              </div>

              {/* Count fields */}
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  จำนวน Case ที่ปฏิบัติ
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {FIELDS.map(({ key, label, color }) => (
                    <div key={key}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontWeight: 600,
                          color,
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="form-input"
                        value={form[key]}
                        onChange={(e) => setForm((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '8px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  style={{ resize: 'vertical', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกผล'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Table */}
      {fetching ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          กำลังโหลด...
        </div>
      ) : records.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--bg-card)',
            borderRadius: 16,
            border: '1px dashed var(--border)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            ยังไม่มีบันทึก
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            กดปุ่ม "บันทึกผลใหม่" เพื่อเริ่มต้น
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--bg-card)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                <th style={th}>วันที่</th>
                <th style={th}>คอร์ส</th>
                <th style={{ ...th, color: '#FCA5A5' }}>แดง</th>
                <th style={{ ...th, color: '#FCD34D' }}>เหลือง</th>
                <th style={{ ...th, color: '#86EFAC' }}>เขียว</th>
                <th style={th}>Vital</th>
                <th style={th}>CC</th>
                <th style={th}>HPI</th>
                <th style={th}>หัตการ</th>
                <th style={th}>LAB</th>
                <th style={th}>X-Ray</th>
                <th style={th}>ยา</th>
                <th style={th}>บิล</th>
                <th style={th}>อื่นๆ</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                  <td style={td}>
                    {new Date(r.recordDate).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </td>
                  <td style={{ ...td, fontSize: 11, color: 'var(--text-muted)', maxWidth: 120 }}>
                    {r.course?.title ?? '—'}
                  </td>
                  <td style={{ ...td, color: '#DC2626', fontWeight: 700 }}>{r.triageRed}</td>
                  <td style={{ ...td, color: '#D97706', fontWeight: 700 }}>{r.triageYellow}</td>
                  <td style={{ ...td, color: '#16A34A', fontWeight: 700 }}>{r.triageGreen}</td>
                  <td style={td}>{r.vitalSigns}</td>
                  <td style={td}>{r.cc}</td>
                  <td style={td}>{r.hpi}</td>
                  <td style={td}>{r.procedures}</td>
                  <td style={td}>{r.labOrders}</td>
                  <td style={td}>{r.xrayOrders}</td>
                  <td style={td}>{r.medications}</td>
                  <td style={td}>{r.billing}</td>
                  <td style={td}>{r.otherExpenses}</td>
                  <td style={td}>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        fontSize: 14,
                        padding: 4,
                      }}
                      title="ลบ"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info box */}
      <div
        style={{
          marginTop: 24,
          padding: '14px 18px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 12,
          fontSize: 13,
          color: '#1E40AF',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <span>
          การบันทึกผลการปฏิบัติหลังอบรมเป็น<strong>เงื่อนไขในการรับใบประกาศนียบัตร</strong> —
          หลังดูวิดีโอและสอบผ่านแล้ว ต้องบันทึกผลการปฏิบัติจริงก่อนจึงจะออกใบประกาศนียบัตรได้
        </span>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '10px 10px',
  fontSize: 11,
  fontWeight: 700,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '9px 10px',
  fontSize: 13,
  textAlign: 'center',
  borderBottom: '1px solid var(--border)',
};
