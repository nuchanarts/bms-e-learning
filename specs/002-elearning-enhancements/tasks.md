# Tasks: E-Learning Platform Enhancements

**Input**: Design documents from `/specs/002-elearning-enhancements/`
**Tests**: TDD — write tests FIRST per constitution (Red → Green → Refactor)

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T001 Install exceljs dependency in `backend/package.json` (`npm install exceljs`)
- [ ] T002 [P] Install exceljs types (`npm install -D @types/exceljs`) in `backend/`

---

## Phase 2: Foundational — Prisma Schema & Migrations

**⚠️ CRITICAL**: ต้อง complete ก่อน user story ทั้งหมด

- [ ] T003 Update `backend/prisma/schema.prisma` — add User fields: `cid`, `hospital`, `position`
- [ ] T004 Update `backend/prisma/schema.prisma` — add Course field: `category`
- [ ] T005 Update `backend/prisma/schema.prisma` — add Progress field: `watchedSeconds`
- [ ] T006 Update `backend/prisma/schema.prisma` — add Certificate fields: `tier` (enum CertTier), `quizScore`
- [ ] T007 Add `backend/prisma/schema.prisma` — new model `CourseDocument`
- [ ] T008 Add `backend/prisma/schema.prisma` — new model `QuizQuestion`
- [ ] T009 Add `backend/prisma/schema.prisma` — new model `QuizAttempt` with `@@unique([userId, courseId])`
- [ ] T010 Add `backend/prisma/schema.prisma` — new enum `CertTier { BRONZE SILVER GOLD PLATINUM }`
- [ ] T011 Run `npx prisma migrate dev --name add_enhancements` in `backend/`
- [ ] T012 Run `npx prisma generate` to regenerate Prisma client

**Checkpoint**: Schema migrated — all new tables/columns exist ✅

---

## Phase 3: User Story 1 — User Profile (P1) 🎯 MVP

**Goal**: ผู้ใช้ register/login พร้อม CID, hospital, position; แสดงใน dashboard

**Independent Test**: Register user ใหม่ด้วย CID=1234567890123, hospital="รพ.สต.บ้านใหม่" → GET /auth/me คืน fields ครบ

### Tests — US1

- [ ] T013 [P] [US1] เขียน unit test `backend/src/modules/auth/__tests__/auth.service.test.ts` — test register validates CID length=13 (fail first)
- [ ] T014 [P] [US1] เขียน unit test — test register rejects duplicate CID

### Implementation — US1

- [ ] T015 [US1] Update `backend/src/modules/auth/auth.service.ts` — รับ `cid?`, `hospital?`, `position?` ใน register, validate CID
- [ ] T016 [US1] Update `backend/src/modules/auth/auth.controller.ts` — ส่ง cid/hospital/position ไป service
- [ ] T017 [US1] Update `backend/src/modules/auth/auth.routes.ts` — ไม่ต้องเปลี่ยน routes
- [ ] T018 [US1] Update JWT payload และ `/auth/me` response ใน `backend/src/modules/auth/auth.service.ts` — include cid, hospital, position
- [ ] T019 [US1] Update `frontend/src/pages/auth/RegisterPage.tsx` — เพิ่ม fields CID, hospital, position พร้อม validation
- [ ] T020 [US1] Update `frontend/src/contexts/AuthContext.tsx` — include cid, hospital, position ใน User type

**Checkpoint**: Register/login พร้อม profile ครบ ✅

---

## Phase 4: User Story 2 — Course Categories (P1)

**Goal**: Course มี category field; CourseListPage มี filter tabs; Admin สร้าง/แก้ไข category ได้

**Independent Test**: สร้าง 2 courses ต่าง category, filter ดู → เห็นเฉพาะ category ที่เลือก

### Tests — US2

- [ ] T021 [P] [US2] เขียน unit test `backend/src/modules/course/__tests__/course.service.test.ts` — test list ส่ง category filter ได้

