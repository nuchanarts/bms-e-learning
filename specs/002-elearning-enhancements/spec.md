# Feature Specification: E-Learning Platform Enhancements

**Feature Branch**: `002-elearning-enhancements`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "ระบบ E-Learning รพ.สต. ระดับประเทศ — Quiz, Time Tracking, Course Categories, Certificate Tiers, User Profile, Document Downloads, Dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — User Profile Registration with Hospital Info (Priority: P1)

เจ้าหน้าที่ รพ.สต. ลงทะเบียนสมัครสมาชิกโดยกรอกข้อมูลส่วนตัวครบถ้วน ได้แก่ ชื่อ-นามสกุล, เลขบัตรประชาชน (CID), สถานพยาบาล, ตำแหน่ง นอกเหนือจาก email และ password เพื่อให้ระบบสามารถออกใบประกาศที่ถูกต้องได้

**Why this priority**: ข้อมูลโปรไฟล์เป็นพื้นฐานของใบประกาศนียบัตรและรายงาน ถ้าไม่มีข้อมูลนี้ใบประกาศจะไม่สมบูรณ์

**Independent Test**: ทดสอบโดย register ผู้ใช้ใหม่ กรอก CID/hospital/position ระบบบันทึกและแสดงในโปรไฟล์

**Acceptance Scenarios**:

1. **Given** หน้าลงทะเบียน **When** กรอก CID ที่ไม่ใช่ตัวเลข 13 หลัก **Then** ระบบแสดง error "กรุณากรอกเลขบัตรประชาชน 13 หลัก"
2. **Given** กรอกข้อมูลครบถ้วนถูกต้อง **When** กด submit **Then** ระบบสร้างบัญชีและแสดง dashboard พร้อมข้อมูลสถานพยาบาล
3. **Given** CID ที่มีในระบบแล้ว **When** พยายาม register ด้วย CID เดิม **Then** ระบบแสดง error "เลขบัตรประชาชนนี้มีในระบบแล้ว"

---

### User Story 2 — Course Category Filtering (Priority: P1)

ผู้เรียนสามารถกรองคอร์สตามหมวดหมู่ได้ เช่น "งานบริการผู้ป่วย" หรือ "Back Office" เพื่อหาคอร์สที่ตรงกับงานของตัวเอง

**Why this priority**: หมวดหมู่ช่วยให้ผู้เรียนเลือกเรียนได้ตรงจุด และเป็น prerequisite ของ Certificate Tiers

**Independent Test**: สร้างคอร์สในหมวดต่างๆ กรอง filter ตรวจสอบว่าแสดงเฉพาะหมวดที่เลือก

**Acceptance Scenarios**:

1. **Given** มีคอร์สหลายหมวด **When** เลือก filter "งานบริการผู้ป่วย" **Then** แสดงเฉพาะคอร์สในหมวดนั้น
2. **Given** เลือก filter "ทั้งหมด" **When** ดู course list **Then** แสดงคอร์สทุกหมวด
3. **Given** admin สร้างคอร์สใหม่พร้อม category **When** ผู้เรียนกรอง filter **Then** คอร์สปรากฏใน category นั้น

---

### User Story 3 — Quiz / Assessment per Course (Priority: P1)

ผู้เรียนทำแบบทดสอบ Multiple Choice หลังเรียนจบ ต้องผ่าน ≥60% จึงมีสิทธิ์รับใบประกาศ admin CRUD คำถาม/ตัวเลือกได้ผ่าน Admin Panel

**Why this priority**: Quiz เป็นเงื่อนไขบังคับของการออกใบประกาศตาม spec

**Independent Test**: สร้าง quiz 5 ข้อ เรียนจบ ทำ quiz ผ่าน/ไม่ผ่าน → ตรวจสอบ certificate eligibility

**Acceptance Scenarios**:

1. **Given** ผู้เรียนเรียนจบคอร์สแล้ว **When** ทำ quiz ได้ ≥60% **Then** ระบบ mark quiz passed และเปิดสิทธิ์ certificate
2. **Given** ทำ quiz ได้ <60% **When** ดูผล **Then** แสดง score และ "ไม่ผ่านเกณฑ์" พร้อม option ทำซ้ำ
3. **Given** admin **When** เพิ่ม/แก้ไข/ลบคำถาม quiz ใน Admin Panel **Then** การเปลี่ยนแปลงสะท้อนทันทีใน quiz ของ course
4. **Given** ผู้เรียนที่ไม่ผ่าน quiz **When** พยายาม download certificate **Then** ระบบปฏิเสธพร้อมแจ้งต้องผ่าน quiz ก่อน

