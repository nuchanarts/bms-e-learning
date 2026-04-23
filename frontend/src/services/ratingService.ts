import api from '../lib/api';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

export interface RatingsResponse {
  avgRating: number | null;
  ratingCount: number;
  reviews: Review[];
}

export const ratingService = {
  getRatings: (courseId: string) =>
    api.get<RatingsResponse>(`/ratings/${courseId}`).then((r) => r.data),
  getMyRating: (courseId: string) =>
    api
      .get<{ rating: number; review: string | null } | null>(`/ratings/${courseId}/my`)
      .then((r) => r.data),
  submit: (courseId: string, rating: number, review?: string) =>
    api.post(`/ratings/${courseId}`, { rating, review }).then((r) => r.data),
  deleteAdmin: (id: string) => api.delete(`/admin/ratings/${id}`),
};
