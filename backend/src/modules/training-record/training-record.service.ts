import { trainingRecordRepository, CreateTrainingRecordDto } from './training-record.repository';
import prisma from '../../lib/prisma';

export const trainingRecordService = {
  async create(userId: string, dto: Omit<CreateTrainingRecordDto, 'userId'>) {
    // Verify the user exists and name matches
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('ไม่พบผู้ใช้งาน'), { status: 404 });

    return trainingRecordRepository.create({ ...dto, userId });
  },

  async getMyRecords(userId: string) {
    return trainingRecordRepository.findByUser(userId);
  },

  async getById(id: string, requesterId: string, requesterRole: string) {
    const record = await trainingRecordRepository.findById(id);
    if (!record) throw Object.assign(new Error('ไม่พบข้อมูล'), { status: 404 });
    if (record.userId !== requesterId && requesterRole !== 'ADMIN')
      throw Object.assign(new Error('ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'), { status: 403 });
    return record;
  },

  async getByCourse(courseId: string) {
    return trainingRecordRepository.findByCourse(courseId);
  },

  // Check whether this user has a training record for a course (prerequisite for certificate)
  async hasRecordForCourse(userId: string, courseId: string) {
    return trainingRecordRepository.existsForUserAndCourse(userId, courseId);
  },

  async update(
    id: string,
    requesterId: string,
    requesterRole: string,
    data: Partial<Omit<CreateTrainingRecordDto, 'userId'>>,
  ) {
    const record = await trainingRecordRepository.findById(id);
    if (!record) throw Object.assign(new Error('ไม่พบข้อมูล'), { status: 404 });
    if (record.userId !== requesterId && requesterRole !== 'ADMIN')
      throw Object.assign(new Error('ไม่มีสิทธิ์แก้ไขข้อมูลนี้'), { status: 403 });
    return trainingRecordRepository.update(id, data);
  },

  async delete(id: string, requesterId: string, requesterRole: string) {
    const record = await trainingRecordRepository.findById(id);
    if (!record) throw Object.assign(new Error('ไม่พบข้อมูล'), { status: 404 });
    if (record.userId !== requesterId && requesterRole !== 'ADMIN')
      throw Object.assign(new Error('ไม่มีสิทธิ์ลบข้อมูลนี้'), { status: 403 });
    return trainingRecordRepository.delete(id);
  },
};
