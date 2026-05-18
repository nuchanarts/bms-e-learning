import prisma from '../../lib/prisma';

export const ratingRepository = {
  findByCourse(courseId: string) {
    return prisma.courseRating.findMany({
      where: { courseId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByUserAndCourse(userId: string, courseId: string) {
    return prisma.courseRating.findUnique({ where: { userId_courseId: { userId, courseId } } });
  },

  findById(id: string) {
    return prisma.courseRating.findUnique({ where: { id } });
  },

  upsert(userId: string, courseId: string, rating: number, review?: string | null) {
    return prisma.courseRating.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating, review: review ?? null },
      update: { rating, review: review ?? null },
    });
  },

  delete(id: string) {
    return prisma.courseRating.delete({ where: { id } });
  },

  async getStats(courseId: string) {
    const result = await prisma.courseRating.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      avgRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : null,
      ratingCount: result._count.rating,
    };
  },
};
