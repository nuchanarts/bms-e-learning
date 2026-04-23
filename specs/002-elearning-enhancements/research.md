# Research: E-Learning Platform Enhancements

## Quiz Scoring

**Decision**: Score = (correctAnswers / totalQuestions) × 100, passed = score >= 60
**Rationale**: เป็น standard ที่ใช้ใน spec และ simple ไม่มี partial credit
**Alternatives**: Weighted questions — rejected (over-engineering for this use case)

## Time Tracking

**Decision**: Save watchedSeconds per video via existing progress endpoint, สะสมใน Progress.watchedSeconds field
**Rationale**: ใช้ existing progress upsert mechanism, เพิ่มแค่ field ใหม่
**Pattern**: Frontend ส่ง heartbeat ทุก 5 วินาทีขณะ play, backend upsert watchedSeconds = max(current, incoming)
**Alternatives**: Separate time_tracking table — rejected (overkill, Progress table เพียงพอ)

## Certificate Tiers

**Decision**: คำนวณ tier real-time ใน certificateService.getUserTier(userId) จาก COUNT(certificates)
**Rationale**: Real-time ถูกต้องเสมอ ไม่ต้อง sync
**Tiers**: None(<6), Bronze(6-9), Silver(10-13), Gold(14-17), Platinum(≥ total active courses)

## Excel Export

**Decision**: ใช้ `exceljs` library สร้าง .xlsx in-memory แล้ว stream ให้ client
**Rationale**: exceljs เป็น pure JS ไม่ต้อง binary dependency, รองรับ Thai unicode ได้
**Alternatives**: csv — rejected (ไม่รองรับ Thai font ใน Excel บางเวอร์ชัน)

## CID Validation

**Decision**: Validate ว่าเป็น string ตัวเลข 13 หลัก, unique constraint ใน DB
**Rationale**: ง่าย ไม่ต้องคำนวณ checksum (เพื่อรองรับ test data)
**Note**: ไม่ validate checksum digit เพื่อให้ test data ง่าย

## Document Storage

**Decision**: เก็บแค่ URL (external link) ไม่ต้อง file upload
**Rationale**: ง่ายกว่า, ไม่ต้อง storage management, ตรงกับ spec ที่ระบุ URL

## Quiz Attempt

**Decision**: บันทึก score ล่าสุด (ไม่ใช่ best) ใน QuizAttempt, upsert on (userId, courseId)
**Rationale**: spec กำหนด, สะท้อนความรู้ปัจจุบัน
