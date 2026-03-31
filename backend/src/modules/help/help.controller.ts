import { Request, Response } from 'express';
import { helpService } from './help.service';

export const helpController = {
  async getContent(req: Request, res: Response) {
    const content = await helpService.getContent();
    res.json(content);
  },

  async updateFaqs(req: Request, res: Response) {
    const { faqs } = req.body;
    if (!Array.isArray(faqs)) {
      res.status(400).json({ error: 'faqs must be an array' });
      return;
    }
    await helpService.updateFaqs(faqs);
    res.json({ ok: true });
  },

  async updateContacts(req: Request, res: Response) {
    const { contacts } = req.body;
    if (!Array.isArray(contacts)) {
      res.status(400).json({ error: 'contacts must be an array' });
      return;
    }
    await helpService.updateContacts(contacts);
    res.json({ ok: true });
  },

  async updateTips(req: Request, res: Response) {
    const { tips } = req.body;
    if (!Array.isArray(tips)) {
      res.status(400).json({ error: 'tips must be an array' });
      return;
    }
    await helpService.updateTips(tips);
    res.json({ ok: true });
  },
};
