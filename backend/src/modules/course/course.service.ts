import { courseRepository } from './course.repository';
import prisma from '../../lib/prisma';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function enrichCourses(courses: any[]) {
  if (courses.length === 0) return courses;
  const courseIds = courses.map((c) => c.id);
  const now = Date.now();

  const [enrollGroups, ratingAggs] = await Promise.all([
    prisma.progress.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _count: { userId: true },
    }),
    prisma.courseRating.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const enrollMap: Record<string, number> = {};
  enrollGroups.forEach((g) => {
    enrollMap[g.courseId] = g._count.userId;
  });
  const ratingMap: Record<string, { avg: number | null; count: number }> = {};
  ratingAggs.forEach((g) => {
    ratingMap[g.courseId] = {
      avg: g._avg.rating ? Math.round(g._avg.rating * 10) / 10 : null,
      count: g._count.rating,
    };
  });

  return courses.map((c) => ({
    ...c,
    enrollCount: enrollMap[c.id] ?? 0,
    avgRating: ratingMap[c.id]?.avg ?? null,
    ratingCount: ratingMap[c.id]?.count ?? 0,
    isNew: now - new Date(c.createdAt).getTime() <= THIRTY_DAYS_MS,
  }));
}

export const courseService = {
  async list(category?: string) {
    const courses = await courseRepository.findAll(category);
    return enrichCourses(courses);
  },

  async getRecommended(userPosition?: string) {
    const all = await courseRepository.findAll();
    if (!userPosition) {
      // No position – return newest 6
      return all.slice(0, 6);
    }
    const matched = all.filter((c) => {
      if (!(c as any).recommendedFor) return false;
      try {
        const positions: string[] = JSON.parse((c as any).recommendedFor);
        return positions.some((p) => p === userPosition);
      } catch {
        return false;
      }
    });
    // Mix: matched first, then fill up with newest (no duplicates)
    const matchedIds = new Set(matched.map((c) => c.id));
    const rest = all.filter((c) => !matchedIds.has(c.id));
    return [...matched, ...rest].slice(0, 6);
  },

  async getById(id: string, userId?: string) {
    const course = await courseRepository.findById(id);
    if (!course) throw Object.assign(new Error('Course not found'), { status: 404 });

    // Check prerequisite if userId provided
    if (userId && (course as any).prerequisiteCourseId) {
      const prereqId = (course as any).prerequisiteCourseId;
      const cert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId: prereqId } },
      });
      if (!cert) {
        const prereq = await prisma.course.findUnique({
          where: { id: prereqId },
          select: { title: true },
        });
        throw Object.assign(new Error(`ต้องเรียนจบ "${prereq?.title ?? prereqId}" ก่อน`), {
          status: 403,
          prerequisiteTitle: prereq?.title,
        });
      }
    }

    return course;
  },
};
