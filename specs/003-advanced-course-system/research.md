# Research: Advanced Course System

## Screen Capture Detection

**Decision**: ใช้ `navigator.mediaDevices.getDisplayMedia` event interception + `document.addEventListener('visibilitychange')` เพื่อตรวจจับ screen share
**Rationale**: Screen Capture API ต้องขอ permission ก่อน ซึ่งสามารถ intercept ได้ ก่อน getUserMedia/getDisplayMedia จะ resolve
**Alternatives**: CSS `mix-blend-mode: difference` (ทำให้วีดีโอสีพลิก แต่ UX แย่), DRM (ซับซ้อนเกินไป)
**Limitation**: ใช้ได้เฉพาะ Chromium-based browsers (Chrome 72+, Edge)

## Watermark Approach

**Decision**: CSS overlay div ที่ลอยเหนือ video player ทำ `pointer-events: none`
**Rationale**: ไม่ต้อง encode วีดีโอใหม่, ไม่เพิ่ม storage, deploy ทันที
**Position randomization**: setInterval ทุก 15 วินาที เปลี่ยน top/left ด้วย random %
**Limitation**: CSS watermark สามารถ bypass ได้ด้วย DevTools — แต่เป็น deterrent ที่เพียงพอสำหรับ use case นี้

## Email Notification

**Decision**: ใช้ Nodemailer (มีอยู่แล้วใน stack) + cron job ด้วย `node-cron`
**Rationale**: Simple, ไม่ต้องการ external service ใหม่
**Cron schedule**: ทำงานทุกวันเวลา 08:00 ตรวจสอบ enrollments ที่จะหมดใน 7 และ 1 วัน
**Template**: HTML email พร้อม inline CSS

## Role Model

**Decision**: เพิ่ม Role enum: `CUSTOMER | STAFF | ADMIN`
- `USER` เดิม → migrate เป็น `STAFF` (เจ้าหน้าที่ รพ.สต.)
- `CUSTOMER` = บุคคลทั่วไปที่ต้องซื้อคอร์ส
**Rationale**: แยก business logic ชัดเจน — STAFF ได้รับ free access, CUSTOMER ต้องจ่าย

## Per-Section Pricing

**Decision**: เพิ่ม `pricingType` ใน Course + `sectionPrice` ใน Video (group by section name)
**Rationale**: Video มี `section` field อยู่แล้ว ใช้เป็น grouping key ได้
**Order model**: เพิ่ม `purchasedSections JSON` เก็บ section names ที่ซื้อ

## Post-Test Gating

**Decision**: backend ตรวจสอบ `COUNT(completed videos) / total videos = 100%` ก่อนอนุญาต
**Current QuizAttempt**: มี `@@unique([userId, courseId])` — ต้องลบออก เพิ่ม `attemptNo`
**Rate limiting**: เก็บจำนวน attempts วันนี้ใน DB ตรวจสอบ `takenAt >= start_of_today`

## Course Expiry

**Decision**: เพิ่ม `expiresAt` ใน Order/Enrollment, ตรวจทุก video access request
**Grace period**: ไม่มี — หมดอายุตรงวันเลย
**Renewal**: ระบบส่ง email + redirect ไปหน้า checkout
