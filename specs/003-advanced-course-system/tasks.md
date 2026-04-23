# Tasks: Advanced Course System

**Branch**: `003-advanced-course-system` | **Created**: 2026-04-01
**Total Tasks**: 52 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1 — Setup & DB Migration

> เตรียม schema ใหม่ทั้งหมด — blocking ทุก phase

- [ ] T001 Update `backend/prisma/schema.prisma`: เปลี่ยน Role enum USER→CUSTOMER/STAFF, เพิ่ม CUSTOMER
- [ ] T002 Update `backend/prisma/schema.prisma`: เพิ่ม fields ใน Course (introVideoUrl, targetPositions, pricingType, bundlePrice, expiryDays, passingScore, totalViewers, totalWatchHours)
- [ ] T003 Update `backend/prisma/schema.prisma`: เพิ่ม fields ใน Video (isIntro, instructorName, instructorTitle, instructorAvatar, sectionPrice)
- [ ] T004 Update `backend/prisma/schema.prisma`: เพิ่ม fields ใน Order (expiresAt, expiryNotified7d, expiryNotified1d, purchasedSections), ลบ @@unique([userId,courseId,status])
- [ ] T005 Update `backend/prisma/schema.prisma`: แก้ QuizAttempt — ลบ @@unique([userId,courseId]), เพิ่ม attemptNo, takenAt, เพิ่ม @@index([userId,courseId,takenAt])
- [ ] T006 Update `backend/prisma/schema.prisma`: เพิ่ม model PostTestRegistration ใหม่ (userId, courseId, registeredAt)
- [ ] T007 Update `backend/prisma/schema.prisma`: เพิ่ม field positionCustom ใน User
- [ ] T008 รัน `npx prisma migrate dev --name advanced-course-system` ใน `backend/`
- [ ] T009 สร้าง seed/migration script `backend/prisma/migrations/data-fix.sql`: `UPDATE User SET role='STAFF' WHERE role='USER'`
- [ ] T010 ติดตั้ง `node-cron` และ `nodemailer` ใน `backend/`: `npm install node-cron nodemailer @types/node-cron @types/nodemailer`

---

## Phase 2 — Foundational: Role + Auth Update

> [US1] ต้องเสร็จก่อน — ทุก feature ขึ้นอยู่กับ role ใหม่

- [ ] T011 [US1] Update `backend/src/modules/auth/auth.service.ts`: เปลี่ยน role default เป็น CUSTOMER, รองรับ STAFF ในการสมัคร
- [ ] T012 [US1] Update `frontend/src/contexts/AuthContext.tsx`: เพิ่ม type `'CUSTOMER' | 'STAFF' | 'ADMIN'` แทน `'USER' | 'ADMIN'`
- [ ] T013 [US1] Update `frontend/src/pages/auth/RegisterPage.tsx`: เพิ่ม role selector (CUSTOMER / STAFF), position dropdown (POSITIONS list + อื่นๆ → text input)
- [ ] T014 [US1] Update `frontend/src/pages/auth/RegisterPage.tsx`: เพิ่ม field positionCustom ปรากฏเมื่อ position = "อื่นๆ"
- [ ] T015 [P] [US1] Update `backend/src/modules/auth/auth.controller.ts`: รับ `role` และ `positionCustom` ใน register payload
- [ ] T016 [P] [US1] Update `frontend/src/components/layout/AppLayout.tsx`: ปรับ sidebar — CUSTOMER เห็น Cart, STAFF/ADMIN ไม่แสดง Cart

---

## Phase 3 — Enrollment + Course Expiry [US4]

> Course access control + expiry logic