### Implementation — US2

- [ ] T022 [US2] Update `backend/src/modules/course/course.repository.ts` — `findAll()` รับ `category?` filter
- [ ] T023 [US2] Update `backend/src/modules/course/course.service.ts` — ส่ง category ไป repository
- [ ] T024 [US2] Update `backend/src/modules/course/course.controller.ts` — รับ `?category=` query param
- [ ] T025 [US2] Update `backend/src/modules/admin/admin.service.ts` — `createCourse` และ `updateCourse` รับ `category`
- [ ] T026 [US2] Update `frontend/src/pages/courses/CourseListPage.tsx` — เพิ่ม category filter tabs (ดึง unique categories จาก courses)
- [ ] T027 [US2] Update `frontend/src/pages/admin/AdminPage.tsx` — เพิ่ม category field ใน create/edit course form

**Checkpoint**: Filter by category ทำงานทั้ง frontend+backend ✅

---

## Phase 5: User Story 3 — Quiz Module (P1)

**Goal**: Admin CRUD quiz questions; ผู้เรียนทำ quiz; score ≥60% = passed; cert eligibility ตรวจ quiz

**Independent Test**: สร้าง quiz 5 ข้อ, submit 3 ถูก (60%) → passed=true; submit 2 ถูก → passed=false

### Tests — US3

- [ ] T028 [P] [US3] เขียน unit test `backend/src/modules/quiz/__tests__/quiz.service.test.ts` — test score=60% → passed=true, <60% → false
- [ ] T029 [P] [US3] เขียน unit test — test quiz upsert (ทำซ้ำ → update score เดิม)

### Implementation — US3

- [ ] T030 [US3] สร้าง `backend/src/modules/quiz/quiz.repository.ts` — CRUD QuizQuestion, upsert QuizAttempt
- [ ] T031 [US3] สร้าง `backend/src/modules/quiz/quiz.service.ts` — `getQuestions()`, `submitAttempt()`, `getResult()`
- [ ] T032 [US3] สร้าง `backend/src/modules/quiz/quiz.controller.ts` — GET /quiz/:courseId, POST /quiz/:courseId/attempt, GET /quiz/:courseId/result
- [ ] T033 [US3] สร้าง `backend/src/modules/quiz/quiz.routes.ts` — register routes พร้อม authenticate middleware
- [ ] T034 [US3] Register quiz routes ใน `backend/src/app.ts`
- [ ] T035 [US3] Update `backend/src/modules/admin/admin.service.ts` — `createQuizQuestion`, `updateQuizQuestion`, `deleteQuizQuestion`
- [ ] T036 [US3] Update `backend/src/modules/admin/admin.controller.ts` — add quiz CRUD handlers
- [ ] T037 [US3] Update `backend/src/modules/admin/admin.routes.ts` — add quiz CRUD routes
- [ ] T038 [US3] Update `backend/src/modules/certificate/certificate.service.ts` — `getOrGenerate` ตรวจ quiz passed ก่อน issue cert
- [ ] T039 [US3] สร้าง `frontend/src/services/quizService.ts` — getQuestions, submitAttempt, getResult
- [ ] T040 [US3] สร้าง `frontend/src/components/ui/QuizModal.tsx` — modal แสดง questions, submit answers, แสดงผล
- [ ] T041 [US3] Update `frontend/src/pages/courses/CourseDetailPage.tsx` — เพิ่ม "ทำแบบทดสอบ" button เมื่อ videos ครบ, แสดง QuizModal
- [ ] T042 [US3] Update `frontend/src/pages/admin/AdminPage.tsx` — เพิ่ม quiz management panel ต่อ course (list/add/delete questions)

**Checkpoint**: Quiz flow ครบ — admin สร้าง, ผู้เรียน submit, cert check quiz ✅

---

## Phase 6: User Story 4 — Time Tracking (P2)

