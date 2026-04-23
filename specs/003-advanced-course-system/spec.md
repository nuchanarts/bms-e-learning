# Feature Specification: Advanced Course System

**Feature Branch**: `003-advanced-course-system`
**Created**: 2026-04-01
**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Role: Customer vs Staff vs Admin (Priority: P0)

ระบบมี 3 บทบาท:
- **CUSTOMER** — บุคคลทั่วไปที่ซื้อคอร์สเรียน (เข้าถึงคอร์สที่ซื้อแล้วเท่านั้น)
- **STAFF** — เจ้าหน้าที่ รพ.สต. ที่ได้รับสิทธิ์เรียนฟรีตามโปรแกรมองค์กร
- **ADMIN** — ผู้ดูแลระบบ จัดการคอร์ส ผู้ใช้ สถิติ

**Acceptance Scenarios**:
1. **Given** ผู้ใช้ลงทะเบียนใหม่ไม่ผ่านองค์กร **When** เลือก role ในหน้าสมัคร **Then** บัญชีถูกสร้างเป็น CUSTOMER
2. **Given** CUSTOMER **When** พยายามเข้าคอร์สที่ยังไม่ซื้อ **Then** ระบบแสดงหน้าชำระเงิน
3. **Given** STAFF **When** เข้าคอร์สที่ assign ไว้ **Then** เรียนได้ทันทีโดยไม่ต้องซื้อ
4. **Given** ADMIN **When** ดูหน้าจัดการ **Then** เห็นสถิติซ่อน (viewer count, total hours)

---

### User Story 2 — Intro Video + Target Position (Priority: P1)

Admin อัพโหลดวีดีโอแนะนำคอร์ส (intro) และกำหนดกลุ่มตำแหน่งเป้าหมาย เช่น "พยาบาลวิชาชีพ", "นักวิชาการสาธารณสุข"

**Acceptance Scenarios**:
1. **Given** หน้าคอร์ส **When** ผู้เยี่ยมชมเปิด **Then** วีดีโอแนะนำเล่นได้ก่อนซื้อ (ไม่มีลายน้ำ)
2. **Given** คอร์สมี target positions **When** แสดงหน้ารายการคอร์ส **Then** แสดง badge ตำแหน่งที่เหมาะสม
3. **Given** Admin สร้างคอร์ส **When** เลือก target positions **Then** เลือก dropdown หรือ checkbox "อื่นๆ" แล้วพิมพ์เพิ่มเองได้

---

### User Story 3 — Course Pricing: Bundle + Breakdown (Priority: P1)

คอร์สมีราคา 2 รูปแบบ:
- **เหมารวม** — ซื้อทั้งคอร์สในราคาเดียว
- **แยกย่อย** — แต่ละ section/บทมีราคาของตัวเอง ซื้อได้เฉพาะบทที่ต้องการ

**Acceptance Scenarios**:
1. **Given** คอร์สแบบเหมารวม **When** ลูกค้ากด "ซื้อคอร์ส" **Then** จ่ายราคาเดียว ได้ทุกบท
2. **Given** คอร์สแบบแยกย่อย **When** ลูกค้าเลือกบทที่ต้องการ **Then** ราคารวมคำนวณจากบทที่เลือก
3. **Given** ลูกค้าซื้อคอร์สบางบทแล้ว **When** ต้องการบทเพิ่ม **Then** ซื้อเพิ่มได้โดยไม่ต้องจ่ายซ้ำบทเดิม
4. **Given** Admin สร้างคอร์ส **When** ตั้งราคา **Then** เลือกได้ว่าเป็นแบบ bundle หรือ per-section

---

### User Story 4 — Course Expiry + Email Notification (Priority: P1)

เมื่อซื้อคอร์ส ระบบกำหนดวันหมดอายุการเข้าถึง Admin ตั้ง expiryDays ต่อคอร์ส

