export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div className={cls} />
      {size !== 'sm' && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>กำลังโหลด...</p>
      )}
    </div>
  );
}
