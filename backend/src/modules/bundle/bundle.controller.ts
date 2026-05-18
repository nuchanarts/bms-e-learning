import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { bundleService } from './bundle.service';

export const bundleController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await bundleService.listActive());
    } catch (err) {
      next(err);
    }
  },
  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await bundleService.listAll());
    } catch (err) {
      next(err);
    }
  },
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, price, courseIds } = req.body;
      res.status(201).json(await bundleService.create({ name, description, price, courseIds }));
    } catch (err) {
      next(err);
    }
  },
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await bundleService.update(req.params.id, req.body));
    } catch (err) {
      next(err);
    }
  },
  async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bundleService.deactivate(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
  async purchase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await bundleService.purchaseBundle(req.user!.id, req.params.id));
    } catch (err) {
      next(err);
    }
  },
};
