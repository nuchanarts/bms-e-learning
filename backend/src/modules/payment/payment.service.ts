import prisma from '../../lib/prisma';

/**
 * QR PromptPay payment service (mock).
 * In production, integrate with a real gateway (Omise, Stripe, etc.)
 * and handle webhook callbacks to mark orders as PAID.
 */

/** Simulate QR payment confirmation — always succeeds in demo mode */
async function simulateQRConfirm(amount: number): Promise<{ success: boolean; ref: string }> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    success: true,
    ref: `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };
}

export const paymentService = {
  /** Check if a user already has access to a course (free, admin, or already purchased) */
  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    const [course, user] = await Promise.all([
      prisma.course.findUnique({ where: { id: courseId }, select: { price: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    ]);
    if (!course) return false;
    if (!course.price) return true;
    if (user?.role === 'ADMIN') return true;

    const paid = await prisma.order.findFirst({
      where: { userId, courseId, status: 'PAID' },
    });
    return !!paid;
  },

  /** Purchase a course via QR PromptPay (mock confirmation) */
  async purchaseCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, isActive: true },
    });
    if (!course || !course.isActive)
      throw Object.assign(new Error('Course not found'), { status: 404 });
    if (!course.price)
      throw Object.assign(new Error('Course is free — no payment needed'), { status: 400 });

    // Idempotency: already paid
    const existing = await prisma.order.findFirst({ where: { userId, courseId, status: 'PAID' } });
    if (existing) return existing;

    const order = await prisma.order.create({
      data: { userId, courseId, amount: course.price, status: 'PENDING' },
    });

    const result = await simulateQRConfirm(course.price);

    if (!result.success) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      throw Object.assign(new Error('QR payment failed'), { status: 402 });
    }

    return prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paymentRef: result.ref,
        paidAt: new Date(),
      },
    });
  },

  /** List all paid orders for a user */
  async listUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId, status: 'PAID' },
      include: { course: { select: { id: true, title: true, category: true } } },
      orderBy: { paidAt: 'desc' },
    });
  },

  /** Admin: list all orders */
  async listAllOrders(search?: string) {
    return prisma.order.findMany({
      where: search
        ? {
            OR: [
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
              { course: { title: { contains: search } } },
            ],
          }
        : undefined,
      include: {
        user: { select: { id: true, name: true, email: true, hospital: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
