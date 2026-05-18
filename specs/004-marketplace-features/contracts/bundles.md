# Contract: Bundles

## GET /bundles
**Auth**: None (public)
**Response 200**: `[{ id, name, description, price, courses: [{ id, title, price }] }]`

## POST /admin/bundles
**Auth**: Admin
**Body**: `{ name, description, price, courseIds: ["id1","id2"] }`
**Response 201**: Bundle object

## PUT /admin/bundles/:id
**Auth**: Admin
**Body**: Partial bundle fields
**Response 200**: Updated bundle

## DELETE /admin/bundles/:id
**Auth**: Admin
**Response 204**

## PUT /admin/courses/:id/featured
**Auth**: Admin
**Response 200**: `{ id, isFeatured: true }`
