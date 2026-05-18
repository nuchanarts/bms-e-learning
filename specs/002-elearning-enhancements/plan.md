# Implementation Plan: E-Learning Platform Enhancements

**Branch**: `002-elearning-enhancements` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)

## Summary

เพิ่ม 7 features หลักในระบบ E-Learning รพ.สต.: User Profile (CID/hospital/position), Course Categories, Quiz Module, Time Tracking, Certificate Tiers, Document Downloads, Enhanced Admin Dashboard
ใช้ MySQL + Prisma migration เพิ่ม tables ใหม่ และ columns ใน tables เดิม

## Technical Context

**Language/Version**: TypeScript (backend Node.js 18+), TypeScript + React 18 (frontend)
**Primary Dependencies**: Express, Prisma ORM, MySQL, Vite, Tailwind, exceljs (Excel export)
**Storage**: MySQL via Prisma — migrations เพิ่ม columns/tables
**Testing**: Jest (unit/integration), Playwright (E2E)
**Target Platform**: Linux server + modern browser
**Project Type**: Web application (React frontend + Express backend)
**Performance Goals**: API reads <500ms, certificate gen <10s, page load <3s
**Constraints**: PDPA compliant, JWT auth, async progress save, no business logic in controller/UI
**Scale/Scope**: ~10k users, 14+ courses, 100+ videos

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity & Modularity | ✅ | เพิ่ม module quiz ใหม่, แยกจาก modules อื่น |
| II. Backend as Source of Truth | ✅ | ทุก business logic (tier calc, quiz scoring) อยู่ใน service layer |
| III. Code Quality (3 layers) | ✅ | ทุก module มี controller/service/repository |
| IV. TDD | ✅ | เขียน tests ก่อน implement ทุก service |
| V. UX Consistency | ✅ | ใช้ existing design system (glassmorphism purple) |
| VI. Performance | ✅ | time tracking save เป็น background, Excel export async |
| VII. Security | ✅ | CID ไม่ใช่ข้อมูลผู้ป่วย, validate ทั้ง frontend+backend |
| VIII. Observability | ✅ | log quiz attempts, time saves, tier changes |
| IX. Google Sheets | ✅ | ไม่กระทบ |
| X. Learning Business Rules | ✅ | quiz_passed + time_threshold เพิ่มเป็น certificate conditions |

## Project Structure

### Documentation (this feature)

```text
specs/002-elearning-enhancements/
├── plan.md              ← this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── quiz-api.md
│   └── user-profile-api.md
└── tasks.md
```

### Source Code

```text
backend/
├── prisma/
│   ├── schema.prisma          ← add User fields, Course.category, new tables
│   └── migrations/
├── src/
│   ├── modules/
│   │   ├── auth/              ← update register to accept CID/hospital/position
│   │   ├── course/            ← add category field
│   │   ├── quiz/              ← NEW module (controller/service/repository/routes)
│   │   ├── progress/          ← add watchedSeconds tracking
│   │   ├── certificate/       ← add tier calculation, quiz check, time check
│   │   └── admin/             ← add quiz CRUD, document CRUD, enhanced analytics
│   └── ...

frontend/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── RegisterPage.tsx      ← add CID/hospital/position fields
│   │   ├── courses/
│   │   │   ├── CourseListPage.tsx    ← add category filter tabs
│   │   │   └── CourseDetailPage.tsx  ← add quiz section, documents section, time tracking
│   │   ├── admin/
│   │   │   └── AdminPage.tsx         ← add quiz management, document management, enhanced analytics
│   │   └── DashboardPage.tsx         ← add tier badge, learning time display
│   └── services/
│       └── quizService.ts            ← NEW
```
