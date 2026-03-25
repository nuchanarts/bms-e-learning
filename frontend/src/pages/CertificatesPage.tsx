import { useEffect, useState } from 'react';
import { certificateService, type Certificate } from '../services/certificateService';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService
      .list()
      .then(setCerts)
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

  return (
    <div className="anim-up">
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
          🏆 ใบประกาศของฉัน
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          ใบประกาศนียบัตรทั้งหมดที่ได้รับจากการเรียนจบคอร์ส
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="card" style={{ padding: 40 }}>
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <div className="empty-state-title">ยังไม่มีใบประกาศ</div>
            <div className="empty-state-sub">เรียนจบคอร์สเพื่อรับใบประกาศนียบัตร</div>
            <a
              href="/courses"
              className="btn-primary"
              style={{ display: 'inline-flex', marginTop: 20 }}
            >
              ไปดูคอร์ส
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            <div
              className="card"
              style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span style={{ fontSize: 22 }}>🏆</span>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {certs.length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ใบประกาศทั้งหมด</div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {certs.map((cert) => (
              <div key={cert.id} className="cert-card">
                {/* Top banner */}
                <div className="cert-top">
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    }}
                  >
                    🏆
                  </span>
                </div>

                {/* Body */}
                <div className="cert-body">
                  <div style={{ marginBottom: 4 }}>
                    <span className="badge badge-green">สำเร็จการศึกษา</span>
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: '8px 0 6px',
                      lineHeight: 1.4,
                    }}
                  >
                    {cert.course?.title ?? 'คอร์ส'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    📅 ออกเมื่อ{' '}
                    {new Date(cert.issuedAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <a
                    href={certificateService.downloadUrl(cert.courseId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      justifyContent: 'center',
                      color: '#16A34A',
                      borderColor: '#86EFAC',
                      background: '#F0FDF4',
                    }}
                  >
                    ⬇️ ดาวน์โหลดใบประกาศ
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
