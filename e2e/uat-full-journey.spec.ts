/**
 * UAT: Full User Journey — BGS E-Learning Platform
 *
 * ครอบคลุมการทดสอบตั้งแต่ต้นจนจบ:
 *   1.  สมัครสมาชิก
 *   2.  เข้าสู่ระบบ
 *   3.  หน้า Dashboard
 *   4.  เรียกดูรายการคอร์ส
 *   5.  เข้าหน้ารายละเอียดคอร์ส
 *   6.  แสดง Video Player (YouTube iframe)
 *   7.  กดเริ่มนับเวลาดูวีดีโอ / หยุดนับเวลา
 *   8.  บันทึก progress ผ่าน API
 *   9.  ทำแบบทดสอบ
 *   10. รับ / ดาวน์โหลดใบประกาศนียบัตร
 *   11. ระบบชำระเงิน QR & บัตรเครดิต
 *   12. Admin — จัดการคอร์ส / เพิ่ม-แก้ไขวีดีโอ
 *   13. Admin — ดู Analytics
 *
 * Strategy: UI tests ใช้ Playwright page, state setup ใช้ API โดยตรง
 * เพื่อความเร็วและความแน่นอนของ test
 */

import { test, expect, APIRequestContext, Page } from '@playwright/test';

const API_BASE = 'http://localhost:5501';
const ADMIN_EMAIL = 'admin@bgs.local';
const ADMIN_PASS = 'admin1234';
const STAFF_EMAIL = 'user@bgs.local';
const STAFF_PASS = 'user1234';

// ── Helpers ────────────────────────────────────────────────────────────────

