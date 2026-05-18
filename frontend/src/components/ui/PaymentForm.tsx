/**
 * QR PromptPay payment form (only payment method).
 */
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function crc16(data: string): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
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

interface PaymentFormProps {
  total: number;
  loading: boolean;
  error: string;
  onSubmitQR: () => void;
}

export function PaymentForm({ total, loading, error, onSubmitQR }: PaymentFormProps) {
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const payload = buildPromptPayPayload(PROMPTPAY_NUMBER, total);
    QRCode.toDataURL(payload, { width: 220, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [total]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div className="alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* QR Box */}
      <div
        style={{
          background: '#F0FDF4',
          border: '1.5px solid #BBF7D0',
          borderRadius: 16,
          padding: '20px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 700, marginBottom: 4 }}>
          📱 สแกน QR เพื่อชำระผ่าน PromptPay
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 14 }}>
          รองรับ: ธนาคารทุกแห่ง · TrueMoney Wallet · แอปเป๋าตัง
        </div>

        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="PromptPay QR Code"
            style={{
              width: 200,
              height: 200,
              margin: '0 auto 14px',
              display: 'block',
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
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #BBF7D0',
              borderRadius: 12,
              color: '#16A34A',
              fontSize: 13,
            }}
          >
            <div className="spinner" />
          </div>
        )}

        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>ยอดที่ต้องชำระ</div>
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

      {/* Confirm checkbox */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          fontSize: 14,
          color: 'var(--text-primary)',
          padding: '10px 14px',
          background: qrConfirmed ? '#F0FDF4' : 'var(--bg)',
          border: `1.5px solid ${qrConfirmed ? '#BBF7D0' : 'var(--border)'}`,
          borderRadius: 10,
          transition: 'all 0.15s',
        }}
      >
        <input
          type="checkbox"
          checked={qrConfirmed}
          onChange={(e) => setQrConfirmed(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: '#10B981' }}
        />
        โอนเงินเรียบร้อยแล้ว
      </label>

      <button
        type="button"
        className="btn-primary"
        disabled={!qrConfirmed || loading}
        style={{
          width: '100%',
          background: qrConfirmed ? 'linear-gradient(135deg,#10B981,#34D399)' : undefined,
        }}
        onClick={onSubmitQR}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
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
  );
}
