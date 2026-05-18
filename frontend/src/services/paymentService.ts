import api from '../lib/api';

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentRef?: string;
  paidAt?: string;
  createdAt: string;
  course?: { id: string; title: string; category?: string };
}

export const paymentService = {
  async checkAccess(courseId: string): Promise<boolean> {
    const res = await api.get<{ hasAccess: boolean }>(`/payment/access/${courseId}`);
    return res.data.hasAccess;
  },

  async purchase(courseId: string): Promise<Order> {
    const res = await api.post<Order>(`/payment/purchase/${courseId}`);
    return res.data;
  },

  async myOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>('/payment/my-orders');
    return res.data;
  },
};