- [ ] T017 [US4] สร้าง `backend/src/modules/enrollment/enrollment.repository.ts`: query getEnrollment, getActiveEnrollments, markNotified
- [ ] T018 [US4] สร้าง `backend/src/modules/enrollment/enrollment.service.ts`: `checkAccess(userId, courseId)` → `{hasAccess, reason, expiresAt, daysRemaining}`, `setExpiry(orderId, expiryDays)`
- [ ] T019 [US4] สร้าง `backend/src/modules/enrollment/enrollment.controller.ts`: GET `/api/enrollments/my`, GET `/api/courses/:id/access-check`
- [ ] T020 [US4] Update `backend/src/modules/payment/payment.service.ts`: หลัง order PAID → คำนวณ `expiresAt = paidAt + course.expiryDays days` (skip ถ้า expiryDays=0)
- [ ] T021 [P] [US4] สร้าง `backend/src/modules/email/email.service.ts`: `sendExpiryWarning(user, course, daysLeft)` ใช้ nodemailer + HTML template
- [ ] T022 [P] [US4] สร้าง `backend/src/modules/email/templates/expiry-7day.html`: HTML email template วันหมดอายุ 7 วัน
- [ ] T023 [P] [US4] สร้าง `backend/src/modules/email/templates/expiry-1day.html`: HTML email template วันหมดอายุ 1 วัน (urgent)
- [ ] T024 [US4] สร้าง `backend/src/modules/expiry/expiry.service.ts`: `sendExpiryWarnings()` — query orders ที่จะหมดใน 7d/1d, ส่ง email, mark flags
- [ ] T025 [US4] สร้าง `backend/src/modules/expiry/expiry.cron.ts`: `cron.schedule('0 8 * * *', ...)` เรียก expiryService.sendExpiryWarnings()
- [ ] T026 [US4] Update `backend/src/app.ts` หรือ `server.ts`: import และเริ่ม expiry.cron ตอน startup
- [ ] T027 [US4] Update `frontend/src/pages/courses/CourseDetailPage.tsx`: แสดง `daysRemaining` badge — สีเขียว (>30), ส้ม (≤30), แดง (≤7)
- [ ] T028 [US4] Update `frontend/src/pages/DashboardPage.tsx`: แสดง warning cards สำหรับ enrolled courses ที่ใกล้หมดอายุ

---

## Phase 4 — Intro Video + Target Positions + Instructor [US2, US7]

- [ ] T029 [P] [US2] Update `backend/src/modules/course/course.service.ts`: include `introVideoUrl`, `targetPositions` ใน response, guard `totalViewers/totalWatchHours` เฉพาะ ADMIN
- [ ] T030 [P] [US2] Update `backend/src/modules/admin/admin.controller.ts` หรือ course admin endpoint: รับ `introVideoUrl`, `targetPositions[]`, `pricingType`, `bundlePrice`, `expiryDays`, `passingScore`
- [ ] T031 [US2] Update `frontend/src/pages/courses/CourseListPage.tsx`: แสดง targetPositions badges ต่อคอร์ส, ปุ่ม filter ตาม position
- [ ] T032 [US2] Update `frontend/src/pages/courses/CourseDetailPage.tsx`: เพิ่ม intro video section ด้านบนก่อน playlist (ไม่มีลายน้ำ)
- [ ] T033 [US7] Update `backend/src/modules/course/course.service.ts`: include `instructorName`, `instructorTitle`, `instructorAvatar` ใน video response
- [ ] T034 [US7] Update `backend/src/modules/admin/admin.controller.ts` video edit: รับ `isIntro`, `instructorName`, `instructorTitle`, `instructorAvatar`, `sectionPrice`
- [ ] T035 [P] [US7] Update `frontend/src/pages/courses/CourseDetailPage.tsx`: แสดง instructorName + instructorTitle ต่อแต่ละ video row ใน playlist
- [ ] T036 [P] [US7] Update `frontend/src/pages/admin/AdminPage.tsx`: เพิ่ม instructor fields ในฟอร์ม edit video

---

## Phase 5 — Pricing: Bundle + Per-Section [US3]

- [ ] T037 [US3] Update `backend/src/modules/course/course.service.ts`: return `pricingType`, `bundlePrice`, per-section prices per video group
- [ ] T038 [US3] Update `backend/src/modules/payment/payment.service.ts`: รองรับ `purchasedSections[]` ใน order — validate ไม่ซ้ำ sections เดิม
- [ ] T039 [US3] Update `frontend/src/pages/courses/CourseDetailPage.tsx`: per-section pricing UI — checkbox เลือก section, คำนวณ subtotal
- [ ] T040 [P] [US3] Update `frontend/src/pages/courses/CourseListPage.tsx`: แสดงราคา bundle หรือ "ราคาเริ่มต้น X บาท" สำหรับ per-section
- [ ] T041 [P] [US3] Update `frontend/src/pages/admin/AdminPage.tsx`: เพิ่ม pricingType selector + bundlePrice / sectionPrice ต่อ section ในฟอร์ม course

---

## Phase 6 — Watermark + Anti-Screen-Record [US5]

