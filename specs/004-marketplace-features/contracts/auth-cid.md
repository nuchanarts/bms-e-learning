# Contract: Alternative Login (CID)

## POST /auth/login-by-cid
**Auth**: None (public)
**Body**: `{ hospcode: "10669", cid: "1234567890123" }`
**Response 200**: `{ token, user: { id, name, email, role, hospital, position } }`
**Error 401**: "ไม่พบบัญชีผู้ใช้ กรุณาตรวจสอบรหัสสถานพยาบาลและเลขบัตรประชาชน"
**Error 400**: "รูปแบบข้อมูลไม่ถูกต้อง"
