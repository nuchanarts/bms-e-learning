# Research: Marketplace Features

## Decision 1: Learner Count Source
**Decision**: Use `COUNT(DISTINCT userId)` on the `Progress` table per courseId.
**Rationale**: Progress records exist for all learners (free + paid) immediately when they start watching. Orders only exist for paid courses after payment. Progress is the universal enrollment signal.
**Alternative considered**: Union of Progress + Orders — unnecessary complexity for the same result.

## Decision 2: Rating Eligibility
**Decision**: Reuse the same completion check used for certificate generation: all videos ≥80% watched AND quiz passed (if quizRequired).
**Rationale**: Consistent with existing business rule. Avoids two definitions of "completed."
**Alternative**: Allow rating after 80% of videos only — rejected; quiz completion is required for cert, should also be for rating.

## Decision 3: Bundle Payment Flow
**Decision**: On bundle purchase confirmation, create one PAID Order per course in the bundle using the existing payment service.
**Rationale**: Orders table already drives course access checks. No schema changes needed for access control.
**Alternative**: New BundleOrder table — unnecessary; Order table already handles it.

## Decision 4: Stats Query Strategy
**Decision**: Single endpoint with 4 parallel Prisma count queries using Promise.all.
**Rationale**: Simple, correct, and fast enough (<100ms) at current scale of ~50 courses and ~500 users.
**Alternative**: Materialized view or caching — premature optimization for current scale.

## Decision 5: CID Alternative Login
**Decision**: New endpoint `POST /auth/login-by-cid` matching User by `{hospcode, cid}`. Returns same JWT payload as normal login.
**Rationale**: Minimal change — reuses existing JWT generation. hospcode and cid already on User model.
**Alternative**: MOPH OAuth integration — out of scope (requires MOPH credentials and approval).

## Decision 6: Featured Section Layout
**Decision**: Horizontal scrollable card row above the main grid, using the same course-card design with a "แนะนำ" ribbon overlay.
**Rationale**: Matches HOSxP Marketplace "featured" pattern. Reuses existing card component to avoid duplication.
