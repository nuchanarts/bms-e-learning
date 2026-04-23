import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface HospitalResult {
  hospcode: string;
  name: string;
  province: string;
  district: string;
}

const POSITION_GROUPS: { label: string; items: string[] }[] = [
  {
    label: '👨‍⚕️ แพทย์และทันตแพทย์',
    items: ['นายแพทย์', 'แพทย์หญิง', 'ทันตแพทย์ชาย', 'ทันตแพทย์หญิง'],
  },
  {
    label: '💊 เภสัชกรรม',
    items: ['เภสัชกร', 'เจ้าพนักงานเภสัชกรรม'],
  },
  {
    label: '👩‍⚕️ พยาบาล',
    items: ['พยาบาลวิชาชีพ', 'พยาบาลเทคนิค', 'ผดุงครรภ์'],
  },
  {
    label: '🏥 วิชาชีพด้านสาธารณสุข',
    items: ['นักวิชาการสาธารณสุข', 'เจ้าพนักงานสาธารณสุข', 'เจ้าพนักงานทันตสาธารณสุข'],
  },
  {
    label: '🔬 วิทยาศาสตร์การแพทย์',
    items: [
      'นักเทคนิคการแพทย์',
      'เจ้าพนักงานวิทยาศาสตร์การแพทย์',
      'นักรังสีการแพทย์',
      'เจ้าพนักงานรังสีการแพทย์',
      'นายช่างรังสีการแพทย์',
    ],
  },
  {
    label: '🤸 กายภาพบำบัดและกิจกรรมบำบัด',
    items: ['นักกายภาพบำบัด', 'นักกิจกรรมบำบัด', 'นักแก้ไขการพูด', 'นักแก้ไขการได้ยิน'],
  },
  {
    label: '🥗 โภชนาการ',
    items: ['นักโภชนาการ', 'นักกำหนดอาหาร'],
  },
  {
    label: '🧠 จิตวิทยาและสังคมสงเคราะห์',
    items: ['นักจิตวิทยาคลินิก', 'นักจิตวิทยา', 'นักสังคมสงเคราะห์'],
  },
  {
    label: '🏛️ บริหารและบุคลากร',
    items: [
      'ผู้อำนวยการโรงพยาบาล',
      'รองผู้อำนวยการโรงพยาบาล',
      'ผู้อำนวยการโรงพยาบาลส่งเสริมสุขภาพตำบล',
      'หัวหน้าฝ่าย',
      'หัวหน้าแผนก',
      'หัวหน้างาน',
      'นักทรัพยากรบุคคล',
      'เจ้าพนักงานธุรการ',
      'นักวิเคราะห์นโยบายและแผน',
    ],
  },
  {
    label: '💰 การเงินและพัสดุ',
    items: [
      'นักวิชาการเงินและบัญชี',
      'เจ้าพนักงานการเงินและบัญชี',
      'นักวิชาการพัสดุ',
      'เจ้าพนักงานพัสดุ',
    ],
  },
  {
    label: '💻 เทคโนโลยีสารสนเทศ',
    items: ['นักวิชาการคอมพิวเตอร์', 'นักสถิติ', 'นักวิทยาศาสตร์ข้อมูล'],
  },
  {
    label: '🔧 ช่างและบริการ',
    items: [
      'นายช่างเทคนิค',
      'นายช่างไฟฟ้า',
      'นายช่างโยธา',
      'พนักงานช่วยเหลือคนไข้',
      'พนักงานบริการ',
      'พนักงานขับรถ',
    ],
  },
];

