import api from '../lib/api';

export interface BundleCourse {
  courseId: string;
  course: { id: string; title: string; price: number | null; thumbnailUrl: string | null };
}

export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  courses: BundleCourse[];
}

export const bundleService = {
  list: () => api.get<Bundle[]>('/bundles').then((r) => r.data),
  listAll: () => api.get<Bundle[]>('/bundles/admin/all').then((r) => r.data),
  purchase: (bundleId: string) => api.post(`/bundles/${bundleId}/purchase`).then((r) => r.data),
  create: (data: { name: string; description?: string; price: number; courseIds: string[] }) =>
    api.post<Bundle>('/bundles/admin', data).then((r) => r.data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      courseIds: string[];
      isActive: boolean;
    }>,
  ) => api.put<Bundle>(`/bundles/admin/${id}`, data).then((r) => r.data),
  deactivate: (id: string) => api.delete(`/bundles/admin/${id}`),
};
