import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';

const router = Router();

// Any logged-in user can fetch announcements
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const items = await prisma.announcement.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

export default router;
