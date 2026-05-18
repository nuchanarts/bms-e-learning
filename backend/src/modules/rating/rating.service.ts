import { ratingRepository } from './rating.repository';
import { progressRepository } from '../progress/progress.repository';
import { courseRepository } from '../course/course.repository';
import { quizService } from '../quiz/quiz.service';

export const ratingService = {
  async getRatings(courseId: string) {
    const [ratings, stats] = await Promise.all([
      ratingRepository.findByCourse(courseId),
      ratingRepository.getStats(courseId),
    ]);
    return {
      ...stats,
      reviews: ratings.map((r) => ({
        id: r.id,
        userName: r.user.name,
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      })),
    };
  },

  async submitRating(userId: string, courseId: string, rating: number, review?: string | null) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw Object.assign(new Error('Rating must be an integer between 1 and 5'), { status: 400 });
    }
    if (review && review.length > 500) {
      throw Object.assign(new Error('Review must not exceed 500 characters'), { status: 400 });
    }

    const course = await courseRepository.findById(courseId);
    if (!course) throw Object.assign(new Error('Course not found'), { status: 404 });

    const completedCount = await progressRepository.countCompletedVideos(userId, courseId);
    if (completedCount < course.videos.length) {
      throw Object.assign(new Error('กรุณาเรียนให้จบก่อนให้คะแนน'), { status: 403 });
    }
    if (course.quizRequired) {
      const passed = await quizService.isQuizPassed(userId, courseId);
      if (!passed) throw Object.assign(new Error('กรุณาผ่านแบบทดสอบก่อนให้คะแนน'), { status: 403 });
    }

    return ratingRepository.upsert(userId, courseId, rating, review);
  },

  async deleteRating(id: string) {
    const r = await ratingRepository.findById(id);
    if (!r) throw Object.assign(new Error('Rating not found'), { status: 404 });
    return ratingRepository.delete(id);
  },

  async getUserRating(userId: string, courseId: string) {
    return ratingRepository.findByUserAndCourse(userId, courseId);
  },
};