---

### User Story 4 — Learning Time Tracking (Priority: P2)

ระบบติดตามเวลาเรียนจริง (วินาที) สะสมต่อ course ต้อง ≥21,600 วินาที (6 ชั่วโมง) เป็นเงื่อนไขเพิ่มเติมในการรับใบประกาศ

**Why this priority**: Time tracking เป็น business rule สำคัญจาก spec

**Independent Test**: เล่นวิดีโอ ตรวจสอบว่าเวลาถูกสะสมและแสดงใน dashboard ถูกต้อง

**Acceptance Scenarios**:

1. **Given** ผู้เรียนกำลังดูวิดีโอ **When** ผ่านไป 60 วินาที **Then** ระบบบันทึกเวลาเพิ่ม 60 วินาทีใน total learning time
2. **Given** ผู้เรียนมีเวลาเรียนรวม <6 ชั่วโมง **When** ขอ certificate **Then** ระบบแจ้งเวลาที่ยังขาดอยู่
3. **Given** เวลาเรียนครบ 6 ชั่วโมง + quiz ผ่าน **When** ขอ cert **Then** ระบบออกใบประกาศได้

---

### User Story 5 — Certificate Tiers (Priority: P2)

ผู้เรียนได้รับ badge ระดับต่างๆ ตามจำนวน course ที่เรียนจบครบเกณฑ์: Bronze (≥6), Silver (≥10), Gold (≥14), Platinum (ครบทุก active course)

**Why this priority**: Tier เป็น gamification เพิ่ม engagement แต่ไม่กระทบ core learning flow

**Independent Test**: สร้าง user ที่มี 6 completed courses → ตรวจสอบ Bronze tier badge

**Acceptance Scenarios**:

1. **Given** ผู้เรียนเรียนจบ 6 courses **When** ดู dashboard **Then** แสดง badge "Bronze"
2. **Given** ผู้เรียนเรียนจบครบทุก active course **When** ดู dashboard **Then** แสดง badge "Platinum"
3. **Given** ผู้เรียนได้ tier ใหม่ **When** tier เพิ่มขึ้น **Then** ระบบแสดง notification ยินดีด้วย

---

### User Story 6 — Downloadable Course Documents (Priority: P2)

ผู้เรียนดาวน์โหลดเอกสาร PDF ประกอบการเรียนในแต่ละ course ได้ admin กำหนด URL เอกสารผ่าน Admin Panel

**Why this priority**: เอกสารช่วยเสริมการเรียนแต่ไม่ใช่ blocking requirement

**Independent Test**: admin เพิ่ม document URL ใน course → ผู้เรียนเห็นและ download ได้

**Acceptance Scenarios**:

1. **Given** course มีเอกสาร **When** ผู้เรียนเข้า course detail **Then** เห็นปุ่ม "ดาวน์โหลดเอกสาร" พร้อมชื่อ
2. **Given** course ไม่มีเอกสาร **When** เข้า course detail **Then** ไม่แสดงส่วนเอกสาร
3. **Given** admin **When** เพิ่ม document title + URL ใน admin panel **Then** เอกสารปรากฏใน course detail

---

### User Story 7 — Enhanced Admin Dashboard (Priority: P3)

Admin เห็น Top 5 Learners เรียงตามเวลาเรียน, completion rate รายคอร์ส, Export Excel ข้อมูลผู้เรียน

**Why this priority**: Reporting สำคัญสำหรับผู้บริหาร แต่ไม่กระทบ user learning flow

**Independent Test**: Admin login → ดู top learners และ export Excel ที่มีข้อมูลครบ

**Acceptance Scenarios**:

1. **Given** มีผู้เรียนในระบบ **When** admin ดู dashboard **Then** เห็น Top 5 learners เรียงตามเวลาเรียนรวม
2. **Given** admin **When** กด "Export Excel" **Then** ดาวน์โหลดไฟล์ .xlsx มีข้อมูลผู้เรียนทุกคน
3. **Given** admin **When** ดู course section **Then** เห็น completion rate (%) ต่อ course แต่ละตัว

---

### Edge Cases

- ผู้เรียนทำ quiz ซ้ำ — บันทึก score ล่าสุด ไม่ใช่ best score
- CID ซ้ำ — ระบบ reject ด้วย unique constraint
- Course ที่ไม่มี quiz — quiz_passed=true อัตโนมัติ ไม่บล็อก certificate
- เวลาเรียนเมื่อ seek ข้าม — นับเฉพาะ active play time
- Admin ลบ course ที่มี certificate แล้ว — certificate ยังคงอยู่ (soft delete)

