# Data Model: E-Learning Platform Enhancements

## Schema Changes

### User (existing — add fields)
```
cid        String? @unique @db.VarChar(13)   — เลขบัตรประชาชน
hospital   String? @db.VarChar(255)          — สถานพยาบาล
position   String? @db.VarChar(255)          — ตำแหน่ง
quizAttempts QuizAttempt[]
```

### Course (existing — add fields)
```
category     String?  @db.VarChar(100)       — หมวดหมู่เช่น "งานบริการผู้ป่วย"
documents    CourseDocument[]
quizQuestions QuizQuestion[]
```

### Progress (existing — add field)
```
watchedSeconds Int @default(0)               — เวลาเรียนสะสมวินาที
```

### Certificate (existing — add fields)
```
tier      CertTier? — BRONZE/SILVER/GOLD/PLATINUM
quizScore Float?    — score % ที่ผ่าน
```

### CourseDocument (NEW)
```
id        String   @id @default(uuid())
courseId  String
title     String   @db.VarChar(255)
url       String   @db.VarChar(512)
order     Int      @default(0)
course    Course   @relation(...)
```

### QuizQuestion (NEW)
```
id           String   @id @default(uuid())
courseId     String
text         String   @db.Text
options      Json     — array of 4 strings
correctIndex Int      — 0-3
order        Int      @default(0)
course       Course   @relation(...)
quizAttempts QuizAttempt[] — indirect via courseId
```

### QuizAttempt (NEW)
```
id          String   @id @default(uuid())
userId      String
courseId    String
score       Float    — percentage 0-100
passed      Boolean
answers     Json     — array of chosen indexes
attemptedAt DateTime @default(now())
updatedAt   DateTime @updatedAt
user        User     @relation(...)
course      Course   @relation(...)

@@unique([userId, courseId])  — upsert แทน insert ใหม่ทุกครั้ง
```

### CertTier (enum NEW)
```
enum CertTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}
```

## Certificate Eligibility Logic

```
isEligible(userId, courseId):
  1. allVideosCompleted = count(progress.completed=true) >= course.videos.length
  2. quizPassed = quizAttempt.passed == true  (OR course has no quiz questions)
  3. totalTime = sum(progress.watchedSeconds) >= 0  (NOTE: time threshold per course TBD — use 0 for MVP, enforce later)
  → eligible = allVideosCompleted AND quizPassed
```

**Note**: เวลา 6 ชั่วโมงเป็น platform-wide threshold จาก spec ไม่ใช่ per-course ดังนั้น MVP ยังไม่ enforce time threshold ต่อ course แต่บันทึก watchedSeconds ไว้

## Tier Calculation

```
getUserTier(userId):
  certCount = count(certificates where userId)
  activeCourseCount = count(courses where isActive=true)

  if certCount >= activeCourseCount → PLATINUM
  elif certCount >= 14 → GOLD
  elif certCount >= 10 → SILVER
  elif certCount >= 6  → BRONZE
  else → null (no tier)
```