**Goal**: ระบบบันทึก watchedSeconds สะสมต่อ video; แสดง total learning time ใน dashboard

**Independent Test**: เล่นวิดีโอ 30 วินาที → GET /progress/course/:id คืน watchedSeconds=30

### Tests — US4

- [ ] T043 [P] [US4] เขียน unit test `backend/src/modules/progress/__tests__/progress.service.test.ts` — test saveProgress บันทึก watchedSeconds ถูกต้อง

### Implementation — US4

- [ ] T044 [US4] Update `backend/src/modules/progress/progress.repository.ts` — upsert รับ `watchedSeconds`, ใช้ `Math.max(existing, incoming)`
- [ ] T045 [US4] Update `backend/src/modules/progress/progress.service.ts` — ส่ง watchedSeconds ไป repository
- [ ] T046 [US4] Update `backend/src/modules/progress/progress.controller.ts` — รับ `watchedSeconds` จาก request body
- [ ] T047 [US4] Update `frontend/src/components/ui/VideoPlayer.tsx` — เพิ่ม heartbeat ส่ง watchedSeconds ทุก 5 วินาทีขณะ play
- [ ] T048 [US4] Update `frontend/src/pages/DashboardPage.tsx` — แสดง total learning time (sum watchedSeconds รวมทุก video)
- [ ] T049 [US4] Update backend `/dashboard` endpoint ให้รวม `totalLearningSeconds` ต่อ user

**Checkpoint**: Time tracking บันทึกและแสดงใน dashboard ✅

---

## Phase 7: User Story 5 — Certificate Tiers (P2)

**Goal**: ระบบคำนวณ tier อัตโนมัติ; แสดง badge บน dashboard; certificate บันทึก tier

**Independent Test**: User ที่มี 6 certificates → GET /dashboard คืน tier="BRONZE"

### Tests — US5

- [ ] T050 [P] [US5] เขียน unit test `backend/src/modules/certificate/__tests__/certificate.service.test.ts` — test getUserTier: 0→null, 6→BRONZE, 10→SILVER, 14→GOLD

### Implementation — US5

- [ ] T051 [US5] Update `backend/src/modules/certificate/certificate.service.ts` — เพิ่ม `getUserTier(userId)`, บันทึก `tier` ใน certificate เมื่อออก
- [ ] T052 [US5] Update `backend/src/modules/certificate/certificate.repository.ts` — `create` รับ `tier` และ `quizScore`
- [ ] T053 [US5] Update dashboard endpoint `backend/src/app.ts` หรือ dashboard module — include `tier` ใน response
- [ ] T054 [US5] Update `frontend/src/pages/DashboardPage.tsx` — แสดง tier badge (Bronze🥉/Silver🥈/Gold🥇/Platinum💎)

**Checkpoint**: Tier badge แสดงถูกต้องตาม cert count ✅

---

## Phase 8: User Story 6 — Document Downloads (P2)

**Goal**: Admin เพิ่ม/ลบเอกสาร URL ต่อ course; ผู้เรียนดาวน์โหลดได้ใน course detail

**Independent Test**: Admin เพิ่ม document URL → GET /courses/:id คืน documents array → เห็นปุ่ม download ใน UI

### Implementation — US6

- [ ] T055 [P] [US6] Update `backend/src/modules/course/course.repository.ts` — `findAll()` และ `findById()` include `documents`
- [ ] T056 [US6] Update `backend/src/modules/admin/admin.service.ts` — `addDocument(courseId, {title, url, order})`, `deleteDocument(id)`
- [ ] T057 [US6] Update `backend/src/modules/admin/admin.controller.ts` — add document handlers
- [ ] T058 [US6] Update `backend/src/modules/admin/admin.routes.ts` — POST `/courses/:courseId/documents`, DELETE `/documents/:documentId`
- [ ] T059 [US6] Update `frontend/src/services/courseService.ts` — include `documents` ใน Course type
- [ ] T060 [US6] Update `frontend/src/pages/courses/CourseDetailPage.tsx` — เพิ่ม documents section (list + download buttons)
- [ ] T061 [US6] Update `frontend/src/pages/admin/AdminPage.tsx` — เพิ่ม document management ใน video panel ของแต่ละ course

