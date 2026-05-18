# Feature Specification: Marketplace Features

**Feature Branch**: `004-marketplace-features`
**Created**: 2026-04-23
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Stats Bar (Priority: P1)

Any visitor sees a stats banner on the course list page: total active courses, total enrolled learners, total certificates issued, total hospitals.

**Why this priority**: Establishes credibility — mirrors "50+ Add-ons · 100+ Hospitals" bar on HOSxP Marketplace.

**Independent Test**: Load course list page without login; verify 4 stat numbers appear.

**Acceptance Scenarios**:
1. **Given** any user visits the course list page, **When** the page loads, **Then** a stats bar shows 4 figures.
2. **Given** a new certificate is issued, **When** stats reload, **Then** certificate count increases.

---

### User Story 2 - Featured / Recommended Courses (Priority: P1)

Admin marks courses as "แนะนำ". A hero section appears above the normal grid showing featured courses.

**Acceptance Scenarios**:
1. **Given** admin marks a course featured, **When** user views course list, **Then** it appears in the "คอร์สแนะนำ" section.
2. **Given** no courses are featured, **When** user views course list, **Then** hero section is hidden.

---

### User Story 3 - Marketplace Course Cards (Priority: P2)

Cards show: learner count, "ใหม่" badge (created ≤30 days), "แนะนำ" badge (featured), star rating.

**Acceptance Scenarios**:
1. **Given** course created ≤30 days ago, **When** card is shown, **Then** "ใหม่" badge appears.
2. **Given** 10 users enrolled, **When** card is shown, **Then** "10 คน" appears.
3. **Given** average rating 4.2 from 5 reviews, **When** card is shown, **Then** "⭐ 4.2 (5)" appears.

---

### User Story 4 - Course Rating & Review (Priority: P2)

After completing a course, learner submits 1–5 stars + optional review. Average shows on card and detail page.

**Acceptance Scenarios**:
1. **Given** user completed a course, **When** they view course detail, **Then** rating form appears.
2. **Given** user has NOT completed a course, **When** they view course detail, **Then** no rating form.
3. **Given** user submits rating, **When** submitted, **Then** average updates on card and detail page.
4. **Given** user already rated, **When** they open the form, **Then** existing rating is pre-filled for update.

---

### User Story 5 - Course Bundles (Priority: P3)

Admin creates bundles of courses at a discounted price. Bundles shown in "แพ็กเกจ" section. Purchasing grants access to all included courses.

**Acceptance Scenarios**:
1. **Given** active bundle exists, **When** user views course list, **Then** bundle appears in "แพ็กเกจ" section.
2. **Given** user purchases a bundle, **When** payment confirmed, **Then** all courses become accessible.
3. **Given** bundle price >= sum of individual prices, **When** admin saves, **Then** error is shown.

---

### User Story 6 - Alternative Login via hospcode + CID (Priority: P3)

Staff without email can log in using 5-digit hospital code (hospcode) + 13-digit national ID (CID).

**Acceptance Scenarios**:
1. **Given** user account has hospcode + CID set, **When** they enter on alternative login tab, **Then** they are authenticated.
2. **Given** wrong CID entered, **When** login attempted, **Then** error message shown.

---

### Edge Cases
- Stats endpoint slow → show loading skeleton.
- No featured courses → featured section hidden completely.
- Backend validates course completion before accepting rating.
- hospcode + CID matches multiple users → login denied.
- Course in bundle deleted → bundle shows course as unavailable.

## Requirements

### Functional Requirements

**FR-001**: Public stats endpoint returns: active course count, total learners enrolled, total certificates, total distinct hospitals.
**FR-002**: Stats bar visible on course list without authentication.
**FR-003**: Admin toggles isFeatured per course.
**FR-004**: Course list shows "คอร์สแนะนำ" hero section when ≥1 course is featured.
**FR-005**: Each course card shows: learner count, "ใหม่" badge, "แนะนำ" badge, star rating.
**FR-006**: Only users who completed a course may submit a rating (backend enforced).
**FR-007**: Rating is 1–5 int; review text optional max 500 chars; one per user per course (updatable).
**FR-008**: Course detail page shows average rating, count, and reviews newest first.
**FR-009**: Admin can delete any review.
**FR-010**: Admin creates/edits/deactivates bundles with name, description, price, course list.
**FR-011**: Active bundles appear in "แพ็กเกจ" section on course list page.
**FR-012**: Bundle purchase grants access to all included courses simultaneously.
**FR-013**: Bundle price must be less than sum of individual course prices (validated on save).
**FR-014**: Login page offers alternative tab: "เข้าสู่ระบบด้วยรหัส รพ.สต." accepting hospcode + CID.
**FR-015**: Alternative login backend matches hospcode + CID to exactly one user; otherwise error.

### Key Entities

- **CourseRating**: userId, courseId, rating (1–5), review (text optional), createdAt — unique (userId, courseId)
- **CourseBundle**: name, description, price, isActive, courses (many-to-many)
- **BundleCourse**: join table CourseBundle ↔ Course
- **Course** additions: isFeatured (bool default false)

## Success Criteria

- **SC-001**: Stats bar loads within 1 second.
- **SC-002**: Featured toggle reflects on course list within 1 page refresh.
- **SC-003**: Completed learner submits rating in under 30 seconds.
- **SC-004**: Bundle purchase grants course access in same session.
- **SC-005**: Alternative login completes in under 3 seconds.
- **SC-006**: Course card stats (learner count, rating) match database at load time.

## Assumptions

- Completed course = all videos ≥80% watched + quiz passed (mirrors certificate eligibility).
- Learner count = distinct users with Progress record or PAID Order for the course.
- Bundle payment uses existing mock payment flow.
- MOPH OAuth (real federation) is out of scope; uses hospcode + CID from User record.
- "ใหม่" badge = course.createdAt within 30 calendar days of today.
