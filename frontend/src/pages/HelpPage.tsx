import { useEffect, useState } from 'react';
import {
  helpService,
  type HelpContent,
  type FaqItem,
  type ContactChannel,
} from '../services/helpService';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();
  const [content, setContent] = useState<HelpContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    helpService
      .getContent()
      .then(setContent)
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

  const faqs: FaqItem[] = content?.faqs ?? [];
  const contacts: ContactChannel[] = content?.contacts ?? [];
  const tips: string[] = content?.tips ?? [];

  return (
    <div className="anim-up" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
          {t.help_title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>{t.help_subtitle}</p>
      </div>

      {/* ─── FAQ ─── */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ❓ {t.help_faq_title}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="card"
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              style={{
                cursor: 'pointer',
                padding: 18,
                borderLeft: `3px solid var(--primary)`,
                transition: 'box-shadow 0.15s',
                boxShadow: openFaq === faq.id ? '0 4px 20px rgba(123,104,238,0.2)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{faq.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--primary)',
                      marginBottom: 4,
                    }}
                  >
                    {faq.question}
                  </div>
                  {openFaq === faq.id && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        marginTop: 6,
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                  {openFaq !== faq.id && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>คลิกเพื่อดูคำตอบ</div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {openFaq === faq.id ? '▲' : '▼'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          📞 {t.help_contact_title}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {contacts.map((ch) => (
            <div
              key={ch.id}
              className="card"
              style={{
                padding: 20,
                textAlign: 'center',
                borderTop: `3px solid ${ch.color}`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{ch.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: ch.color, marginBottom: 4 }}>
                {ch.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                {ch.detail}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {ch.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Tips ─── */}
      {tips.length > 0 && (
        <section>
          <div
            className="card"
            style={{
              padding: 24,
              background: 'linear-gradient(135deg,rgba(255,243,205,0.6),rgba(255,249,231,0.8))',
              border: '1px solid #FCD34D',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#92400E', marginBottom: 14 }}>
              {t.help_tips_title}
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {tips.map((tip, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 13,
                    color: '#78350F',
                  }}
                >
                  <span style={{ color: '#16A34A', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                    ✅
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
