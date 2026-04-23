import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { paymentService } from '../../services/paymentService';

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

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({
  courseId,
  courseTitle,
  price,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const payload = buildPromptPayPayload(PROMPTPAY_NUMBER, price);
    QRCode.toDataURL(payload, { width: 220, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [price]);

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await paymentService.purchase(courseId);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'ชำระเงินไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1B2B5E,#2563EB)',
            padding: '20px 24px',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 2 }}>
                ชำระเงินผ่าน QR PromptPay
              </div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{courseTitle}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              marginTop: 12,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '8px 16px',
              display: 'inline-block',
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800 }}>฿{price.toLocaleString()}</span>
          </div>
        </div>

        {/* Body */}
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
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700, marginBottom: 10 }}>
              📱 สแกน QR ด้วยแอปธนาคาร / TrueMoney / เป๋าตัง
            </div>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="PromptPay QR"
                style={{
                  width: 190,
                  height: 190,
                  display: 'block',
                  margin: '0 auto',
                  border: '2px solid #BBF7D0',
                  borderRadius: 10,
                  padding: 4,
                  background: '#fff',
                }}
              />
            ) : (
              <div
                style={{
                  width: 190,
                  height: 190,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  border: '2px solid #BBF7D0',
                  borderRadius: 10,
                }}
              >
                <div className="spinner" />
              </div>
            )}
          </div>

          {/* Demo notice */}
          <div
            style={{
              padding: '7px 12px',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              fontSize: 11,
              color: '#92400E',
              textAlign: 'center',
            }}
          >
            💡 <strong>Demo:</strong> กด "ยืนยันชำระแล้ว" เพื่อจำลองการชำระเงิน
          </div>

          {/* Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontSize: 13,
              padding: '9px 12px',
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
              style={{ width: 16, height: 16, accentColor: '#10B981' }}
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
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />{' '}
                กำลังตรวจสอบ...
              </>
            ) : (
              <>✅ ยืนยันชำระแล้ว</>
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
