import prisma from '../../lib/prisma';

const include = {
  courses: {
    include: { course: { select: { id: true, title: true, price: true, thumbnailUrl: true } } },
  },
};

export const bundleRepository = {
  findAllActive() {
    return prisma.courseBundle.findMany({
      where: { isActive: true },
      include,
      orderBy: { createdAt: 'desc' },
    });
  },

  findAll() {
    return prisma.courseBundle.findMany({ include, orderBy: { createdAt: 'desc' } });
  },

  findById(id: string) {
    return prisma.courseBundle.findUnique({ where: { id }, include });
  },

  async create(data: { name: string; description?: string; price: number; courseIds: string[] }) {
    return prisma.courseBundle.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        courses: { create: data.courseIds.map((courseId) => ({ courseId })) },
      },
      include,
    });
  },

  async update(
    id: string,
    data: { name?: string; description?: string; price?: number; courseIds?: string[] },
  ) {
    const { courseIds, ...rest } = data;
    return prisma.$transaction(async (tx) => {
      if (courseIds) {
        await tx.bundleCourse.deleteMany({ where: { bundleId: id } });
        await tx.bundleCourse.createMany({
          data: courseIds.map((courseId) => ({ bundleId: id, courseId })),
        });
      }
      return tx.courseBundle.update({ where: { id }, data: rest, include });
    });
  },

  deactivate(id: string) {
    return prisma.courseBundle.update({ where: { id }, data: { isActive: false } });
  },

  delete(id: string) {
    return prisma.courseBundle.delete({ where: { id } });
  },
};
