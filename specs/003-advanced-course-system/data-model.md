# Data Model: Advanced Course System

## Schema Changes (Prisma)

### Role enum (replace USER → CUSTOMER + STAFF)
```prisma
enum Role {
  CUSTOMER   // บุคคลทั่วไป ต้องซื้อคอร์ส
  STAFF      // เจ้าหน้าที่ รพ.สต. เข้าเรียนฟรี
  ADMIN      // ผู้ดูแลระบบ
}
```
**Migration note**: `UPDATE User SET role = 'STAFF' WHERE role = 'USER'`

---

### User (add fields)
```prisma
positionCustom  String?  @db.VarChar(255)  // เมื่อ position = "อื่นๆ"
// position (existing) — ใช้เก็บ predefined value หรือ "อื่นๆ"
```

---

### Course (add fields)
```prisma
introVideoUrl    String?   @db.VarChar(512)    // วีดีโอแนะนำ (ไม่มีลายน้ำ)
targetPositions  String?   @db.Text            // JSON array เช่น ["พยาบาลวิชาชีพ","อื่นๆ"]
pricingType      String    @default("bundle")  // "bundle" | "per_section"
bundlePrice      Float?                        // ราคาเหมารวม (ถ้า pricingType=bundle)
expiryDays       Int       @default(0)         // 0 = ไม่หมดอายุ
passingScore     Float     @default(80)        // เกณฑ์ผ่าน post-test (%)
totalViewers     Int       @default(0)         // hidden — admin only
totalWatchHours  Float     @default(0)         // hidden — admin only
```

---

### Video (add fields)
```prisma
isIntro          Boolean  @default(false)      // true = intro video (ไม่มีลายน้ำ)
instructorName   String?  @db.VarChar(255)
instructorTitle  String?  @db.VarChar(255)
instructorAvatar String?  @db.VarChar(512)
sectionPrice     Float?                        // ราคาต่อ section (per_section pricing)
```

---

### Order (add fields)
```prisma
expiresAt           DateTime?               // purchasedAt + course.expiryDays
expiryNotified7d    Boolean  @default(false)
expiryNotified1d    Boolean  @default(false)
purchasedSections   String?  @db.Text       // JSON array ของ section names ที่ซื้อ
                                            // null = ซื้อทั้งคอร์ส (bundle)
```
**Remove**: `@@unique([userId, courseId, status])` → เปลี่ยนเป็น index เพราะ per_section อาจมี multiple orders

---

### QuizAttempt (modify)
```prisma
// Remove @@unique([userId, courseId])
// Add:
attemptNo   Int  @default(1)           // เลขครั้งที่สอบ
takenAt     DateTime @default(now())   // rename จาก attemptedAt
```
**Add index**: `@@index([userId, courseId, takenAt])`

---

## New Tables

### PostTestRegistration
```prisma
model PostTestRegistration {
  id         String   @id @default(uuid()) @db.VarChar(36)
  userId     String   @db.VarChar(36)
  courseId   String   @db.VarChar(36)
  registeredAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
  @@index([courseId])
}
```

---

## Predefined Positions List (Frontend constants)

```typescript
export const POSITIONS = [
  'นักวิชาการสาธารณสุข',
  'พยาบาลวิชาชีพ',
  'ทันตาภิบาล',
  'เจ้าพนักงานสาธารณสุข',
  'นักกายภาพบำบัด',
  'เภสัชกร',
  'แพทย์',
  'นักโภชนาการ',
  'อื่นๆ',
];
```

---

## Access Control Matrix

| Resource | CUSTOMER | STAFF | ADMIN |
|----------|----------|-------|-------|
| Intro video | ✅ | ✅ | ✅ |
| Course videos (ซื้อแล้ว) | ✅ | ✅ | ✅ |
| Course videos (ไม่ได้ซื้อ) | ❌ redirect checkout | ✅ free | ✅ |
| Post-test | ✅ (100% only) | ✅ (100% only) | ✅ |
| totalViewers/totalWatchHours | ❌ | ❌ | ✅ |
| Admin panel | ❌ | ❌ | ✅ |
