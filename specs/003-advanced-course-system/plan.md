# Implementation Plan: Advanced Course System

**Branch**: `003-advanced-course-system` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)

## Summary

7 feature groups ใหม่สำหรับระบบ E-Learning:
1. Role CUSTOMER/STAFF/ADMIN (แทน USER/ADMIN)
2. Intro video + Target positions + Instructor overlay
3. Pricing: bundle + per-section
4. Course expiry + email notification
5. Watermark + anti-screen-record
6. Post-test gated by 100% progress + registration
7. Hidden stats (admin only): viewers, watch hours

## Technical Context

- Stack: TypeScript, Express, Prisma, MySQL, React, Vite, Tailwind
- Email: Nodemailer (SMTP)
- Cron: node-cron
- Video: YouTube iframe (existing) + CSS overlay watermark
- DB: MySQL via Prisma migration

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Backend as Source of Truth | ✅ | ทุก rule (expiry check, 100% gate, score) ใน service |
| TDD | ✅ | tests ก่อน service |
| Reuse First | ✅ | ต่อยอด Quiz, Order, Progress ที่มีอยู่ |
| Centralize Business Logic | ✅ | enrollment.service, posttest.service |
| 3-layer architecture | ✅ | controller/service/repository ทุก module |

## Phase 1: Database + Role Migration

### 1.1 Prisma Schema Changes
- Role enum: `USER → CUSTOMER/STAFF` (migration + data fix)
- User: `+ positionCustom`
- Course: `+ introVideoUrl, targetPositions, pricingType, bundlePrice, expiryDays, passingScore, totalViewers, totalWatchHours`
- Video: `+ isIntro, instructorName, instructorTitle, instructorAvatar, sectionPrice`
- Order: `+ expiresAt, expiryNotified7d, expiryNotified1d, purchasedSections`
- QuizAttempt: remove `@@unique([userId,courseId])` → add `attemptNo, takenAt`
- New: `PostTestRegistration`

### 1.2 Data Migration
```sql
UPDATE User SET role = 'STAFF' WHERE role = 'USER';
UPDATE QuizAttempt SET attemptNo = 1, takenAt = attemptedAt;
```

---

## Phase 2: Backend Services

### 2.1 enrollment.service.ts (NEW)
- `checkAccess(userId, courseId)` → `{ hasAccess, reason, expiresAt, daysRemaining }`
- `getPurchasedSections(userId, courseId)` → string[]
- `setExpiry(orderId, expiryDays)`

### 2.2 expiry.service.ts (NEW — cron)
- `sendExpiryWarnings()` — query orders expiring in 7d + 1d, send email, mark flag
- `checkExpiredAccess(userId, courseId)` → boolean

### 2.3 posttest.service.ts (UPDATE existing quiz)
- `checkEligibility(userId, courseId)` → `{ eligible, reason, progressPercent }`
- `register(userId, courseId)` → PostTestRegistration
- `submit(userId, courseId, answers)` → `{ score, passed, attemptNo, certificateId }`
- `getAttemptsToday(userId, courseId)` → number (max 3)
- `getRegistrationList(courseId)` → admin list

### 2.4 course.service.ts (UPDATE)
- `incrementViewers(courseId)` on first access per user
- `addWatchHours(courseId, seconds)` on progress save
- Guard `totalViewers/totalWatchHours` in response (ADMIN only)

### 2.5 email.service.ts (NEW/UPDATE)
- `sendExpiryWarning(user, course, daysLeft)` — HTML template

---

## Phase 3: Frontend Components

### 3.1 VideoPlayer.tsx (UPDATE)
- `WatermarkOverlay` component: ชื่อ + วันเวลา, random position ทุก 15s
- Screen capture detection: override `getDisplayMedia`
- Instructor overlay: แสดง 5 วินาทีแรก
- Skip watermark if `video.isIntro`

### 3.2 CourseDetailPage.tsx (UPDATE)
- แสดง intro video ก่อน playlist
- แสดง instructor ต่อแต่ละบท
- แสดง `daysRemaining` badge (สี green/orange/red)
- Post-test panel: lock ถ้า < 100%, ปุ่ม register + start

### 3.3 CourseListPage.tsx (UPDATE)
- แสดง targetPositions badges
- แสดง pricing (bundle / per-section)
- กรองตาม position

### 3.4 RegisterPage.tsx (UPDATE)
- Role selector: CUSTOMER / STAFF
- Position dropdown + "อื่นๆ" checkbox → text input

### 3.5 AdminPage.tsx (UPDATE)
- Course form: intro video URL, target positions, pricing type, expiry days, passing score
- Video form: isIntro, instructor fields, section price
- Post-test registration list per course
- Stats: totalViewers, totalWatchHours (hidden from non-admin)

### 3.6 DashboardPage.tsx (UPDATE)
- แสดง expiry warnings สำหรับ courses ที่ใกล้หมดอายุ

---

## Phase 4: Cron + Email

### 4.1 cron setup (server startup)
```typescript
// node-cron: every day at 08:00
cron.schedule('0 8 * * *', () => expiryService.sendExpiryWarnings());
```

### 4.2 Email templates
- `expiry-7day.html`: แจ้ง 7 วันก่อนหมดอายุ + ลิงก์ต่ออายุ
- `expiry-1day.html`: แจ้ง urgent 1 วันก่อนหมดอายุ

---

## Files to Create/Modify

### Backend (new)
```
backend/src/modules/enrollment/
  enrollment.service.ts
  enrollment.controller.ts
  enrollment.repository.ts

backend/src/modules/expiry/
  expiry.service.ts
  expiry.cron.ts

backend/src/modules/email/
  email.service.ts
  templates/expiry-7day.html
  templates/expiry-1day.html
```

### Backend (modify)
```
backend/prisma/schema.prisma
backend/src/modules/quiz/quiz.service.ts   → posttest logic
backend/src/modules/course/course.service.ts
backend/src/modules/course/course.repository.ts
backend/src/modules/auth/auth.service.ts   → role CUSTOMER/STAFF
```

### Frontend (modify)
```
frontend/src/components/ui/VideoPlayer.tsx
frontend/src/pages/courses/CourseDetailPage.tsx
frontend/src/pages/courses/CourseListPage.tsx
frontend/src/pages/auth/RegisterPage.tsx
frontend/src/pages/admin/AdminPage.tsx
frontend/src/pages/DashboardPage.tsx
frontend/src/contexts/AuthContext.tsx      → role types
```
