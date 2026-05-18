import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const [totalCourses, learnersResult, totalCertificates, hospitalsResult] = await Promise.all([
    prisma.course.count({ where: { isActive: true } }),
    prisma.progress.groupBy({ by: ['userId'], _count: true }),
    prisma.certificate.count(),
    prisma.user.groupBy({ by: ['hospcode'], where: { hospcode: { not: null } }, _count: true }),
  ]);
  res.json({
    totalCourses,
    totalLearners: learnersResult.length,
    totalCertificates,
    totalHospitals: hospitalsResult.length,
  });
});

export default router;
