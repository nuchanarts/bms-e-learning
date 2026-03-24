import { useEffect, useState } from 'react';
import { certificateService, type Certificate } from '../services/certificateService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.list().then(setCerts).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
        <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>🏆 ใบประกาศของฉัน</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>ใบประกาศทั้งหมดที่ได้รับจากการเรียนจบคอร์ส</p>
      </div>

      {certs.length === 0 ? (
        <div className="glass-card p-16 text-center animate-[fadeUp_0.5s_ease]">
          <p className="text-6xl mb-4">🎓</p>
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ยังไม่มีใบประกาศ</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>เรียนจบคอร์สเพื่อรับใบประกาศของคุณ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certs.map((cert, i) => (
            <div key={cert.id}
              className="glass-card p-6 flex flex-col gap-4 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg,rgba(76,175,80,0.15),rgba(76,175,80,0.05))', border: '2px solid rgba(76,175,80,0.2)' }}>
                🏆
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{cert.course?.title ?? 'คอร์ส'}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  ออกเมื่อ {new Date(cert.issuedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <a href={certificateService.downloadUrl(cert.courseId)} target="_blank" rel="noopener noreferrer">
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d32', border: '2px solid rgba(76,175,80,0.3)' }}>
                  ⬇️ ดาวน์โหลด
                </button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
