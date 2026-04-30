import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { trainingRecordService } from './training-record.service';

export const trainingRecordController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        courseId,
        recordDate,
        triageRed,
        triageYellow,
        triageGreen,
        vitalSigns,
        cc,
        hpi,
        procedures,
        labOrders,
        xrayOrders,
        medications,
        billing,
        otherExpenses,
        notes,
      } = req.body;

      const record = await trainingRecordService.create(userId, {
        courseId: courseId || undefined,
        recordDate: recordDate ? new Date(recordDate) : new Date(),
        triageRed: Number(triageRed ?? 0),
        triageYellow: Number(triageYellow ?? 0),
        triageGreen: Number(triageGreen ?? 0),
        vitalSigns: Number(vitalSigns ?? 0),
        cc: Number(cc ?? 0),
        hpi: Number(hpi ?? 0),
        procedures: Number(procedures ?? 0),
        labOrders: Number(labOrders ?? 0),
        xrayOrders: Number(xrayOrders ?? 0),
        medications: Number(medications ?? 0),
        billing: Number(billing ?? 0),
        otherExpenses: Number(otherExpenses ?? 0),
        notes: notes || undefined,
      });
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  },

  async getMyRecords(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const records = await trainingRecordService.getMyRecords(req.user!.id);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await trainingRecordService.getById(
        req.params.id,
        req.user!.id,
        req.user!.role,
      );
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async getByCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const records = await trainingRecordService.getByCourse(req.params.courseId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await trainingRecordService.update(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.body,
      );
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await trainingRecordService.delete(req.params.id, req.user!.id, req.user!.role);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
