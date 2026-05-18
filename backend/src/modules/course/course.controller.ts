import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { courseService } from './course.service';

export const courseController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const courses = await courseService.list(category);
      res.json(courses);
    } catch (err) {
      next(err);
    }
  },

  async getRecommended(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let position: string | undefined;
      if (req.user?.id) {
        const { default: prisma } = await import('../../lib/prisma');
        const u = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { position: true },
        });
        position = u?.position ?? undefined;
      }
      res.json(await courseService.getRecommended(position));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getById(req.params.id, req.user?.id);
      res.json(course);
    } catch (err) {
      next(err);
    }
  },
};
