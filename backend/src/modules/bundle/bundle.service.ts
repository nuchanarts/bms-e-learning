import { bundleRepository } from './bundle.repository';
import prisma from '../../lib/prisma';

export const bundleService = {
  listActive() {
    return bundleRepository.findAllActive();
  },

  listAll() {
    return bundleRepository.findAll();
  },

  async create(data: { name: string; description?: string; price: number; courseIds: string[] }) {
    if (!data.courseIds || data.courseIds.length < 2) {
      throw Object.assign(new Error('แพ็กเกจต้องมีคอร์สอย่างน้อย 2 คอร์ส'), { status: 400 });
    }
    await validateBundlePrice(data.courseIds, data.price);
    return bundleRepository.create(data);
  },

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      courseIds?: string[];
      isActive?: boolean;
    },
  ) {
    const bundle = await bundleRepository.findById(id);
    if (!bundle) throw Object.assign(new Error('Bundle not found'), { status: 404 });
    const courseIds = data.courseIds ?? bundle.courses.map((bc) => bc.courseId);
    const price = data.price ?? bundle.price;
    if (data.price !== undefined || data.courseIds !== undefined) {
      await validateBundlePrice(courseIds, price);
    }
    return bundleRepository.update(id, data);
  },

  async deactivate(id: string) {
    const bundle = await bundleRepository.findById(id);
    if (!bundle) throw Object.assign(new Error('Bundle not found'), { status: 404 });
    return bundleRepository.deactivate(id);
  },

  async delete(id: string) {
    const bundle = await bundleRepository.findById(id);
    if (!bundle) throw Object.assign(new Error('Bundle not found'), { status: 404 });
    return bundleRepository.delete(id);
  },

  async purchaseBundle(userId: string, bundleId: string) {
    const bundle = await bundleRepository.findById(bundleId);
    if (!bundle || !bundle.isActive)
      throw Object.assign(new Error('Bundle not found'), { status: 404 });
    const now = new Date();
    await prisma.$transaction(
      bundle.courses.map((bc) =>
        prisma.order.upsert({
          where: { userId_courseId_status: { userId, courseId: bc.courseId, status: 'PAID' } },
          create: { userId, courseId: bc.courseId, amount: 0, status: 'PAID', paidAt: now },
          update: {},
        }),
      ),
    );
    return { ok: true, courseIds: bundle.courses.map((bc) => bc.courseId) };
  },
};

async function validateBundlePrice(courseIds: string[], price: number) {
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { price: true },
  });
  const sumPrices = courses.reduce((sum, c) => sum + (c.price ?? 0), 0);
  if (price >= sumPrices && sumPrices > 0) {
    throw Object.assign(
      new Error(`ราคาแพ็กเกจ (${price}) ต้องต่ำกว่าราคารวมคอร์ส (${sumPrices})`),
      { status: 400 },
    );
  }
}