**Acceptance Scenarios**:
1. **Given** คอร์สมี expiryDays = 180 **When** ลูกค้าซื้อ **Then** `expiresAt = purchaseDate + 180 วัน`
2. **Given** ผู้เรียนเปิดคอร์สที่ซื้อแล้ว **When** ยังไม่หมดอายุ **Then** แสดง "เหลือ X วัน" สีส้มเมื่อ ≤ 30 วัน
3. **Given** คอร์สหมดอายุ **When** ผู้เรียนพยายามเข้า **Then** แสดงหน้า "คอร์สหมดอายุแล้ว" พร้อมปุ่มต่ออายุ
4. **Given** ถึงเวลา 7 วันก่อนหมดอายุ **When** ระบบ cron ทำงาน **Then** ส่ง email แจ้งพร้อมลิงก์ต่ออายุ
5. **Given** ถึงเวลา 1 วันก่อนหมดอายุ **When** ระบบ cron ทำงาน **Then** ส่ง email แจ้งอีกครั้ง (urgent)
6. **Given** Admin สร้างคอร์ส **When** ตั้ง expiryDays = 0 **Then** ไม่มีวันหมดอายุ (access ตลอดไป)

---

### User Story 5 — Watermark + Anti-Screen Recording (Priority: P1)

วีดีโอในคอร์สที่ซื้อแล้วมีลายน้ำแสดงชื่อผู้เรียน + วันเวลา ป้องกันการอัด/แชร์

**Acceptance Scenarios**:
1. **Given** ผู้เรียนดูวีดีโอ **When** วีดีโอเล่น **Then** ลายน้ำ "ชื่อผู้เรียน · วันเวลา" ปรากฏบนวีดีโอ ตำแหน่งสุ่ม
2. **Given** วีดีโอเล่นอยู่ **When** ระบบตรวจพบ screen capture API **Then** วีดีโอหยุดและแสดงข้อความ "ห้ามอัดหน้าจอ"
3. **Given** วีดีโอ intro (ก่อนซื้อ) **When** เล่น **Then** ไม่มีลายน้ำ
4. **Given** ลายน้ำ **When** แสดง **Then** ข้อความโปร่งแสง opacity ≤ 30% เพื่อไม่รบกวนการเรียน

---

### User Story 6 — Post-Test with 100% Completion Gate (Priority: P1)

ผู้เรียนต้องดูวีดีโอครบ 100% ก่อนทำ Post-test ระบบบันทึกทะเบียนการสอบ

**Acceptance Scenarios**:
1. **Given** ผู้เรียนดูวีดีโอ < 100% **When** พยายามเข้า Post-test **Then** ปุ่ม Post-test ถูก lock พร้อมแจ้ง "ดูวีดีโอให้ครบก่อน (X/Y บท)"
2. **Given** ผู้เรียนดูวีดีโอครบ 100% **When** กด "ทำ Post-test" **Then** ระบบสร้าง exam session และแสดงคำถาม
3. **Given** ผู้เรียนส่ง Post-test **When** ผ่านเกณฑ์ (≥ 80%) **Then** ระบบออกใบประกาศและบันทึกทะเบียน
4. **Given** ผู้เรียนส่ง Post-test **When** ไม่ผ่าน **Then** แสดงคะแนนและอนุญาตให้ทำซ้ำได้ (จำกัด 3 ครั้ง/วัน)
5. **Given** Admin **When** ดูทะเบียนสอบ **Then** เห็นรายชื่อ, คะแนน, วันเวลาสอบ, จำนวนครั้งที่สอบ

---

### User Story 7 — Instructor Info on Video (Priority: P2)

วีดีโอแต่ละบทแสดงข้อมูลวิทยากร (ชื่อ + ตำแหน่ง) ในหน้า course detail และ player

**Acceptance Scenarios**:
1. **Given** Admin อัพโหลดวีดีโอ **When** กรอกข้อมูลวิทยากร **Then** บันทึก ชื่อ-ตำแหน่ง-รูปโปรไฟล์
2. **Given** ผู้เรียนเปิดวีดีโอ **When** วีดีโอเล่น **Then** แสดง overlay วิทยากรช่วง 5 วินาทีแรก
3. **Given** หน้า course detail **When** แสดงรายการบท **Then** แต่ละบทมีชื่อวิทยากรแสดง

---

### User Story 8 — Hidden Stats (Admin Only) (Priority: P2)

สถิติที่ซ่อนจากผู้เรียน: จำนวนผู้ดูรวม, ชั่วโมงรวม, จำนวนบท

