import prisma from '../../lib/prisma';

export interface CreateTrainingRecordDto {
  userId: string;
  courseId?: string;
  recordDate: Date;
  triageRed: number;
  triageYellow: number;
  triageGreen: number;
  vitalSigns: number;
  cc: number;
  hpi: number;
  procedures: number;
  labOrders: number;
  xrayOrders: number;
  medications: number;
  billing: number;
  otherExpenses: number;
  notes?: string;
}

export const trainingRecordRepository = {
  async create(data: CreateTrainingRecordDto) {
    return prisma.trainingRecord.create({
      data,
      include: {
        user: { select: { id: true, name: true, hospital: true, hospcode: true } },
        course: { select: { id: true, title: true } },
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.trainingRecord.findMany({
      where: { userId },
      orderBy: { recordDate: 'desc' },
      include: { course: { select: { id: true, title: true } } },
    });
  },

  async findById(id: string) {
    return prisma.trainingRecord.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, hospital: true, hospcode: true } },
        course: { select: { id: true, title: true } },
      },
    });
  },

  async findByCourse(courseId: string) {
    return prisma.trainingRecord.findMany({
      where: { courseId },
      orderBy: [{ recordDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, hospital: true, hospcode: true, position: true } },
        course: { select: { id: true, title: true } },
      },
    });
  },

  async existsForUserAndCourse(userId: string, courseId: string) {
    const count = await prisma.trainingRecord.count({ where: { userId, courseId } });
    return count > 0;
  },

  async update(id: string, data: Partial<Omit<CreateTrainingRecordDto, 'userId'>>) {
    return prisma.trainingRecord.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.trainingRecord.delete({ where: { id } });
  },
};