// Flat list of all positions for checking if a value is in the list
const ALL_POSITIONS = POSITION_GROUPS.flatMap((g) => g.items);

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [hospital, setHospital] = useState(user?.hospital ?? '');
  const [hospcode, setHospcode] = useState((user as any)?.hospcode ?? '');
  const [positionSelect, setPositionSelect] = useState(
    ALL_POSITIONS.includes(user?.position ?? '') ? (user?.position ?? '') : 'อื่นๆ',
  );
  const [positionCustom, setPositionCustom] = useState(
    ALL_POSITIONS.includes(user?.position ?? '') ? '' : (user?.position ?? ''),
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Hospcode lookup
  const [hospcodeStatus, setHospcodeStatus] = useState<'idle' | 'loading' | 'found' | 'notfound'>(
    'idle',
  );
  const codeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hospital name search
  const [hospitalResults, setHospitalResults] = useState<HospitalResult[]>([]);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const hospitalRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookupByCode = (code: string) => {
    const cleaned = code.replace(/\D/g, '').slice(0, 5);
    setHospcode(cleaned);
    if (codeTimeout.current) clearTimeout(codeTimeout.current);
    if (!/^\d{5}$/.test(cleaned)) {
      setHospcodeStatus('idle');
      return;
    }
    setHospcodeStatus('loading');
    codeTimeout.current = setTimeout(async () => {
      try {
        const { data } = await api.get<HospitalResult[]>(
          `/hospitals?q=${encodeURIComponent(cleaned)}`,
        );
        const exact = data.find((h) => h.hospcode === cleaned);
        if (exact) {
          setHospital(exact.name);
          setHospcodeStatus('found');
        } else {
          setHospcodeStatus('notfound');
        }
      } catch {
        setHospcodeStatus('notfound');
      }
    }, 400);
  };

  const searchHospitalsByName = (q: string) => {
    setHospital(q);
    setHospcode('');
    setHospcodeStatus('idle');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim() || q.length < 2) {
      setHospitalResults([]);
      setShowHospitalDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setHospitalLoading(true);
      try {
        const { data } = await api.get(`/hospitals?q=${encodeURIComponent(q)}`);
        setHospitalResults(data);
        setShowHospitalDropdown(data.length > 0);
      } catch {
        /* ignore */
      } finally {
        setHospitalLoading(false);
      }
    }, 300);
  };

  const selectHospital = (h: HospitalResult) => {
    setHospital(h.name);
    setHospcode(h.hospcode);
    setHospcodeStatus('found');
    setHospitalResults([]);
    setShowHospitalDropdown(false);
  };

  const position = positionSelect === 'อื่นๆ' ? positionCustom : positionSelect;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setError('');
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile({
        name: name.trim(),
        hospital: hospital.trim() || undefined,
        position: position.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    STAFF: 'เจ้าหน้าที่',
    CUSTOMER: 'ผู้เรียน',
  };

  return (
    <div className="anim-up" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
          โปรไฟล์ของฉัน
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          ดูและแก้ไขข้อมูลส่วนตัว
        </p>
      </div>

      <div className="card" style={{ padding: '28px 28px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {user?.email}
            </div>
            <span className="badge badge-blue" style={{ marginTop: 6, display: 'inline-block' }}>
              {roleLabel[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Read-only email */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              อีเมล (ไม่สามารถเปลี่ยนได้)
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-muted)',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* CID read-only */}
          {user?.cid && (
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                เลขบัตรประชาชน
              </label>
              <input
                value={user.cid}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              ชื่อ-นามสกุล <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ-นามสกุล"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                background: '#fff',
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Hospcode */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              รหัสสถานพยาบาล 5 หลัก
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={hospcode}
                onChange={(e) => lookupByCode(e.target.value)}
                placeholder="เช่น 10669"
                maxLength={5}
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              {hospcodeStatus === 'loading' && (
                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                </span>
              )}
            </div>
            {hospcodeStatus === 'found' && (
              <div style={{ fontSize: 11, color: '#16A34A', marginTop: 3, fontWeight: 600 }}>
                ✓ พบสถานพยาบาล
              </div>
            )}
            {hospcodeStatus === 'notfound' && (
              <div style={{ fontSize: 11, color: '#D97706', marginTop: 3 }}>
                ไม่พบรหัสนี้ — พิมพ์ชื่อด้านล่างได้
              </div>
            )}
          </div>

          {/* Hospital name search */}
          <div ref={hospitalRef} style={{ position: 'relative' }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              หน่วยงาน / โรงพยาบาล
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={hospital}
                onChange={(e) => searchHospitalsByName(e.target.value)}
                onFocus={() => hospitalResults.length > 0 && setShowHospitalDropdown(true)}
                placeholder="พิมพ์ชื่อเพื่อค้นหา..."
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              {hospitalLoading && (
                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                </span>
              )}
            </div>
            {showHospitalDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--card-bg, #fff)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {hospitalResults.map((h) => (
                  <div
                    key={h.hospcode}
                    onMouseDown={() => selectHospital(h)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        'rgba(99,102,241,0.08)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = '')
                    }
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {h.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      รหัส {h.hospcode} · {h.district} · {h.province}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Position */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              ตำแหน่ง
            </label>
            <select
              value={positionSelect}
              onChange={(e) => setPositionSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border)',
                background: '#fff',
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="">-- เลือกตำแหน่ง --</option>
              {POSITION_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="อื่นๆ">อื่นๆ (ระบุเพิ่มเติม)</option>
            </select>
            {positionSelect === 'อื่นๆ' && (
              <input
                value={positionCustom}
                onChange={(e) => setPositionCustom(e.target.value)}
                placeholder="ระบุตำแหน่ง"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginTop: 8,
                  border: '1.5px solid var(--border)',
                  background: '#fff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            )}
          </div>

          {error && (
            <div className="alert-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: '10px 14px',
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: 10,
                fontSize: 14,
                color: '#16A34A',
                fontWeight: 600,
              }}
            >
              ✅ บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ width: '100%', marginTop: 4 }}
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{' '}
                กำลังบันทึก...
              </>
            ) : (
              '💾 บันทึกข้อมูล'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
