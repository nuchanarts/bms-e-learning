/**
 * E2E: Course completion → certificate issuance → admin verification
 *
 * Strategy: use the backend REST API directly (via Playwright `request`) to
 * drive state rather than relying on video playback, so the test is fast and
 * deterministic regardless of browser media support.
 *
 * Flow:
 *  1. Admin creates a test course with 1 video + 1 quiz question
 *  2. Staff user marks the video as >= 80 % watched  (progress API)
 *  3. Staff user submits the quiz with the correct answer
 *  4. Staff user requests their certificate (certificate API)
 *  5. Admin fetches user list and confirms certCount >= 1 for that user
 *  6. Admin analytics shows certificatesIssued >= 1
 */

import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:5501';
const ADMIN_EMAIL = 'admin@bgs.local';
const ADMIN_PASSWORD = 'admin1234';

// ── helpers ────────────────────────────────────────────────────────────────

async function adminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.accessToken as string;
}

async function registerUser(
  request: APIRequestContext,
  email: string,
): Promise<{ id: string; accessToken: string }> {
  const res = await request.post(`${API_BASE}/auth/register`, {
    data: {
      name: 'E2E Staff',
      email,
      password: 'staffpass123',
      hospital: 'รพ.สต.ทดสอบ',
      position: 'เจ้าหน้าที่',
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return { id: body.user.id, accessToken: body.accessToken };
}

// ── test suite ─────────────────────────────────────────────────────────────

test.describe('Completion → Certificate → Admin', () => {
  const stamp = Date.now();
  const userEmail = `e2e_cert_${stamp}@test.local`;

  let token: string; // admin JWT
  let userToken: string; // staff JWT
  let userId: string;
  let courseId: string;
  let videoId: string;
  let questionId: string;
  let correctIndex: number;

  // ── Setup: create course, video, quiz via admin API ──────────────────────
  test.beforeAll(async ({ request }) => {
    token = await adminToken(request);

    // 1. Create course
    const courseRes = await request.post(`${API_BASE}/admin/courses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: `E2E Course ${stamp}`, description: 'Test course for e2e', category: 'E2E' },
    });
    expect(courseRes.status()).toBe(201);
    courseId = (await courseRes.json()).id;

    // 2. Add a video (duration 100 s)
    const videoRes = await request.post(`${API_BASE}/admin/courses/${courseId}/videos`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'E2E Video 1', url: 'https://example.com/video.mp4', duration: 100, order: 1 },
    });
    expect(videoRes.status()).toBe(201);
    videoId = (await videoRes.json()).id;

    // 3. Add a quiz question (correctIndex = 0)
    correctIndex = 0;
    const qRes = await request.post(`${API_BASE}/admin/courses/${courseId}/quiz`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        text: 'E2E Question: which answer is correct?',
        options: ['Correct Answer', 'Wrong A', 'Wrong B', 'Wrong C'],
        correctIndex,
        order: 1,
      },
    });
    expect(qRes.status()).toBe(201);
    questionId = (await qRes.json()).id;

    // 4. Register test staff user
    ({ id: userId, accessToken: userToken } = await registerUser(request, userEmail));
  });

  // ── Step 1: mark video as completed (>= 80 % of 100 s = 80 s watched) ───
  test('staff can mark video progress as completed', async ({ request }) => {
    const res = await request.post(`${API_BASE}/progress`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { videoId, courseId, watchedSeconds: 85, percent: 85 },
    });
    expect(res.status()).toBeLessThan(300);
  });

  // ── Step 2: submit quiz with correct answer ───────────────────────────────
  test('staff can pass the quiz', async ({ request }) => {
    const answers: Record<string, number> = { [questionId]: correctIndex };
    const res = await request.post(`${API_BASE}/quiz/${courseId}/attempt`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { answers },
    });
    expect(res.status()).toBeLessThan(300);
    const body = await res.json();
    expect(body.passed).toBe(true);
    expect(body.score).toBeGreaterThanOrEqual(60);
  });

  // ── Step 3: request certificate ──────────────────────────────────────────
  test('certificate is issued after course completion + quiz pass', async ({ request }) => {
    const res = await request.get(`${API_BASE}/certificates/${courseId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(200);
    const cert = await res.json();
    expect(cert).toHaveProperty('id');
    expect(cert).toHaveProperty('courseId', courseId);
    expect(cert).toHaveProperty('userId', userId);
  });

  // ── Step 4: admin sees certCount >= 1 in user registry ───────────────────
  test('admin user registry shows certCount >= 1 for the staff user', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/users?search=${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const users: Array<{ id: string; email: string; certCount: number }> = await res.json();
    const found = users.find((u) => u.email === userEmail);
    expect(found).toBeDefined();
    expect(found!.certCount).toBeGreaterThanOrEqual(1);
  });

  // ── Step 5: admin analytics reflect the new certificate ──────────────────
  test('admin analytics certificatesIssued >= 1', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const analytics = await res.json();
    expect(analytics.certificatesIssued).toBeGreaterThanOrEqual(1);
  });
});