- [ ] T042 [US5] Update `frontend/src/components/ui/VideoPlayer.tsx`: เพิ่ม `<WatermarkOverlay>` component — แสดง `userName · dateTime`, random position, setInterval 15s
- [ ] T043 [US5] Update `frontend/src/components/ui/VideoPlayer.tsx`: เพิ่ม screen capture detection — override `navigator.mediaDevices.getDisplayMedia` ให้ pause video + แสดง modal
- [ ] T044 [US5] Update `frontend/src/components/ui/VideoPlayer.tsx`: ข้อความ "ห้ามบันทึกหน้าจอ" watermark โปร่งแสง (opacity 15%) fixed บน video
- [ ] T045 [US5] Update `frontend/src/components/ui/VideoPlayer.tsx`: skip watermark เมื่อ `video.isIntro === true`
- [ ] T046 [P] [US5] Update `frontend/src/components/ui/VideoPlayer.tsx`: Instructor overlay — แสดง instructorName + instructorTitle ช่วง 0-5 วินาทีแรก fade out

---

## Phase 7 — Post-Test Gated + Registration [US6]

- [ ] T047 [US6] Update `backend/src/modules/quiz/quiz.service.ts`: เพิ่ม `checkPostTestEligibility(userId, courseId)` — ตรวจ progress = 100% ก่อนอนุญาต
- [ ] T048 [US6] Update `backend/src/modules/quiz/quiz.service.ts`: เพิ่ม `registerPostTest(userId, courseId)` → สร้าง PostTestRegistration record
- [ ] T049 [US6] Update `backend/src/modules/quiz/quiz.service.ts`: แก้ `submitQuiz` — เพิ่ม `attemptNo` (auto-increment ต่อ user+course), limit 3 ครั้ง/วัน
- [ ] T050 [US6] Update `backend/src/modules/quiz/quiz.controller.ts`: เพิ่ม GET `/api/courses/:id/posttest/eligibility`, POST `/api/courses/:id/posttest/register`
- [ ] T051 [US6] Update `frontend/src/pages/courses/CourseDetailPage.tsx`: Post-test panel — lock ถ้า progress < 100%, แสดง "X/Y บทที่ดูแล้ว", ปุ่ม register + start
- [ ] T052 [P] [US6] Update `frontend/src/pages/admin/AdminPage.tsx`: เพิ่ม Post-test registration list tab — แสดง user, วันที่สมัคร, คะแนนล่าสุด, จำนวนครั้งสอบ

---

## Phase 8 — Hidden Stats [US8]

- [ ] T053 [US8] Update `backend/src/modules/course/course.repository.ts`: `incrementViewers(courseId, userId)` — นับ unique user แรกที่เปิดคอร์ส
- [ ] T054 [US8] Update `backend/src/modules/progress/progress.service.ts`: `addWatchHours(courseId, deltaSeconds)` — บวก totalWatchHours ให้คอร์ส
- [ ] T055 [P] [US8] Update `backend/src/modules/course/course.service.ts`: guard — ส่ง totalViewers/totalWatchHours เฉพาะเมื่อ `req.user.role === 'ADMIN'`
- [ ] T056 [P] [US8] Update `frontend/src/pages/admin/AdminPage.tsx`: แสดง totalViewers, totalWatchHours ต่อคอร์สในหน้า admin

---

## Dependency Graph

```
T001-T010 (Schema) → ทุกอย่าง
T011-T016 (Role/Auth) → T029, T037, T047
T017-T028 (Enrollment/Expiry) → T039 (per-section checkout)
T029-T036 (Intro/Instructor) → T042-T046 (Watermark needs video.isIntro)
T047-T052 (Post-test) → ไม่มี dependency เพิ่มเติม
T053-T056 (Stats) → ไม่มี dependency เพิ่มเติม
```

## Parallel Opportunities

Phase 4 (T029-T036) + Phase 5 (T037-T041) + Phase 8 (T053-T056) สามารถทำพร้อมกันได้หลังจาก Phase 1+2 เสร็จ

Phase 6 (T042-T046) ทำได้พร้อมกับ Phase 7 (T047-T052)

## MVP Scope (Phase 1+2+3 ก่อน)

1. Schema migration (T001-T010)
2. Role CUSTOMER/STAFF (T011-T016)
3. Course expiry + email (T017-T028)
