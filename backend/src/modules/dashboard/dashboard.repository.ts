import prisma from '../../lib/prisma';

export const dashboardRepository = {
  async getUserCoursesSummary(userId: string) {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        videos: { select: { id: true, title: true, order: true }, orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });

    const progressRecords = await prisma.progress.findMany({
      where: { userId },
      select: {
        videoId: true,
        courseId: true,
        completed: true,
        watchedSeconds: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Build map of last-activity per course
    const lastActivityByCourse: Record<string, Date> = {};
    for (const p of progressRecords) {
      if (!lastActivityByCourse[p.courseId] || p.updatedAt > lastActivityByCourse[p.courseId]) {
        lastActivityByCourse[p.courseId] = p.updatedAt;
      }
    }

    const mapped = courses.map((course) => ({
      ...course,
      progress: progressRecords.filter((p) => p.courseId === course.id),
      lastActivity: lastActivityByCourse[course.id] ?? null,
    }));

    // Sort: courses with recent activity first, then by course order
    mapped.sort((a, b) => {
      if (a.lastActivity && b.lastActivity)
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      if (a.lastActivity) return -1;
      if (b.lastActivity) return 1;
      return a.order - b.order;
    });

    return mapped;
  },
};
