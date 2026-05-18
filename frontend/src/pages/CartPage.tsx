import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { paymentService } from '../services/paymentService';
import QRCode from 'qrcode';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}
function crc16(data: string): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return crc & 0xffff;
}
function buildPromptPayPayload(phone: string, amount: number): string {
  const normalized = '0066' + phone.replace(/\D/g, '').replace(/^0/, '');
  const guid = 'A000000677010111';
  const accountTag = '01' + pad2(normalized.length) + normalized;
  const guidTag = '00' + pad2(guid.length) + guid;
  const merchantInfo = guidTag + accountTag;
  const amountStr = amount.toFixed(2);
  const body = [
    '000201',
    '010212',
    '29' + pad2(merchantInfo.length) + merchantInfo,
    '5802TH',
    '5303764',
    '54' + pad2(amountStr.length) + amountStr,
    '6304',
  ].join('');
  return body + crc16(body).toString(16).toUpperCase().padStart(4, '0');
}
const PROMPTPAY_NUMBER = '0800000000';

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paidCourses, setPaidCourses] = useState<string[]>([]);

  useEffect(() => {
    if (step === 'payment' && total > 0) {
      const payload = buildPromptPayPayload(PROMPTPAY_NUMBER, total);
      QRCode.toDataURL(payload, { width: 220, margin: 2, errorCorrectionLevel: 'M' })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    }
  }, [step, total]);

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const results = await Promise.all(items.map((item) => paymentService.purchase(item.id)));
      setPaidCourses(results.map((r) => r.courseId));
      clear();
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'ชำระเงินไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="anim-up" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1
            style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}
          >
            ชำระเงินสำเร็จ!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            คุณสามารถเริ่มเรียนได้ทันที — ซื้อไป {paidCourses.length} คอร์ส
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/courses')}>
              🎓 ไปหน้าคอร์สเรียน
            </button>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
              📊 Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment (QR) ──────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="anim-up" style={{ maxWidth: 460, margin: '0 auto' }}>
        <div className="breadcrumb" style={{ marginBottom: 20 }}>
          <button
            onClick={() => setStep('cart')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            className="breadcrumb-link"
          >
            ← กลับไปตะกร้า
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg,#1B2B5E,#2563EB)',
              padding: '20px 24px',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              ชำระเงินผ่าน QR PromptPay
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span style={{ opacity: 0.9 }}>{item.title}</span>
                <span style={{ fontWeight: 700 }}>฿{item.price.toLocaleString()}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                paddingTop: 10,
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 700 }}>รวมทั้งหมด</span>
              <span style={{ fontSize: 22, fontWeight: 800 }}>฿{total.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* QR Code */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                borderRadius: 14,
                padding: '18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 700, marginBottom: 4 }}>
                📱 สแกน QR เพื่อชำระผ่าน PromptPay
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 12 }}>
                รองรับ: ธนาคารทุกแห่ง · TrueMoney Wallet · แอปเป๋าตัง
              </div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="PromptPay QR"
                  style={{
                    width: 200,
                    height: 200,
                    display: 'block',
                    margin: '0 auto 12px',
                    border: '3px solid #BBF7D0',
                    borderRadius: 12,
                    padding: 4,
                    background: '#fff',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 200,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    border: '3px solid #BBF7D0',
                    borderRadius: 12,
                  }}
                >
                  <div className="spinner" />
                </div>
              )}
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>ยอดที่ต้องชำระ</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
                ฿{total.toLocaleString()}
              </div>
            </div>

            {/* Demo notice */}
            <div
              style={{
                padding: '8px 12px',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: 8,
                fontSize: 12,
                color: '#92400E',
                textAlign: 'center',
              }}
            >
              💡 <strong>Demo mode</strong> — กด "ยืนยันชำระแล้ว" เพื่อจำลองการชำระเงิน
            </div>

            {/* Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 14,
                padding: '10px 14px',
                background: confirmed ? '#F0FDF4' : 'var(--bg)',
                border: `1.5px solid ${confirmed ? '#BBF7D0' : 'var(--border)'}`,
                borderRadius: 10,
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#10B981' }}
              />
              โอนเงินเรียบร้อยแล้ว
            </label>

            <button
              className="btn-primary"
              disabled={!confirmed || loading}
              style={{
                width: '100%',
                background: confirmed ? 'linear-gradient(135deg,#10B981,#34D399)' : undefined,
              }}
              onClick={handleCheckout}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{' '}
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>✅ ยืนยันชำระแล้ว · ฿{total.toLocaleString()}</>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
              🔒 ธุรกรรมนี้ปลอดภัยและเข้ารหัส
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  return (
    <div className="anim-up">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            🛒 ตะกร้าสินค้า
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {items.length === 0 ? 'ยังไม่มีคอร์สในตะกร้า' : `${items.length} คอร์ส`}
          </p>
        </div>
        <Link to="/courses" className="btn-secondary">
          ← เลือกคอร์สเพิ่ม
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}
          >
            ตะกร้าว่างเปล่า
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            เพิ่มคอร์สที่คุณสนใจก่อนชำระเงิน
          </div>
          <Link to="/courses" className="btn-primary">
            🎓 ดูคอร์สทั้งหมด
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
            alignItems: 'start',
          }}
          className="detail-grid"
        >
          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  🎓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.category && <span className="badge badge-purple">{item.category}</span>}
                </div>
                <div
                  style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}
                >
                  ฿{item.price.toLocaleString()}
                </div>
                <button
                  onClick={() => remove(item.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.25)',
                    background: 'rgba(239,68,68,0.06)',
                    color: '#DC2626',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    flexShrink: 0,
                  }}
                >
                  🗑 ลบ
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: '20px 22px', position: 'sticky', top: 72 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 16,
              }}
            >
              สรุปคำสั่งซื้อ
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    marginRight: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.title}
                </span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>
                  ฿{item.price.toLocaleString()}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 12,
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>รวมทั้งหมด</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>
                ฿{total.toLocaleString()}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => setStep('payment')}
            >
              📱 ชำระผ่าน QR PromptPay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
