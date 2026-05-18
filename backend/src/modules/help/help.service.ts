import prisma from '../../lib/prisma';

export interface FaqItem {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export interface ContactChannel {
  id: string;
  icon: string;
  label: string;
  detail: string;
  value: string;
  color: string;
}

export interface HelpContent {
  faqs: FaqItem[];
  contacts: ContactChannel[];
  tips: string[];
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: '1',
    icon: '📝',
    question: 'วิธีลงทะเบียนเข้าระบบ',
    answer: 'คลิกปุ่ม "ลงทะเบียน" ด้านบน แล้วกรอกข้อมูลให้ครบ ระบบจะพาไปยังหน้าหลักอัตโนมัติ',
  },
  {
    id: '2',
    icon: '📺',
    question: 'วิธีดูวิดีโอคอร์สเรียน',
    answer:
      'เลือกหลักสูตรที่ต้องการ → คลิกเลือกวิดีโอ → กดปุ่ม "เริ่มเรียน" ระบบจะบันทึกความคืบหน้าให้อัตโนมัติ',
  },
  {
    id: '3',
    icon: '🏆',
    question: 'วิธีรับใบประกาศนียบัตร',
    answer: 'เรียนให้ครบ 6 ชั่วโมง และผ่านแบบทดสอบ 60% ขึ้นไป ระบบจะออกใบประกาศให้ชัวโมคิดไปได้',
  },
  {
    id: '4',
    icon: '🔑',
    question: 'ความคืบหน้าหายไป',
    answer: 'ตรวจสอบว่าใช้ Browser เดียวกัน และไม่ได้ล้าง Cache หรือ Cookies ของเว็บไซต์',
  },
  {
    id: '5',
    icon: '▶️',
    question: 'วิดีโอเล่นไม่ได้',
    answer:
      'ตรวจสอบ Internet Connection หรือลองรีเฟรชหน้าเว็บ หากยังไม่ได้ติดต่อเราผ่านช่องทางด้านล่าง',
  },
  {
    id: '6',
    icon: '🌐',
    question: 'เปลี่ยนภาษาได้ไหม',
    answer: 'ได้เลย! คลิกที่ปุ่มภาษา (TH) มุมขวาบน เลือกภาษาที่ต้องการ รองรับ 6 ภาษา',
  },
];

const DEFAULT_CONTACTS: ContactChannel[] = [
  {
    id: '1',
    icon: '📧',
    label: 'Email Support',
    detail: 'ตอบกลับภายใน 24 ชั่วโมง',
    value: 'support@rpst-learning.go.th',
    color: '#7B68EE',
  },
  {
    id: '2',
    icon: '📞',
    label: 'Hotline',
    detail: 'จันทร์-ศุกร์ 9:00-18:00',
    value: '02-XXX-XXXX',
    color: '#EC4899',
  },
  {
    id: '3',
    icon: '💬',
    label: 'LINE Official',
    detail: 'ตอบเร็ว ตลอด 24 ชั่วโมง',
    value: '@rpst-learning',
    color: '#10B981',
  },
  {
    id: '4',
    icon: '📘',
    label: 'Facebook',
    detail: 'ติดตามข่าวสารและอัพเดท',
    value: 'รพ.สต. Learning Hub',
    color: '#3B82F6',
  },
];

const DEFAULT_TIPS: string[] = [
  'ใช้ Browser Chrome, Firefox, หรือ Safari เวอร์ชันล่าสุดเพื่อประสบการณ์ที่ดีที่สุด',
  'ดูวิดีโอด้วย Internet ความเร็วอย่างน้อย 5 Mbps เพื่อความลื่นไหล',
  'ระบบบันทึกความคืบหน้าอัตโนมัติ แต่อย่าลืมดูวิดีโอให้จบเพื่อให้นับเป็นเวลาเรียน',
  'คลิกที่ปุ่ม Dashboard เพื่อดูสถิติและความคืบหน้าของคุณ',
];

async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

async function setSetting(key: string, value: unknown): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

export const helpService = {
  async getContent(): Promise<HelpContent> {
    const [faqs, contacts, tips] = await Promise.all([
      getSetting<FaqItem[]>('help_faqs', DEFAULT_FAQS),
      getSetting<ContactChannel[]>('help_contacts', DEFAULT_CONTACTS),
      getSetting<string[]>('help_tips', DEFAULT_TIPS),
    ]);
    return { faqs, contacts, tips };
  },

  async updateFaqs(faqs: FaqItem[]): Promise<void> {
    await setSetting('help_faqs', faqs);
  },

  async updateContacts(contacts: ContactChannel[]): Promise<void> {
    await setSetting('help_contacts', contacts);
  },

  async updateTips(tips: string[]): Promise<void> {
    await setSetting('help_tips', tips);
  },
};