**Acceptance Scenarios**:
1. **Given** Admin เปิดหน้าจัดการคอร์ส **When** ดูรายละเอียด **Then** เห็น viewer count, total watch hours, chapter count
2. **Given** ผู้เรียนทั่วไป **When** เข้าหน้าคอร์ส **Then** ไม่เห็นข้อมูลเหล่านี้
3. **Given** Admin ดู dashboard **When** กรองตาม date range **Then** สถิติ filtered ตามช่วงเวลา

---

## Functional Requirements *(mandatory)*

### FR-1: Role Management
- FR-1.1: ระบบรองรับ 3 roles: CUSTOMER, STAFF, ADMIN
- FR-1.2: หน้าสมัครสมาชิกให้เลือก role (CUSTOMER หรือ STAFF)
- FR-1.3: CUSTOMER ต้องซื้อคอร์สก่อนเข้าเรียน
- FR-1.4: STAFF เข้าเรียนคอร์สที่ assign โดยไม่ต้องจ่าย
- FR-1.5: Admin เปลี่ยน role ของผู้ใช้ได้

### FR-2: Intro Video + Target Positions
- FR-2.1: คอร์สมี field `introVideoUrl` สำหรับวีดีโอแนะนำ
- FR-2.2: Intro video เล่นได้ก่อนซื้อ ไม่มีลายน้ำ
- FR-2.3: คอร์สมี `targetPositions[]` — เลือกจาก predefined list หรือพิมพ์ "อื่นๆ"
- FR-2.4: Predefined positions: นักวิชาการสาธารณสุข, พยาบาลวิชาชีพ, ทันตาภิบาล, เจ้าพนักงานสาธารณสุข, นักกายภาพบำบัด, เภสัชกร, แพทย์, อื่นๆ

### FR-3: Course Pricing
- FR-3.1: คอร์สมี `pricingType`: "bundle" | "per_section"
- FR-3.2: Bundle: ราคาเดียว `bundlePrice` ได้ทุก section
- FR-3.3: Per-section: แต่ละ section มี `price` ของตัวเอง
- FR-3.4: Cart รองรับการเลือก section ย่อยได้
- FR-3.5: ลูกค้าซื้อ section เพิ่มได้โดยไม่ซ้ำของเดิม

### FR-4: Course Expiry
- FR-4.1: คอร์สมี `expiryDays` (0 = ไม่หมดอายุ)
- FR-4.2: Enrollment บันทึก `expiresAt = purchasedAt + expiryDays days`
- FR-4.3: ระบบตรวจสอบ `expiresAt` ทุก request ที่เข้าวีดีโอ
- FR-4.4: แสดงวันคงเหลือ: สีเขียว (> 30 วัน), สีส้ม (≤ 30 วัน), สีแดง (≤ 7 วัน)
- FR-4.5: Cron job ส่ง email warning เมื่อ 7 วัน และ 1 วันก่อนหมดอายุ
- FR-4.6: Email template มีชื่อคอร์ส, วันหมดอายุ, ลิงก์ต่ออายุ

### FR-5: Watermark + Anti-Capture
- FR-5.1: วีดีโอที่ซื้อแล้วมี watermark overlay "ชื่อ · วันเวลา"
- FR-5.2: Watermark เคลื่อนที่สุ่มตำแหน่งทุก 15 วินาที
- FR-5.3: ตรวจสอบ Screen Capture API (`getDisplayMedia`) — หยุดวีดีโอทันที
- FR-5.4: ข้อความเตือน "ห้ามบันทึกหน้าจอ" โปร่งแสง อยู่ด้านบนวีดีโอตลอดเวลา
- FR-5.5: Intro video ไม่มี watermark

### FR-6: Post-Test
- FR-6.1: Post-test เปิดได้เมื่อ progress = 100% เท่านั้น
- FR-6.2: ระบบบันทึก `PostTestAttempt`: userId, courseId, score, attemptNo, takenAt
- FR-6.3: เกณฑ์ผ่าน ≥ 80% (Admin ตั้งค่าได้ต่อคอร์ส)
- FR-6.4: จำกัด 3 ครั้ง/วัน/คอร์ส
- FR-6.5: ผ่าน → ออกใบประกาศ + บันทึกทะเบียน
- FR-6.6: Admin ดูทะเบียนสอบทั้งหมดได้