**Checkpoint**: Document download ทำงาน end-to-end ✅

---

## Phase 9: User Story 7 — Enhanced Admin Dashboard (P3)

**Goal**: Admin เห็น Top 5 learners, completion rate per course; Export Excel

**Independent Test**: Admin GET /admin/analytics คืน topLearners array; GET /admin/export/excel ดาวน์โหลด .xlsx

### Tests — US7

- [ ] T062 [P] [US7] เขียน unit test `backend/src/modules/admin/__tests__/admin.service.test.ts` — test getAnalytics คืน topLearners และ courseCompletionRates

### Implementation — US7

- [ ] T063 [US7] Update `backend/src/modules/admin/admin.service.ts` — `getAnalytics()` เพิ่ม `topLearners` (Top 5 by totalWatchedSeconds) และ `courseCompletionRates`
- [ ] T064 [US7] สร้าง `backend/src/modules/admin/excel.service.ts` — สร้าง Excel workbook ด้วย exceljs, include ข้อมูลผู้เรียนทั้งหมด
- [ ] T065 [US7] Update `backend/src/modules/admin/admin.controller.ts` — เพิ่ม `exportExcel` handler
- [ ] T066 [US7] Update `backend/src/modules/admin/admin.routes.ts` — GET `/export/excel`
- [ ] T067 [US7] Update `frontend/src/pages/admin/AdminPage.tsx` — แสดง Top 5 Learners card, completion rate per course, ปุ่ม Export Excel

**Checkpoint**: Admin dashboard enhanced ครบ ✅

---

## Phase 10: Polish & Integration

- [ ] T068 [P] Update `backend/prisma/seed.ts` — เพิ่ม cid/hospital/position ให้ seed users, เพิ่ม category ให้ seed course, เพิ่ม quiz questions sample
- [ ] T069 [P] Update E2E tests `e2e/courses.spec.ts` — เพิ่ม test category filter
- [ ] T070 [P] Update E2E tests `e2e/auth.spec.ts` — เพิ่ม test register พร้อม CID
- [ ] T071 Run `npm run test` (backend unit tests) — ทุก test ผ่าน
- [ ] T072 Run `npm run test:e2e` — ทุก E2E test ผ่าน
- [ ] T073 Commit: `feat(platform): implement elearning enhancements (quiz, categories, tiers, docs, time)`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1-2**: Run first — no dependencies
- **Phase 3-9**: ทุก phase ต้องรอ Phase 2 (schema) เสร็จก่อน
- **Phase 3 (US1)**: ต้อง complete ก่อน Phase 5 (US3) เพราะ quiz attempt ใช้ userId
- **Phase 5 (US3)**: ต้อง complete ก่อน Phase 7 (US5) เพราะ cert tier ต้องการ quiz_passed
- **Phase 4, 6, 8, 9**: สามารถทำ parallel ได้หลัง Phase 2 เสร็จ

### Parallel Opportunities

Phase 3 เสร็จแล้ว สามารถทำ parallel:
- Phase 4 (US2 — Categories)
- Phase 6 (US4 — Time Tracking)
- Phase 8 (US6 — Documents)

---

## Implementation Strategy

### MVP (P1 stories only)
1. Phase 1-2: Setup + Schema
2. Phase 3: User Profile
3. Phase 4: Categories
4. Phase 5: Quiz Module
→ **STOP & VALIDATE**

### Full Delivery
5. Phase 6: Time Tracking
6. Phase 7: Certificate Tiers
7. Phase 8: Documents
8. Phase 9: Enhanced Dashboard
9. Phase 10: Polish
