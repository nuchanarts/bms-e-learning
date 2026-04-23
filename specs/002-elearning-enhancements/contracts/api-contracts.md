# API Contracts: E-Learning Enhancements

## User Profile

### POST /auth/register (update)
Request adds: `cid?`, `hospital?`, `position?`

### GET /auth/me (update response)
Response adds: `cid`, `hospital`, `position`

---

## Courses

### GET /courses (update response)
Each course adds: `category`

### GET /courses/:id (update response)
Adds: `category`, `documents[]`

---

## Quiz

### GET /quiz/:courseId
Response: `{ questions: [{id, text, options: string[4], order}] }` — no correctIndex exposed

### POST /quiz/:courseId/attempt
Request: `{ answers: number[] }` — array of chosen option indexes
Response: `{ score: number, passed: boolean, correctCount: number, total: number }`

### GET /quiz/:courseId/result
Response: `{ score: number, passed: boolean, attemptedAt: string } | null`

---

## Progress (update)

### POST /progress
Request adds: `watchedSeconds?: number`

---

## Admin (new routes)

### GET /admin/courses/:courseId/quiz
Response: `{ questions: [{id, text, options, correctIndex, order}] }`

### POST /admin/courses/:courseId/quiz
Request: `{ text, options: string[4], correctIndex: number, order?: number }`
Response: QuizQuestion

### PUT /admin/quiz/:questionId
Request: `{ text?, options?, correctIndex?, order? }`

### DELETE /admin/quiz/:questionId
Response: 204

### POST /admin/courses/:courseId/documents
Request: `{ title, url, order? }`
Response: CourseDocument

### DELETE /admin/documents/:documentId
Response: 204

### GET /admin/analytics (update response)
Adds: `topLearners: [{name, hospital, totalSeconds, certCount}]`, `courseCompletionRates: [{courseId, title, rate}]`

### GET /admin/export/excel
Response: Binary .xlsx stream
Headers: Content-Disposition: attachment; filename="learners.xlsx"