### FR-7: Instructor Info
- FR-7.1: Video มี field: `instructorName`, `instructorTitle`, `instructorAvatar`
- FR-7.2: แสดง overlay วิทยากรช่วง 5 วินาทีแรกของวีดีโอ
- FR-7.3: หน้า course detail แสดงวิทยากรต่อแต่ละบท

### FR-8: Hidden Stats (Admin)
- FR-8.1: Course เก็บ `totalViewers` (unique users ที่เปิดคอร์ส)
- FR-8.2: Course เก็บ `totalWatchHours` (ชั่วโมงรวมทุก user)
- FR-8.3: Stats เหล่านี้ส่งเฉพาะ role ADMIN เท่านั้น
- FR-8.4: Admin dashboard แสดงสถิติรายคอร์ส กรองตาม date range ได้

---

## Key Entities *(optional)*

```
Course
  + introVideoUrl: string?
  + targetPositions: string[]
  + pricingType: "bundle" | "per_section"
  + bundlePrice: number?
  + expiryDays: number  (0 = ไม่หมดอายุ)
  + passingScore: number  (default 80)
  + totalViewers: number  (admin only)
  + totalWatchHours: number  (admin only)

CourseSection
  + price: number?  (for per_section pricing)
  + instructorName: string?
  + instructorTitle: string?
  + instructorAvatar: string?

Enrollment
  + userId: string
  + courseId: string
  + purchasedSections: string[]  (empty = all, for per_section)
  + expiresAt: Date?
  + expiryNotified7d: boolean
  + expiryNotified1d: boolean

PostTestAttempt
  + userId: string
  + courseId: string
  + score: number
  + passed: boolean
  + attemptNo: number
  + takenAt: Date
  + answers: JSON

User
  + role: "CUSTOMER" | "STAFF" | "ADMIN"
  + position: string  (from predefined list or custom)
  + positionCustom: string?  (if position = "อื่นๆ")
```

---

## Success Criteria *(mandatory)*

1. ผู้เรียนเห็นวันคงเหลือของคอร์สทุกครั้งที่เปิดหน้าคอร์ส
2. ระบบส่ง email แจ้งเตือนหมดอายุได้ภายใน 5 นาทีจากเวลาที่กำหนด
3. Post-test ไม่สามารถเข้าได้จนกว่าจะดูครบ 100% (ทดสอบได้ด้วย unit test)
4. Watermark ปรากฏบนวีดีโอทุกบทที่ซื้อแล้ว โดยไม่บล็อกเนื้อหา
5. CUSTOMER และ STAFF แยกกันชัดเจน — CUSTOMER ต้องซื้อ STAFF ไม่ต้อง
6. Admin เท่านั้นที่เห็น viewer count และ watch hours (ทดสอบด้วย role-based API test)
7. ราคาคอร์สแบบแยกย่อยคำนวณถูกต้อง ไม่มีการเก็บเงินซ้ำ

---

## Assumptions *(optional)*

- Email ส่งผ่าน SMTP service ที่มีอยู่แล้วในระบบ (หรือ nodemailer)
- Screen Capture API detection ทำงานบน Chrome/Edge เป็นหลัก ไม่รองรับ Firefox/Safari ทุกเวอร์ชัน
- Per-section pricing: ถ้าซื้อครบทุก section ราคาอาจสูงกว่า bundle (ผู้ใช้ควรเลือก bundle เอง)
- expiryDays ตั้งค่าต่อคอร์ส ไม่ใช่ต่อผู้ใช้
- Post-test questions อยู่ใน database (ใช้ Quiz system ที่มีอยู่แล้ว)
- Watermark ใช้ CSS overlay ไม่ได้ encode ลงในไฟล์วีดีโอ

---

## Out of Scope

- Video DRM (Digital Rights Management) ระดับ Hollywood
- Mobile app (iOS/Android native)
- Offline viewing
- Live streaming
- Payment gateway (ใช้ mock payment ที่มีอยู่แล้ว)
