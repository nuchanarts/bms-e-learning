interface Props {
  totalCourses: number;
  totalLearners: number;
  totalCertificates: number;
  totalHospitals: number;
  loading?: boolean;
}

const items = [
  { key: 'totalCourses' as const, label: 'คอร์สทั้งหมด', icon: '📚', suffix: '+ คอร์ส' },
  { key: 'totalLearners' as const, label: 'ผู้เรียนทั้งหมด', icon: '👨‍💻', suffix: '+ คน' },
  { key: 'totalCertificates' as const, label: 'ใบประกาศที่ออก', icon: '🏆', suffix: '+ ใบ' },
  {
    key: 'totalHospitals' as const,
    label: 'รพ.สต. / รพ. ทั่วประเทศ',
    icon: '🏥',
    suffix: '+ แห่ง',
  },
];

export default function StatsBar({
  totalCourses,
  totalLearners,
  totalCertificates,
  totalHospitals,
  loading,
}: Props) {
  const data = { totalCourses, totalLearners, totalCertificates, totalHospitals };
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'linear-gradient(135deg,#2D1B69,#4C1D95,#6D28D9)',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 28,
        boxShadow: '0 4px 24px rgba(76,29,149,0.25)',
      }}
    >
      {items.map(({ key, label, icon, suffix }, i) => (
        <div
          key={key}
          style={{
            padding: '18px 20px',
            textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            background: 'rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
          {loading ? (
            <div
              style={{
                height: 32,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                margin: '0 auto 6px',
                width: 80,
                animation: 'pulse 1.5s infinite',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {data[key].toLocaleString()}
              {suffix.startsWith('+') ? '+' : ''}
            </div>
          )}
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
