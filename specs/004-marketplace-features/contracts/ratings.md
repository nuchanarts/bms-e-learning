# Contract: Ratings & Reviews

## GET /ratings/:courseId
**Auth**: None (public)
**Response 200**: `{ avgRating: 4.2, count: 15, reviews: [{ id, userName, rating, review, createdAt }] }`

## POST /ratings/:courseId
**Auth**: Required
**Body**: `{ rating: 4, review: "ดีมาก" }`
**Response 201/200**: `{ id, rating, review, createdAt }`
**Error 403**: "กรุณาเรียนให้จบก่อนให้คะแนน"

## DELETE /admin/ratings/:id
**Auth**: Admin required
**Response 204**: No content
