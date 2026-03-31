import api from '../lib/api';

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

export const helpService = {
  async getContent(): Promise<HelpContent> {
    const res = await api.get<HelpContent>('/help');
    return res.data;
  },
  async updateFaqs(faqs: FaqItem[]): Promise<void> {
    await api.put('/help/faqs', { faqs });
  },
  async updateContacts(contacts: ContactChannel[]): Promise<void> {
    await api.put('/help/contacts', { contacts });
  },
  async updateTips(tips: string[]): Promise<void> {
    await api.put('/help/tips', { tips });
  },
};
