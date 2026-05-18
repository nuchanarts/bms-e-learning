# API Contracts: Advanced Course System

## Course Endpoints

### GET /api/courses/:id
**Response additions** (role-aware):
```json
{
  "introVideoUrl": "string | null",
  "targetPositions": ["string"],
  "pricingType": "bundle | per_section",
  "bundlePrice": "number | null",
  "expiryDays": 180,
  "passingScore": 80,
  // Admin only:
  "totalViewers": 342,
  "totalWatchHours": 1024.5
}
```

### PUT /api/admin/courses/:id (Admin)
```json
{
  "introVideoUrl": "string?",
  "targetPositions": ["string"],
  "pricingType": "bundle | per_section",
  "bundlePrice": 990,
  "expiryDays": 180,
  "passingScore": 80
}
```

---

## Video Endpoints

### PUT /api/admin/videos/:id (Admin)
```json
{
  "isIntro": false,
  "instructorName": "ผศ.ดร.สมใจ ใจดี",
  "instructorTitle": "อาจารย์คณะสาธารณสุขศาสตร์",
  "instructorAvatar": "https://...",
  "sectionPrice": 299
}
```

---

## Enrollment / Access

### GET /api/enrollments/my
```json
[{
  "courseId": "uuid",
  "courseTitle": "string",
  "expiresAt": "2026-10-01T00:00:00Z | null",
  "daysRemaining": 183,
  "purchasedSections": ["section1", "section2"] // null = all
}]
```

### GET /api/courses/:id/access-check
```json
{
  "hasAccess": true,
  "reason": "purchased | staff_free | expired | not_purchased",
  "expiresAt": "ISO date | null",
  "daysRemaining": 45
}
```

---

## Post-Test

### GET /api/courses/:id/posttest/eligibility
```json
{
  "eligible": false,
  "reason": "incomplete_videos | already_registered | eligible",
  "progressPercent": 87,
  "totalVideos": 12,
  "completedVideos": 10,
  "attemptsToday": 1,
  "maxAttemptsPerDay": 3
}
```

### POST /api/courses/:id/posttest/register
```json
// Request: {}
// Response:
{ "registered": true, "registeredAt": "ISO date" }
```

### POST /api/courses/:id/posttest/submit
```json
// Request:
{ "answers": [0, 2, 1, 3, ...] }
// Response:
{
  "score": 85.5,
  "passed": true,
  "attemptNo": 1,
  "certificateId": "uuid | null"
}
```

### GET /api/admin/courses/:id/posttest/register-list (Admin)
```json
[{
  "userId": "uuid",
  "userName": "string",
  "registeredAt": "ISO date",
  "latestScore": 85.5,
  "totalAttempts": 2,
  "passed": true
}]
```

---

## User Profile

### PUT /api/users/me/profile
```json
{
  "position": "พยาบาลวิชาชีพ | อื่นๆ",
  "positionCustom": "ผู้ช่วยพยาบาล" // required when position = "อื่นๆ"
}
```

---

## Email Notifications (Internal cron — no HTTP endpoint)

Triggered by cron `0 8 * * *`:
- Find orders where `expiresAt BETWEEN NOW() AND NOW() + 7 days AND expiryNotified7d = false`
- Find orders where `expiresAt BETWEEN NOW() AND NOW() + 1 day AND expiryNotified1d = false`
- Send email, mark flag