## Requirements *(mandatory)*

### Functional Requirements

**User Profile**
- **FR-001**: ระบบ MUST รับ CID (13 หลัก), hospital, position ในการลงทะเบียน
- **FR-002**: ระบบ MUST validate ว่า CID เป็นตัวเลข 13 หลักและไม่ซ้ำในระบบ
- **FR-003**: ระบบ MUST แสดง hospital และ position ของผู้ใช้ใน dashboard และใบประกาศ

**Course Categories**
- **FR-004**: Course MUST มี category field ที่ admin กำหนดได้
- **FR-005**: Course list MUST สามารถ filter ตาม category ได้
- **FR-006**: Admin MUST กำหนด/แก้ไข category ของ course ได้

**Quiz Module**
- **FR-007**: Quiz MUST ประกอบด้วย multiple-choice questions 4 ตัวเลือก 1 เฉลย
- **FR-008**: ระบบ MUST คำนวณ score % และ mark passed เมื่อ ≥60%
- **FR-009**: ผู้เรียน MUST ทำ quiz ซ้ำได้ ระบบบันทึก score ล่าสุด
- **FR-010**: Admin MUST CRUD คำถาม quiz ต่อ course ได้ใน Admin Panel
- **FR-011**: Certificate eligibility MUST ตรวจสอบ quiz passed ก่อนออกใบประกาศ

**Time Tracking**
- **FR-012**: ระบบ MUST บันทึก watch time เป็นวินาทีต่อ video session
- **FR-013**: ระบบ MUST สะสม total learning seconds ต่อ course ต่อ user
- **FR-014**: Certificate eligibility MUST ตรวจสอบ total learning seconds ≥21,600

**Certificate Tiers**
- **FR-015**: ระบบ MUST คำนวณ tier จากจำนวน certificates ที่ผู้ใช้ได้รับ
- **FR-016**: Tier: Bronze ≥6, Silver ≥10, Gold ≥14, Platinum = ครบทุก active course
- **FR-017**: Dashboard MUST แสดง tier badge ปัจจุบัน

**Document Downloads**
- **FR-018**: Course MUST support เอกสาร 0-N รายการ แต่ละรายการมี title + URL
- **FR-019**: Admin MUST จัดการ (add/delete) เอกสารต่อ course
- **FR-020**: Course detail MUST แสดงปุ่ม download เฉพาะเมื่อมีเอกสาร

**Admin Dashboard**
- **FR-021**: Admin dashboard MUST แสดง Top 5 learners เรียงตาม learning time
- **FR-022**: Admin dashboard MUST แสดง completion rate ต่อ course
- **FR-023**: Admin MUST export ข้อมูลผู้เรียนทั้งหมดเป็น Excel (.xlsx)

### Key Entities

- **User**: เพิ่ม cid (unique, 13 chars), hospital, position
- **Course**: เพิ่ม category (string)
- **CourseDocument**: title, url, courseId — เอกสารประกอบ
- **QuizQuestion**: courseId, text, options (4 items), correctIndex
- **QuizAttempt**: userId, courseId, score (%), passed, attemptedAt
- **Progress**: เพิ่ม watchedSeconds — เวลาเรียนสะสมต่อ video
- **Certificate**: เพิ่ม tier (BRONZE/SILVER/GOLD/PLATINUM), quizScore

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ผู้เรียนลงทะเบียนพร้อมข้อมูลโปรไฟล์ครบถ้วนภายใน 2 นาที
- **SC-002**: ผู้เรียนกรองคอร์สตามหมวดหมู่และเข้าเรียนได้ภายใน 30 วินาที
- **SC-003**: ผู้เรียนทำ quiz เสร็จและเห็นผลทันทีภายใน 2 วินาทีหลัง submit
- **SC-004**: เวลาเรียนสะสมถูกบันทึกครบถ้วน 100% ไม่สูญหายเมื่อ reload หน้า
- **SC-005**: ระบบออกใบประกาศภายใน 3 วินาทีหลังครบเงื่อนไข
- **SC-006**: Admin export Excel ที่มีข้อมูลครบถ้วนได้ภายใน 10 วินาที
- **SC-007**: Certificate tier แสดงถูกต้อง 100% ตาม business rule

## Assumptions

- Quiz score บันทึก "ล่าสุด" ไม่ใช่ best score
- Course ที่ไม่มี quiz ถือว่า quiz passed อัตโนมัติ
- เวลาเรียนนับเฉพาะ active playback
- Document URL เป็น external link ไม่ใช่ file upload
- Tier คำนวณ real-time จากจำนวน certificates
