import prisma from '../../lib/prisma';

export const adminService = {
  async getAnalytics() {
    const [totalUsers, totalCourses, progressStats, certificatesIssued] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.progress.groupBy({
        by: ['courseId'],
        _count: { id: true },
        where: { completed: true },
      }),
      prisma.certificate.count(),
    ]);

    // Top 5 learners by total watched seconds
    const topLearnersRaw = await prisma.progress.groupBy({
      by: ['userId'],
      _sum: { watchedSeconds: true },
      orderBy: { _sum: { watchedSeconds: 'desc' } },
      take: 5,
    });
    const topLearners = await Promise.all(
      topLearnersRaw.map(async (l) => {
        const user = await prisma.user.findUnique({
          where: { id: l.userId },
          select: { name: true, hospital: true },
        });
        const certCount = await prisma.certificate.count({ where: { userId: l.userId } });
        return {
          userId: l.userId,
          name: user?.name ?? '-',
          hospital: user?.hospital ?? '-',
          totalSeconds: l._sum.watchedSeconds ?? 0,
          certCount,
        };
      }),
    );

    // Course completion rates
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: { _count: { select: { videos: true } } },
    });
    const courseCompletionRates = await Promise.all(
      courses.map(async (c) => {
        const enrolled = await prisma.progress.groupBy({
          by: ['userId'],
          where: { courseId: c.id },
        });
        const completed = await Promise.all(
          enrolled.map(async (e) => {
            const done = await prisma.progress.count({
              where: { userId: e.userId, courseId: c.id, completed: true },
            });
            return done >= c._count.videos;
          }),
        );
        const rate =
          enrolled.length > 0
            ? Math.round((completed.filter(Boolean).length / enrolled.length) * 100)
            : 0;
        return { courseId: c.id, title: c.title, rate };
      }),
    );

    return {
      totalUsers,
      totalCourses,
      certificatesIssued,
      completedProgressCount: progressStats.length,
      topLearners,
      courseCompletionRates,
    };
  },

  async getAllCourses() {
    return prisma.course.findMany({
      include: {
        videos: { orderBy: { order: 'asc' } },
        documents: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async createCourse(data: {
    title: string;
    description: string;
    category?: string;
    thumbnailUrl?: string | null;
    price?: number | null;
    recommendedFor?: string | null;
    inBundle?: boolean;
  }) {
    return prisma.course.create({ data });
  },

  async updateCourse(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      thumbnailUrl?: string | null;
      isActive?: boolean;
      price?: number | null;
      recommendedFor?: string | null;
      inBundle?: boolean;
      requireTrainingRecord?: boolean;
    },
  ) {
    return prisma.course.update({ where: { id }, data });
  },

  async toggleRequireTrainingRecord(courseId: string, required: boolean) {
    return prisma.course.update({
      where: { id: courseId },
      data: { requireTrainingRecord: required },
    });
  },

  async reorderCourses(items: { id: string; order: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.course.update({ where: { id: item.id }, data: { order: item.order } }),
      ),
    );
  },

  async deleteCourse(id: string) {
    return prisma.course.update({ where: { id }, data: { isActive: false } });
  },

  async toggleFeatured(id: string) {
    const course = await prisma.course.findUnique({ where: { id }, select: { isFeatured: true } });
    if (!course) throw Object.assign(new Error('Course not found'), { status: 404 });
    return prisma.course.update({
      where: { id },
      data: { isFeatured: !course.isFeatured },
      select: { id: true, isFeatured: true },
    });
  },

  async addVideo(
    courseId: string,
    data: { title: string; url: string; duration: number; order: number; section?: string },
  ) {
    return prisma.video.create({ data: { courseId, ...data } });
  },

  async updateVideo(
    id: string,
    data: { title?: string; url?: string; duration?: number; order?: number; section?: string },
  ) {
    return prisma.video.update({ where: { id }, data });
  },

  async deleteVideo(id: string) {
    return prisma.video.delete({ where: { id } });
  },

  // Quiz management
  async getQuizQuestions(courseId: string) {
    const questions = await prisma.quizQuestion.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    return questions.map((q) => ({ ...q, options: JSON.parse(q.options) }));
  },

  async createQuizQuestion(
    courseId: string,
    data: { text: string; options: string[]; correctIndex: number; order?: number },
  ) {
    return prisma.quizQuestion.create({
      data: {
        courseId,
        text: data.text,
        options: JSON.stringify(data.options),
        correctIndex: data.correctIndex,
        order: data.order ?? 0,
      },
    });
  },

  async updateQuizQuestion(
    id: string,
    data: { text?: string; options?: string[]; correctIndex?: number; order?: number },
  ) {
    const updateData: any = { ...data };
    if (data.options) updateData.options = JSON.stringify(data.options);
    return prisma.quizQuestion.update({ where: { id }, data: updateData });
  },

  async deleteQuizQuestion(id: string) {
    return prisma.quizQuestion.delete({ where: { id } });
  },

  // Document management
  async addDocument(courseId: string, data: { title: string; url: string; order?: number }) {
    return prisma.courseDocument.create({
      data: { courseId, title: data.title, url: data.url, order: data.order ?? 0 },
    });
  },

  async deleteDocument(id: string) {
    return prisma.courseDocument.delete({ where: { id } });
  },

  // User management
  async getUsers(search?: string) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { hospital: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        cid: true,
        hospital: true,
        position: true,
        createdAt: true,
        _count: { select: { certificates: true, progress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    return prisma.user.update({ where: { id: userId }, data: { role } });
  },

  async toggleUserActive(userId: string, isActive: boolean) {
    return prisma.user.update({ where: { id: userId }, data: { isActive } });
  },

  async updateUserProfile(
    userId: string,
    data: { name?: string; hospital?: string; position?: string },
  ) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  async deleteUser(userId: string) {
    return prisma.user.delete({ where: { id: userId } });
  },

  // Activity Feed — last 30 days, merged & sorted
  async getActivityFeed() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsers, certs, orders] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, name: true, hospital: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.certificate.findMany({
        where: { issuedAt: { gte: since } },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { issuedAt: 'desc' },
        take: 30,
      }),
      prisma.order.findMany({
        where: { status: 'PAID', paidAt: { gte: since } },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: 30,
      }),
    ]);

    const events = [
      ...newUsers.map((u) => ({
        type: 'new_user' as const,
        icon: '👤',
        title: `ผู้ใช้ใหม่สมัครสมาชิก`,
        detail: u.name + (u.hospital ? ` · ${u.hospital}` : ''),
        at: u.createdAt,
      })),
      ...certs.map((c) => ({
        type: 'certificate' as const,
        icon: '🏆',
        title: `รับใบประกาศนียบัตร`,
        detail: `${c.user.name} — ${c.course.title}`,
        at: c.issuedAt,
      })),
      ...orders.map((o) => ({
        type: 'payment' as const,
        icon: '💳',
        title: `ชำระเงินสำเร็จ`,
        detail: `${o.user.name} — ${o.course.title}`,
        at: o.paidAt!,
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 60);

    return events;
  },

  // Announcements
  async listAnnouncements() {
    return prisma.announcement.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async createAnnouncement(data: { title: string; body: string; pinned?: boolean }) {
    return prisma.announcement.create({ data });
  },

  async updateAnnouncement(id: string, data: { title?: string; body?: string; pinned?: boolean }) {
    return prisma.announcement.update({ where: { id }, data });
  },

  async deleteAnnouncement(id: string) {
    return prisma.announcement.delete({ where: { id } });
  },

  // Site Settings (contact info etc.)
  async getSiteSettings() {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            'contact_phone',
            'contact_phone_label',
            'contact_phone_detail',
            'contact_email',
            'contact_email_label',
            'contact_email_detail',
            'contact_line',
            'contact_line_label',
            'contact_line_detail',
            'contact_facebook',
            'contact_facebook_label',
            'contact_facebook_detail',
            'contact_address',
            'cert_signer_name',
            'cert_signer_title',
            'cert_title_en',
            'cert_title_th',
            'cert_intro_text',
            'cert_org_name',
            'cert_course_label',
            'cert_left_bg_from',
            'cert_left_bg_to',
            'categories',
          ],
        },
      },
    });
    const defaults: Record<string, string> = {
      contact_phone: '',
      contact_phone_label: 'โทรศัพท์',
      contact_phone_detail: 'จันทร์-ศุกร์ 9:00-18:00',
      contact_email: '',
      contact_email_label: 'Email',
      contact_email_detail: 'ตอบกลับภายใน 24 ชั่วโมง',
      contact_line: '',
      contact_line_label: 'LINE Official',
      contact_line_detail: 'ตอบเร็ว ตลอด 24 ชั่วโมง',
      contact_facebook: '',
      contact_facebook_label: 'Facebook',
      contact_facebook_detail: 'ติดตามข่าวสารและอัพเดท',
      contact_address: '',
      cert_signer_name: 'ผู้อำนวยการ BGS',
      cert_signer_title: 'Bangkok Global Software Co., Ltd.',
      cert_title_en: 'Certificate of Completion',
      cert_title_th: 'ใบประกาศนียบัตร',
      cert_intro_text: 'ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อรับรองว่า',
      cert_org_name: 'สื่อการสอน',
      cert_course_label: 'ได้ผ่านการศึกษาหลักสูตร',
      cert_left_bg_from: '#2D1B69',
      cert_left_bg_to: '#6D28D9',
      categories: '',
    };
    rows.forEach((r) => {
      defaults[r.key] = r.value;
    });
    return defaults;
  },

  async updateSiteSettings(settings: Record<string, string>) {
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );

    // Sync to help_contacts so Help page reflects the changes
    const contactMap: Record<string, { icon: string; color: string }> = {
      contact_phone: { icon: '📞', color: '#EC4899' },
      contact_email: { icon: '📧', color: '#7B68EE' },
      contact_line: { icon: '💬', color: '#10B981' },
      contact_facebook: { icon: '📘', color: '#3B82F6' },
      contact_address: { icon: '📍', color: '#F59E0B' },
    };
    const channels = Object.entries(contactMap)
      .filter(([k]) => settings[k]?.trim())
      .map(([k, meta], i) => ({
        id: String(i + 1),
        icon: meta.icon,
        label:
          settings[`${k}_label`] ||
          (k === 'contact_phone'
            ? 'โทรศัพท์'
            : k === 'contact_email'
              ? 'Email'
              : k === 'contact_line'
                ? 'LINE Official'
                : k === 'contact_facebook'
                  ? 'Facebook'
                  : 'ที่อยู่'),
        detail: settings[`${k}_detail`] || '',
        value: settings[k],
        color: meta.color,
      }));
    if (channels.length > 0) {
      await prisma.siteSetting.upsert({
        where: { key: 'help_contacts' },
        create: { key: 'help_contacts', value: JSON.stringify(channels) },
        update: { value: JSON.stringify(channels) },
      });
    }
  },
};