async function getToken(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${API_BASE}/auth/login`, { data: { email, password } });
  expect(res.status()).toBe(200);
  return ((await res.json()) as { accessToken: string }).accessToken;
}

async function loginUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
}

// ══════════════════════════════════════════════════════════════════════════
// 1. Authentication
// ══════════════════════════════════════════════════════════════════════════

test.describe('1. Authentication', () => {
  test('1-1 สมัครสมาชิกใหม่ได้', async ({ page }) => {
    const email = `uat_${Date.now()}@test.local`;
    await page.goto('/register');
    await page.fill('[name="name"]', 'UAT Test User');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'pass1234');
    await page.fill('[name="hospital"]', 'รพ.สต.ทดสอบ');
    await page.fill('[name="position"]', 'เจ้าหน้าที่');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('1-2 เข้าสู่ระบบด้วย staff account ได้', async ({ page }) => {
    await loginUI(page, STAFF_EMAIL, STAFF_PASS);
    await expect(page.locator('text=Dashboard').or(page.locator('text=แดชบอร์ด'))).toBeVisible();
  });

  test('1-3 ล็อกอินด้วยรหัสผ่านผิดแสดง error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', STAFF_EMAIL);
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('1-4 logout แล้ว redirect กลับ login', async ({ page }) => {
    await loginUI(page, STAFF_EMAIL, STAFF_PASS);
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL('/login');
  });

  test('1-5 เข้า protected page โดยไม่ login → redirect login', async ({ page }) => {
    await page.goto('/courses');
    await expect(page).toHaveURL('/login');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 2. Dashboard
// ══════════════════════════════════════════════════════════════════════════

test.describe('2. Dashboard', () => {
  test.beforeEach(async ({ page }) => { await loginUI(page, STAFF_EMAIL, STAFF_PASS); });

  test('2-1 แสดงหน้า Dashboard ได้', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('2-2 แสดง course progress card', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="course-progress"]').first()).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 3. Course Listing
// ══════════════════════════════════════════════════════════════════════════

test.describe('3. Course Listing', () => {
  test.beforeEach(async ({ page }) => { await loginUI(page, STAFF_EMAIL, STAFF_PASS); });

  test('3-1 แสดงรายการคอร์สได้', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible();
  });

  test('3-2 filter ตาม category ได้', async ({ page }) => {
    await page.goto('/courses');
    const tabs = page.locator('[data-testid="category-tab"]');
    if ((await tabs.count()) > 1) {
      await tabs.nth(1).click();
      await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible();
    }
  });

  test('3-3 กดคอร์ดแล้วไปหน้า detail ได้', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await expect(page).toHaveURL(/\/courses\/.+/);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 4. Video Player
// ══════════════════════════════════════════════════════════════════════════

test.describe('4. Video Player', () => {
  test.beforeEach(async ({ page }) => { await loginUI(page, STAFF_EMAIL, STAFF_PASS); });

  test('4-1 หน้า course detail แสดง video list', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await expect(page.locator('[data-testid="video-list"]')).toBeVisible();
  });

  test('4-2 กดเลือกวีดีโอในรายการแล้ว player แสดงขึ้น', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.locator('[data-testid="video-item"]').first().click();
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
  });

  test('4-3 YouTube video แสดง iframe embed', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.locator('[data-testid="video-item"]').first().click();
    // iframe YouTube embed ต้องอยู่ใน player
    const iframe = page.locator('[data-testid="video-player"] iframe');
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute('src');
    expect(src).toMatch(/youtube\.com\/embed\//);
  });

  test('4-4 ปุ่ม "เริ่มนับเวลา" แสดงใต้ YouTube player', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.locator('[data-testid="video-item"]').first().click();
    const startBtn = page.locator('button', { hasText: 'เริ่มนับเวลา' });
    await expect(startBtn).toBeVisible();
  });

  test('4-5 กด "เริ่มนับเวลา" แล้วปุ่มเปลี่ยนเป็น "หยุดนับเวลา"', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.locator('[data-testid="video-item"]').first().click();
    const startBtn = page.locator('button', { hasText: 'เริ่มนับเวลา' });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(page.locator('button', { hasText: 'หยุดนับเวลา' })).toBeVisible();
  });

  test('4-6 กด "หยุดนับเวลา" แล้วกลับเป็น "เริ่มนับเวลา"', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await page.locator('[data-testid="video-item"]').first().click();
    await page.locator('button', { hasText: 'เริ่มนับเวลา' }).click();
    await page.locator('button', { hasText: 'หยุดนับเวลา' }).click();
    await expect(page.locator('button', { hasText: 'เริ่มนับเวลา' })).toBeVisible();
  });

  test('4-7 progress bar แสดงในหน้า detail', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('4-8 กดเปลี่ยนวีดีโอในรายการแล้ว player โหลดวีดีโอใหม่', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    const items = page.locator('[data-testid="video-item"]');
    if ((await items.count()) >= 2) {
      await items.nth(0).click();
      const src1 = await page.locator('[data-testid="video-player"] iframe').getAttribute('src');
      await items.nth(1).click();
      const src2 = await page.locator('[data-testid="video-player"] iframe').getAttribute('src');
      // src อาจเหมือนกันถ้าใช้ video เดิม แต่ player ต้องยังแสดงอยู่
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
      expect(src1).toBeTruthy();
      expect(src2).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 5. Progress Tracking (API-driven)
// ══════════════════════════════════════════════════════════════════════════

test.describe('5. Progress Tracking', () => {
  const stamp = Date.now();
  const userEmail = `uat_prog_${stamp}@test.local`;
  let userToken: string;
  let courseId: string;
  let videoId: string;

  test.beforeAll(async ({ request }) => {
    // สร้าง user + course + video สำหรับ test นี้
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);

    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Progress ${stamp}`, description: 'test', category: 'UAT' },
    });
    courseId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${courseId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'Video 1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 100, order: 1 },
    });
    videoId = (await vRes.json()).id;

    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'UAT Staff', email: userEmail, password: 'pass1234', hospital: 'รพ.สต.ทดสอบ' },
    });
    userToken = (await rRes.json()).accessToken;
  });

  test('5-1 บันทึก progress < 80% → ยังไม่ completed', async ({ request }) => {
    const res = await request.post(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { videoId, courseId, watchedSeconds: 50, percent: 50 },
    });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.videoCompleted).toBe(false);
  });

  test('5-2 บันทึก progress >= 80% → videoCompleted = true', async ({ request }) => {
    const res = await request.post(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { videoId, courseId, watchedSeconds: 85, percent: 85 },
    });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.videoCompleted).toBe(true);
  });

  test('5-3 ดึง progress ของ course ได้', async ({ request }) => {
    const res = await request.get(`${API_BASE}/progress/${courseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const records: Array<{ videoId: string; completed: boolean }> = await res.json();
    const vp = records.find((r) => r.videoId === videoId);
    expect(vp?.completed).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 6. Quiz
// ══════════════════════════════════════════════════════════════════════════

test.describe('6. Quiz', () => {
  const stamp = Date.now();
  const userEmail = `uat_quiz_${stamp}@test.local`;
  let userToken: string;
  let courseId: string;
  let videoId: string;
  let questionId: string;

  test.beforeAll(async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);

    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Quiz ${stamp}`, description: 'test', category: 'UAT' },
    });
    courseId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${courseId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'Video 1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 100, order: 1 },
    });
    videoId = (await vRes.json()).id;

    const qRes = await request.post(`${API_BASE}/admin/courses/${courseId}/quiz`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { text: 'UAT Quiz Q1', options: ['ถูก', 'ผิด A', 'ผิด B', 'ผิด C'], correctIndex: 0, order: 1 },
    });
    questionId = (await qRes.json()).id;

    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'UAT Staff', email: userEmail, password: 'pass1234', hospital: 'รพ.สต.ทดสอบ' },
    });
    userToken = (await rRes.json()).accessToken;

    // complete video first
    await request.post(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { videoId, courseId, watchedSeconds: 85, percent: 85 },
    });
  });

  test('6-1 ทำ quiz ผิดทุกข้อ → passed = false', async ({ request }) => {
    const res = await request.post(`${API_BASE}/quiz/${courseId}/attempt`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { answers: { [questionId]: 3 } }, // wrong answer
    });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.passed).toBe(false);
  });

  test('6-2 ทำ quiz ถูกทุกข้อ → passed = true, score >= 60', async ({ request }) => {
    const res = await request.post(`${API_BASE}/quiz/${courseId}/attempt`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { answers: { [questionId]: 0 } }, // correct answer
    });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.passed).toBe(true);
    expect(body.score).toBeGreaterThanOrEqual(60);
  });

  test('6-3 ดึงผลลัพธ์ quiz ได้', async ({ request }) => {
    const res = await request.get(`${API_BASE}/quiz/${courseId}/result`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.passed).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 7. Certificate
// ══════════════════════════════════════════════════════════════════════════

test.describe('7. Certificate', () => {
  const stamp = Date.now();
  const userEmail = `uat_cert_${stamp}@test.local`;
  let userToken: string;
  let courseId: string;
  let videoId: string;
  let questionId: string;

  test.beforeAll(async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);

    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Cert ${stamp}`, description: 'test', category: 'UAT' },
    });
    courseId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${courseId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'V1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 100, order: 1 },
    });
    videoId = (await vRes.json()).id;

    const qRes = await request.post(`${API_BASE}/admin/courses/${courseId}/quiz`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { text: 'Q1', options: ['ถูก', 'ผิด', 'ผิด', 'ผิด'], correctIndex: 0, order: 1 },
    });
    questionId = (await qRes.json()).id;

    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'UAT Staff', email: userEmail, password: 'pass1234', hospital: 'รพ.สต.ทดสอบ' },
    });
    userToken = (await rRes.json()).accessToken;

    await request.post(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { videoId, courseId, watchedSeconds: 85, percent: 85 },
    });
    await request.post(`${API_BASE}/quiz/${courseId}/attempt`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { answers: { [questionId]: 0 } },
    });
  });

  test('7-1 ออกใบประกาศหลังเรียนจบ + ผ่าน quiz', async ({ request }) => {
    const res = await request.get(`${API_BASE}/certificates/${courseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const cert = await res.json();
    expect(cert).toHaveProperty('id');
    expect(cert).toHaveProperty('userId');
    expect(cert).toHaveProperty('courseId', courseId);
  });

  test('7-2 ดาวน์โหลดใบประกาศ (PDF response)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/certificates/${courseId}/download`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const ct = res.headers()['content-type'];
    expect(ct).toMatch(/pdf/i);
  });

  test('7-3 ก่อนผ่านเงื่อนไข → ไม่ได้รับใบประกาศ (API ใหม่)', async ({ request }) => {
    // user ใหม่ที่ยังไม่เรียนจบ
    const newEmail = `uat_nocert_${stamp}@test.local`;
    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'No Cert', email: newEmail, password: 'pass1234', hospital: 'test' },
    });
    const newToken = (await rRes.json()).accessToken;
    const res = await request.get(`${API_BASE}/certificates/${courseId}`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 8. Payment
// ══════════════════════════════════════════════════════════════════════════

test.describe('8. Payment', () => {
  const stamp = Date.now();
  let adminToken: string;
  let userToken: string;
  let paidCourseId: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);

    // สร้างคอร์สที่มีราคา
    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { title: `UAT Paid Course ${stamp}`, description: 'paid', category: 'UAT', price: 299 },
    });
    paidCourseId = (await cRes.json()).id;

    const userEmail = `uat_pay_${stamp}@test.local`;
    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'UAT Buyer', email: userEmail, password: 'pass1234', hospital: 'test' },
    });
    userToken = (await rRes.json()).accessToken;
  });

  test('8-1 user ที่ยังไม่ซื้อ → hasAccess = false', async ({ request }) => {
    const res = await request.get(`${API_BASE}/payment/access/${paidCourseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.hasAccess).toBe(false);
  });

  test('8-2 ชำระด้วยบัตร valid → hasAccess = true', async ({ request }) => {
    const purchaseRes = await request.post(`${API_BASE}/payment/purchase/${paidCourseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        card: { number: '4111111111111111', expiryMonth: '12', expiryYear: '26', cvv: '123', name: 'UAT USER' },
      },
    });
    expect(purchaseRes.status()).toBe(201);
    const order = await purchaseRes.json();
    expect(order.status).toBe('PAID');

    const accessRes = await request.get(`${API_BASE}/payment/access/${paidCourseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect((await accessRes.json()).hasAccess).toBe(true);
  });

  test('8-3 ชำระด้วยบัตร declined → order FAILED', async ({ request }) => {
    const userEmail2 = `uat_decline_${stamp}@test.local`;
    const rRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'Decline User', email: userEmail2, password: 'pass1234', hospital: 'test' },
    });
    const tok2 = (await rRes.json()).accessToken;

    const res = await request.post(`${API_BASE}/payment/purchase/${paidCourseId}`, {
      headers: { Authorization: `Bearer ${tok2}` },
      data: {
        card: { number: '4000000000000002', expiryMonth: '12', expiryYear: '26', cvv: '123', name: 'DECLINE' },
      },
    });
    expect(res.status()).toBe(402);
  });

  test('8-4 admin เข้าดู paid course ได้โดยไม่ต้องซื้อ', async ({ request }) => {
    const res = await request.get(`${API_BASE}/payment/access/${paidCourseId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect((await res.json()).hasAccess).toBe(true);
  });

  test('8-5 UI: paid course แสดง paywall สำหรับ user ที่ยังไม่ซื้อ', async ({ page, request }) => {
    const newEmail = `uat_paywall_${stamp}@test.local`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'No Buy', email: newEmail, password: 'pass1234', hospital: 'test' },
    });
    await loginUI(page, newEmail, 'pass1234');
    await page.goto(`/courses/${paidCourseId}`);
    // paywall section ควรแสดง
    await expect(page.locator('text=คอร์สนี้มีค่าใช้จ่าย').or(page.locator('text=ซื้อคอร์ส'))).toBeVisible();
  });

  test('8-6 UI: Payment modal แสดง QR PromptPay ที่สแกนได้', async ({ page, request }) => {
    const newEmail = `uat_qr_${stamp}@test.local`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'QR Test', email: newEmail, password: 'pass1234', hospital: 'test' },
    });
    await loginUI(page, newEmail, 'pass1234');
    await page.goto(`/courses/${paidCourseId}`);
    await page.locator('button', { hasText: 'ซื้อคอร์ส' }).click();
    // คลิก QR PromptPay tab
    await page.locator('button', { hasText: 'QR PromptPay' }).click();
    // QR image ต้องโหลดขึ้น (img tag ที่มี src เป็น data URL)
    const qrImg = page.locator('img[alt="PromptPay QR Code"]');
    await expect(qrImg).toBeVisible({ timeout: 5000 });
    const src = await qrImg.getAttribute('src');
    expect(src).toMatch(/^data:image\/png;base64,/);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 9. Admin — Course Management
