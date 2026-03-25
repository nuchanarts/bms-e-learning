import { google } from 'googleapis';
import { adminService } from './admin.service';

function getAuth() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) {
    throw Object.assign(new Error('GOOGLE_SHEETS_CREDENTIALS not configured'), { status: 503 });
  }
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

export const sheetsService = {
  async exportKPI() {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      throw Object.assign(new Error('GOOGLE_SHEETS_ID not configured'), { status: 503 });
    }

    const analytics = await adminService.getAnalytics();
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      ['วันที่/เวลา', 'ผู้ใช้ทั้งหมด', 'คอร์สทั้งหมด', 'ใบประกาศนียบัตร', 'คอร์สที่มีผู้เรียนจบ'],
      [
        now,
        analytics.totalUsers,
        analytics.totalCourses,
        analytics.certificatesIssued,
        analytics.completedProgressCount,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'KPI!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return { exported: true, timestamp: now, spreadsheetId };
  },
};
