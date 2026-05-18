import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth.middleware';
import prisma from '../../lib/prisma';

const router = Router();

// Search hospitals by code or name (public – needed for registration form)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '').trim();
    const adminMode = req.query.admin === '1';

    if (!q && !adminMode) {
      res.json([]);
      return;
    }

    const isCode = q && /^\d+$/.test(q);
    const where = q
      ? {
          ...(isCode ? { hospcode: { startsWith: q } } : { name: { contains: q } }),
          ...(!adminMode && { isActive: true }),
        }
      : !adminMode
        ? { isActive: true }
        : {};

    const hospitals = await prisma.hospital.findMany({
      where,
      orderBy: isCode ? { hospcode: 'asc' } : { name: 'asc' },
      take: adminMode ? 50 : 20,
      select: {
        hospcode: true,
        name: true,
        province: true,
        district: true,
        isCustom: true,
        isActive: true,
      },
    });
    res.json(hospitals);
  } catch (err) {
    next(err);
  }
});

// Get single hospital by code
router.get('/:code', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const h = await prisma.hospital.findUnique({ where: { hospcode: req.params.code } });
    if (!h) {
      res.status(404).json({ message: 'ไม่พบรหัสสถานพยาบาล' });
      return;
    }
    res.json(h);
  } catch (err) {
    next(err);
  }
});

// Admin: add custom hospital
router.post(
  '/',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { hospcode, name, province, district } = req.body;
      if (!hospcode || !name) {
        res.status(400).json({ message: 'กรุณาระบุรหัสและชื่อสถานพยาบาล' });
        return;
      }
      const h = await prisma.hospital.upsert({
        where: { hospcode: String(hospcode).trim() },
        update: {
          name: String(name).trim(),
          province: province ?? null,
          district: district ?? null,
          isCustom: true,
        },
        create: {
          hospcode: String(hospcode).trim(),
          name: String(name).trim(),
          province: province ?? null,
          district: district ?? null,
          isCustom: true,
        },
      });
      res.status(201).json(h);
    } catch (err) {
      next(err);
    }
  },
);

// Admin: toggle active status
router.patch(
  '/:code/active',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const h = await prisma.hospital.findUnique({ where: { hospcode: req.params.code } });
      if (!h) {
        res.status(404).json({ message: 'ไม่พบรหัสสถานพยาบาล' });
        return;
      }
      const updated = await prisma.hospital.update({
        where: { hospcode: req.params.code },
        data: { isActive: !h.isActive },
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// Admin: delete custom hospital
router.delete(
  '/:code',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const h = await prisma.hospital.findUnique({ where: { hospcode: req.params.code } });
      if (!h) {
        res.status(404).json({ message: 'ไม่พบรหัสสถานพยาบาล' });
        return;
      }
      if (!h.isCustom) {
        res.status(403).json({ message: 'ลบได้เฉพาะรหัสที่ admin เพิ่มเอง' });
        return;
      }
      await prisma.hospital.delete({ where: { hospcode: req.params.code } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
