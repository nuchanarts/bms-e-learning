# Data Model: Marketplace Features

## Schema Changes

### Course (additions)
```prisma
model Course {
  // ... existing fields ...
  isFeatured   Boolean        @default(false)
  ratings      CourseRating[]
  bundleCourses BundleCourse[]
}
```

### CourseRating (new)
```prisma
model CourseRating {
  id        String   @id @default(uuid()) @db.VarChar(36)
  userId    String   @db.VarChar(36)
  courseId  String   @db.VarChar(36)
  rating    Int      // 1–5
  review    String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([courseId])
}
```

### CourseBundle (new)
```prisma
model CourseBundle {
  id          String         @id @default(uuid()) @db.VarChar(36)
  name        String         @db.VarChar(255)
  description String?        @db.Text
  price       Float
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  courses     BundleCourse[]
}
```

### BundleCourse (new — join table)
```prisma
model BundleCourse {
  bundleId String       @db.VarChar(36)
  courseId String       @db.VarChar(36)
  bundle   CourseBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)
  course   Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@id([bundleId, courseId])
}
```

## Computed Fields (not stored)

| Field | Source | Formula |
|-------|--------|---------|
| `enrollCount` | Progress table | `COUNT(DISTINCT userId) WHERE courseId = X` |
| `avgRating` | CourseRating table | `AVG(rating) WHERE courseId = X` |
| `ratingCount` | CourseRating table | `COUNT(*) WHERE courseId = X` |
| `isNew` | Course.createdAt | `createdAt >= NOW() - 30 days` |

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| CourseRating | rating | 1 ≤ rating ≤ 5 (integer) |
| CourseRating | review | Optional; max 500 characters |
| CourseRating | (userId, courseId) | Unique — one rating per user per course |
| CourseBundle | price | Must be < SUM of all included course prices |
| CourseBundle | courses | At least 2 courses required |
| Login CID | cid | Exactly 13 numeric digits |
| Login CID | hospcode | Exactly 5 numeric digits |
