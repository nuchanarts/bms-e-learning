# Tasks: Marketplace Features (004)

**Branch**: `004-marketplace-features` | **Total Tasks**: 42

## Phase 1 — Setup (Schema & Migration)

- [x] T001 Add `isFeatured Boolean @default(false)` to Course model in `backend/prisma/schema.prisma`
- [x] T002 Add `CourseRating` model to `backend/prisma/schema.prisma` (userId, courseId, rating 1–5, review text optional, unique userId+courseId)
- [x] T003 Add `CourseBundle` model to `backend/prisma/schema.prisma` (name, description, price, isActive)
- [x] T004 Add `BundleCourse` join table to `backend/prisma/schema.prisma` (bundleId, courseId composite PK)
- [x] T005 Add relations: Course.ratings, Course.bundleCourses, User.ratings in `backend/prisma/schema.prisma`
- [x] T006 Run `npx prisma db push` and verify schema synced with DB

## Phase 2 — Foundational Backend Modules

- [x] T007 [P] Create `backend/src/modules/stats/stats.routes.ts` — public `GET /stats/public` returning 4 counts via Promise.all Prisma queries
- [x] T008 [P] Create `backend/src/modules/rating/rating.repository.ts` — findByCourse, upsert, findById, delete methods
- [x] T009 [P] Create `backend/src/modules/bundle/bundle.repository.ts` — findAllActive, findById, create, update, deactivate methods
- [x] T010 Register `/stats/public` route in `backend/src/app.ts`
- [x] T011 Register `/ratings` and `/bundles` routes in `backend/src/app.ts`

## Phase 3 — US1: Stats Bar

- [x] T012 [US1] Create `backend/src/modules/stats/stats.routes.ts` query: `course.count({isActive:true})`, `progress.groupBy(userId)`, `certificate.count()`, `user.groupBy(hospcode)` — return JSON with 4 fields
- [x] T013 [P] [US1] Create `frontend/src/components/ui/StatsBar.tsx` — 4-column grid, accepts props {totalCourses, totalLearners, totalCertificates, totalHospitals}, shows loading skeleton
- [x] T014 [US1] Fetch `/stats/public` in `frontend/src/pages/courses/CourseListPage.tsx` via useEffect and render `<StatsBar>` above the page header
- [x] T015 [US1] Add loading skeleton state to StatsBar in `frontend/src/components/ui/StatsBar.tsx` (animated pulse divs while fetching)

## Phase 4 — US2: Featured Courses Hero Section

- [x] T016 [P] [US2] Add `isFeatured` toggle button to course row in `frontend/src/pages/admin/AdminPage.tsx` — calls `PUT /admin/courses/:id/featured`
- [x] T017 [P] [US2] Add `PUT /admin/courses/:id/featured` endpoint to `backend/src/modules/admin/admin.routes.ts`
- [x] T018 [US2] Implement `toggleFeatured(id)` in `backend/src/modules/admin/admin.service.ts` — prisma.course.update toggle isFeatured
- [x] T019 [US2] Add `isFeatured` to CourseItem interface and course list API response in `frontend/src/pages/admin/AdminPage.tsx` and `frontend/src/services/courseService.ts`
- [x] T020 [US2] Create `FeaturedSection` component inline in `frontend/src/pages/courses/CourseListPage.tsx` — horizontal scrollable row of featured course cards with "แนะนำ" ribbon; hidden when no featured courses

## Phase 5 — US3: Enriched Course Cards

- [x] T021 [US3] Extend `GET /courses` backend to include per-course: `enrollCount` (distinct userId from Progress), `avgRating` and `ratingCount` from CourseRating, `isNew` (createdAt within 30 days) in `backend/src/modules/course/course.service.ts`
- [x] T022 [US3] Update `Course` interface in `frontend/src/services/courseService.ts` with: enrollCount, avgRating, ratingCount, isNew, isFeatured
- [x] T023 [US3] Update course card in `frontend/src/pages/courses/CourseListPage.tsx` to display: "ใหม่" badge, "แนะนำ" badge, learner count, star rating

## Phase 6 — US4: Rating & Review

