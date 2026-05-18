import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ratingService } from './rating.service';

export const ratingController = {
  async getRatings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await ratingService.getRatings(req.params.courseId));
    } catch (err) {
      next(err);
    }
  },

  async submitRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rating, review } = req.body;
      const result = await ratingService.submitRating(
        req.user!.id,
        req.params.courseId,
        rating,
        review,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getUserRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const r = await ratingService.getUserRating(req.user!.id, req.params.courseId);
      res.json(r ?? null);
    } catch (err) {
      next(err);
    }
  },

  async deleteRating(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ratingService.deleteRating(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
