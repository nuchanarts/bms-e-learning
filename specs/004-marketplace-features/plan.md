# Implementation Plan: Marketplace Features

**Branch**: `004-marketplace-features` | **Date**: 2026-04-23 | **Spec**: [spec.md](spec.md)

## Summary

Add 6 marketplace-inspired features to BGS E-Learning: public stats bar, featured courses hero section, enriched course cards (learner count / badges / rating), course rating & review system, course bundles, and alternative CID+hospcode login. All business logic lives in the backend service layer; frontend reads via new public and authenticated REST endpoints.

## Technical Context

**Language/Version**: TypeScript 5.x (backend + frontend)
**Primary Dependencies**: Express 4, Prisma ORM, React 18 + Vite, MySQL 8
**Storage**: MySQL via Prisma (schema additions: CourseRating, CourseBundle, BundleCourse; Course.isFeatured)
**Testing**: Jest (backend unit), Playwright (E2E)
**Target Platform**: Node.js 18+ server, modern browser
**Performance Goals**: Stats endpoint < 500ms; rating submission < 500ms
**Constraints**: Must not break existing certificate, progress, or payment flows
**Scale/Scope**: ~100 concurrent users, ~50 courses, ~500 ratings at launch

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Backend as Source of Truth | ✅ | All business logic (rating eligibility, bundle validation, CID login) in service layer |
| Controller → Service → Repository | ✅ | New routes follow existing pattern |
| No duplicate logic | ✅ | Completion check reuses existing quizService + progressRepository |
| TDD | ✅ | Tests written for: rating eligibility, bundle price validation, CID login match |
| Loading/error/empty states | ✅ | Stats skeleton, empty featured section hidden, empty reviews state |
| API < 500ms reads | ✅ | Stats computed with single aggregated query |
| JWT auth on protected endpoints | ✅ | Ratings and bundle purchase require authenticate middleware |
| Input validation | ✅ | Rating 1–5 validated backend; review max 500 chars; CID 13 digits |

## Project Structure

```text
specs/004-marketplace-features/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── stats.md
│   ├── ratings.md
│   ├── bundles.md
│   └── auth-cid.md
└── tasks.md

backend/src/modules/
├── stats/
│   └── stats.routes.ts          (new — public)
├── rating/
│   ├── rating.controller.ts     (new)
│   ├── rating.service.ts        (new)
│   └── rating.repository.ts    (new)
├── bundle/
│   ├── bundle.controller.ts     (new)
│   ├── bundle.service.ts        (new)
│   └── bundle.repository.ts    (new)
├── auth/
│   └── auth.service.ts          (extend — add loginByCid method)
└── admin/
    └── admin.service.ts         (extend — featured toggle, review delete, bundle CRUD)

frontend/src/
├── pages/courses/CourseListPage.tsx   (extend — stats bar, featured section, bundles, badges)
├── pages/courses/CourseDetailPage.tsx (extend — rating form, reviews list)
├── pages/auth/LoginPage.tsx           (extend — CID login tab)
└── pages/admin/AdminPage.tsx          (extend — featured toggle, bundle management, review delete)
```

## Implementation Phases

### Phase A — Data Layer (schema + migration)
1. Add `isFeatured Boolean @default(false)` to Course
2. Add `CourseRating` model
3. Add `CourseBundle` + `BundleCourse` models
4. `npx prisma db push`

### Phase B — Backend APIs
5. `GET /stats/public` — aggregated counts (public)
6. `GET /ratings/:courseId` — list reviews (public)
7. `POST /ratings/:courseId` — submit/update rating (auth, completion check)
8. `GET /bundles` — list active bundles (public)
9. `POST /auth/login-by-cid` — alternative login (public)
10. Admin: `PUT /admin/courses/:id/featured` — toggle featured
11. Admin: `DELETE /admin/ratings/:id` — delete review
12. Admin bundle CRUD: POST/PUT/DELETE `/admin/bundles`

### Phase C — Frontend
13. Stats bar component on CourseListPage
14. Featured hero section on CourseListPage
15. Enriched course card badges (ใหม่, แนะนำ, learner count, rating)
16. Bundles section on CourseListPage
17. Rating form + reviews list on CourseDetailPage
18. CID login tab on LoginPage
19. Admin: featured toggle button per course
20. Admin: bundle management panel
21. Admin: review delete in course detail admin view

## Key Decisions

- **Learner count source**: `Progress` distinct userId per courseId (captures free learners without payment). Paid courses also count PAID Orders. Use `COUNT(DISTINCT userId)` on Progress table — simpler than union.
- **Rating eligibility check**: Reuse `certificateService`'s existing completion check logic (all videos ≥80% + quiz passed). Extract to shared `progressService.isCourseCompleted(userId, courseId)`.
- **Bundle payment**: Extend existing mock payment flow — create one Order per included course on bundle purchase.
- **CID login**: New endpoint `POST /auth/login-by-cid` with body `{hospcode, cid}`. Finds user where `hospcode = X AND cid = Y`. Returns same JWT as normal login.
- **Stats caching**: No cache for now — single aggregated Prisma query is fast enough at current scale.