- [x] T024 [P] [US4] Create `backend/src/modules/rating/rating.service.ts` — submitRating (checks completion via progressRepository + quizService), getRatings, deleteRating
- [x] T025 [P] [US4] Create `backend/src/modules/rating/rating.controller.ts` — GET /:courseId, POST /:courseId, DELETE /admin/:id
- [x] T026 [US4] Create `backend/src/modules/rating/rating.routes.ts` and register in `backend/src/app.ts` at `/ratings`
- [x] T027 [US4] Add admin delete rating route `DELETE /admin/ratings/:id` in `backend/src/modules/admin/admin.routes.ts`
- [x] T028 [P] [US4] Create `frontend/src/components/ui/StarRating.tsx` — interactive 1–5 star picker with hover state
- [x] T029 [US4] Add rating section to `frontend/src/pages/courses/CourseDetailPage.tsx`: show StarRating form (only if completed), reviews list (newest first), average display
- [x] T030 [US4] Create `frontend/src/services/ratingService.ts` — getRatings(courseId), submitRating(courseId, rating, review)

## Phase 7 — US5: Course Bundles

- [x] T031 [P] [US5] Create `backend/src/modules/bundle/bundle.service.ts` — listActive, create (validate price < sum of courses), update, deactivate, getById
- [x] T032 [P] [US5] Create `backend/src/modules/bundle/bundle.controller.ts` — GET /, POST /admin, PUT /admin/:id, DELETE /admin/:id
- [x] T033 [US5] Create `backend/src/modules/bundle/bundle.routes.ts` and register in `backend/src/app.ts` at `/bundles` and admin routes
- [x] T034 [US5] Extend existing payment flow in `backend/src/modules/payment/payment.service.ts` to handle bundle purchase — create one PAID Order per course in bundle
- [x] T035 [P] [US5] Create bundle management panel in `frontend/src/pages/admin/AdminPage.tsx` — form (name, description, price, course selector), list with deactivate button
- [x] T036 [US5] Create `frontend/src/services/bundleService.ts` — getBundles(), purchaseBundle(bundleId)
- [x] T037 [US5] Add "แพ็กเกจ" section to `frontend/src/pages/courses/CourseListPage.tsx` — shows active bundles below stats bar, above featured section; each card shows included courses + price

## Phase 8 — US6: Alternative CID Login

- [x] T038 [P] [US6] Add `loginByCid(hospcode, cid)` to `backend/src/modules/auth/auth.service.ts` — find user where hospcode=X AND cid=Y (exactly 1 result), return JWT same as normal login
- [x] T039 [US6] Add `POST /auth/login-by-cid` endpoint in `backend/src/modules/auth/auth.routes.ts` with input validation (hospcode 5 digits, cid 13 digits)
- [x] T040 [US6] Add second tab "เข้าสู่ระบบด้วยรหัส รพ.สต." to `frontend/src/pages/auth/LoginPage.tsx` with hospcode + CID fields, calls `/auth/login-by-cid`

## Phase 9 — Polish

- [x] T041 [P] Add error boundary / fallback UI for stats fetch failure in `frontend/src/pages/courses/CourseListPage.tsx` — show dashes instead of crash
- [x] T042 [P] Update admin course list in `frontend/src/pages/admin/AdminPage.tsx` to show isFeatured badge icon (⭐) on featured courses

## Dependencies

```
T001-T006  →  T007-T011 (schema must exist before routes)
T007       →  T013-T015 (stats endpoint before stats bar)
T016-T018  →  T019-T020 (admin toggle before frontend feature section)
T021       →  T022-T023 (enriched API before enriched cards)
T024-T026  →  T027-T030 (rating service before frontend)
T031-T033  →  T034-T037 (bundle service before payment extension + frontend)
T038-T039  →  T040 (backend CID login before frontend tab)
```

## Parallel Opportunities

**Phase 2**: T007, T008, T009 can run in parallel (different files)
**Phase 4+5**: T016, T017 parallel (admin toggle: frontend + backend)
**Phase 6**: T024, T025, T028 parallel
**Phase 7**: T031, T032, T035 parallel
**Phase 8**: T038 backend, T040 frontend can be developed simultaneously

## MVP Scope (deliver value fastest)

**US1 + US2 + US3** — Stats bar + Featured section + Enriched cards (T001-T023)
These three deliver the full visual marketplace experience with zero risk to existing flows.