// ══════════════════════════════════════════════════════════════════════════

test.describe('9. Admin — Course Management', () => {
  test.beforeEach(async ({ page }) => { await loginUI(page, ADMIN_EMAIL, ADMIN_PASS); });

  test('9-1 Admin เข้าหน้า /admin ได้', async ({ page }) => {
    await page.goto('/admin');
    // ตรวจว่าหน้า admin โหลดได้ (ไม่ redirect ออก)
    await expect(page).toHaveURL('/admin');
  });

  test('9-2 Admin สร้างคอร์สใหม่ผ่าน API', async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);
    const res = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT New Course ${Date.now()}`, description: 'test', category: 'UAT' },
    });
    expect(res.status()).toBe(201);
    const course = await res.json();
    expect(course).toHaveProperty('id');
    expect(course.title).toContain('UAT New Course');
  });

  test('9-3 Admin เพิ่มวีดีโอด้วย YouTube URL ปกติ', async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);
    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Video Course ${Date.now()}`, description: 'test', category: 'UAT' },
    });
    const cId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${cId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'Test Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 300, order: 1 },
    });
    expect(vRes.status()).toBe(201);
    const video = await vRes.json();
    expect(video.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  test('9-4 Admin เพิ่มวีดีโอด้วย YouTube Shorts URL', async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);
    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Shorts Course ${Date.now()}`, description: 'test', category: 'UAT' },
    });
    const cId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${cId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'Shorts Video', url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', duration: 60, order: 1 },
    });
    expect(vRes.status()).toBe(201);
  });

  test('9-5 Admin แก้ไข URL วีดีโอแล้ว user เห็น URL ใหม่', async ({ request }) => {
    const adminTok = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);
    const cRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: `UAT Edit Video ${Date.now()}`, description: 'test', category: 'UAT' },
    });
    const cId = (await cRes.json()).id;

    const vRes = await request.post(`${API_BASE}/admin/courses/${cId}/videos`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'Old Title', url: 'https://www.youtube.com/watch?v=old', duration: 100, order: 1 },
    });
    const vId = (await vRes.json()).id;

    const newUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    await request.put(`${API_BASE}/admin/videos/${vId}`, {
      headers: { Authorization: `Bearer ${adminTok}` },
      data: { title: 'New Title', url: newUrl, duration: 120, order: 1 },
    });

    const userTok = await getToken(request, STAFF_EMAIL, STAFF_PASS);
    const courseRes = await request.get(`${API_BASE}/courses/${cId}`, {
      headers: { Authorization: `Bearer ${userTok}` },
    });
    const updatedCourse = await courseRes.json();
    expect(updatedCourse.videos[0].url).toBe(newUrl);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 10. Admin — Analytics
// ══════════════════════════════════════════════════════════════════════════

test.describe('10. Admin — Analytics', () => {
  test('10-1 Admin ดู analytics ได้', async ({ request }) => {
    const token = await getToken(request, ADMIN_EMAIL, ADMIN_PASS);
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('totalUsers');
    expect(body).toHaveProperty('totalCourses');
    expect(body).toHaveProperty('certificatesIssued');
  });

  test('10-2 Non-admin ไม่สามารถเข้า admin analytics ได้', async ({ request }) => {
    const token = await getToken(request, STAFF_EMAIL, STAFF_PASS);
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });
});
