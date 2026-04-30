import path from 'path';
import fs from 'fs';
import { certificateRepository } from './certificate.repository';
import { progressRepository } from '../progress/progress.repository';
import { courseRepository } from '../course/course.repository';
import { quizService } from '../quiz/quiz.service';
import { trainingRecordRepository } from '../training-record/training-record.repository';
import prisma from '../../lib/prisma';

const CERTS_DIR = path.join(process.cwd(), 'certificates');

type CertTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

async function getUserTier(userId: string): Promise<CertTier | null> {
  const [certCount, activeCourseCount] = await Promise.all([
    prisma.certificate.count({ where: { userId } }),
    prisma.course.count({ where: { isActive: true } }),
  ]);
  if (activeCourseCount > 0 && certCount >= activeCourseCount) return 'PLATINUM';
  if (certCount >= 14) return 'GOLD';
  if (certCount >= 10) return 'SILVER';
  if (certCount >= 6) return 'BRONZE';
  return null;
}

async function getCertSettings() {
  const keys = [
    'cert_signer_name',
    'cert_signer_title',
    'cert_title_en',
    'cert_title_th',
    'cert_intro_text',
    'cert_org_name',
    'cert_course_label',
    'cert_left_bg_from',
    'cert_left_bg_to',
  ];
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const m: Record<string, string> = {};
  rows.forEach((r) => {
    m[r.key] = r.value;
  });
  return {
    signerName: m['cert_signer_name'] || 'ผู้อำนวยการ BGS',
    signerTitle: m['cert_signer_title'] || 'Bangkok Global Software Co., Ltd.',
    titleEn: m['cert_title_en'] || 'Certificate of Completion',
    titleTh: m['cert_title_th'] || 'ใบประกาศนียบัตร',
    introText: m['cert_intro_text'] || 'ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อรับรองว่า',
    orgName: m['cert_org_name'] || 'สื่อการสอน',
    courseLabel: m['cert_course_label'] || 'ได้ผ่านการศึกษาหลักสูตร',
    leftBgFrom: m['cert_left_bg_from'] || '#2D1B69',
    leftBgTo: m['cert_left_bg_to'] || '#6D28D9',
  };
}

function buildCertHtml(params: {
  courseTitle: string;
  userName: string;
  userPosition: string | null;
  userHospital: string | null;
  issueDate: string;
  verifyCode: string;
  signerName: string;
  signerTitle: string;
  titleEn: string;
  titleTh: string;
  introText: string;
  orgName: string;
  courseLabel: string;
  leftBgFrom: string;
  leftBgTo: string;
  thumbnailUrl?: string | null;
}) {
  const {
    courseTitle,
    userName,
    userPosition,
    userHospital,
    issueDate,
    verifyCode,
    signerName,
    signerTitle,
    titleEn,
    titleTh,
    introText,
    orgName,
    courseLabel,
    leftBgFrom,
    leftBgTo,
    thumbnailUrl,
  } = params;
  const recipientInfo = [userPosition, userHospital].filter(Boolean).join(' · ') || orgName;
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>ใบประกาศนียบัตร — ${courseTitle}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=Playfair+Display:wght@700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:#1a1035;}
body{font-family:'Sarabun',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:32px 20px;min-height:100vh;}
@page{size:A4 landscape;margin:0;}
@media print{
  html,body{background:#fff;padding:0;height:100vh;}
  .no-print{display:none!important;}
  .cert-wrap{box-shadow:none!important;border-radius:0!important;width:297mm!important;height:210mm!important;margin:0!important;}
}

/* ── wrapper ── */
.cert-wrap{
  position:relative;width:1020px;height:722px;
  background:#fff;border-radius:12px;
  box-shadow:0 32px 80px rgba(0,0,0,0.45);
  overflow:hidden;display:flex;
}

/* ── left panel ── */
.left-panel{
  width:290px;flex-shrink:0;
  background:linear-gradient(160deg,${leftBgFrom} 0%,${leftBgTo} 100%);
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:40px 28px;position:relative;overflow:hidden;
}
.left-panel::before{
  content:'';position:absolute;top:-80px;left:-80px;
  width:300px;height:300px;border-radius:50%;
  background:rgba(255,255,255,0.04);
}
.left-panel::after{
  content:'';position:absolute;bottom:-60px;right:-60px;
  width:220px;height:220px;border-radius:50%;
  background:rgba(255,255,255,0.05);
}
.emblem{
  width:110px;height:110px;border-radius:50%;
  background:rgba(255,255,255,0.12);
  border:3px solid rgba(255,255,255,0.3);
  display:flex;align-items:center;justify-content:center;
  font-size:52px;margin-bottom:22px;
  box-shadow:0 8px 32px rgba(0,0,0,0.3);
  position:relative;z-index:1;
}
.org-name{
  font-size:15px;font-weight:800;color:#fff;
  text-align:center;letter-spacing:1.5px;
  text-transform:uppercase;line-height:1.4;
  position:relative;z-index:1;
  margin-bottom:6px;
}
.org-sub{
  font-size:11px;color:rgba(255,255,255,0.6);
  text-align:center;line-height:1.5;
  position:relative;z-index:1;
}
.gold-line{
  width:60px;height:3px;
  background:linear-gradient(90deg,#F59E0B,#FCD34D,#F59E0B);
  border-radius:2px;margin:16px auto;
  position:relative;z-index:1;
}

/* ── right panel ── */
.right-panel{
  flex:1;padding:48px 56px 36px;
  display:flex;flex-direction:column;position:relative;
  background:#fff;
}

/* corner ornaments */
.corner{position:absolute;width:80px;height:80px;}
.corner svg{width:100%;height:100%;}
.corner.tl{top:12px;left:12px;}
.corner.tr{top:12px;right:12px;transform:scaleX(-1);}
.corner.bl{bottom:12px;left:12px;transform:scaleY(-1);}
.corner.br{bottom:12px;right:12px;transform:scale(-1,-1);}

/* watermark */
.watermark{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%) rotate(-30deg);
  font-size:110px;font-weight:900;
  color:rgba(109,40,217,0.04);
  white-space:nowrap;pointer-events:none;
  font-family:'Playfair Display',serif;
  user-select:none;
}

.cert-head{margin-bottom:6px;}
.cert-title-en{
  font-family:'Playfair Display',serif;
  font-size:13px;font-weight:700;
  letter-spacing:5px;text-transform:uppercase;
  color:#9CA3AF;margin-bottom:4px;
}
.cert-title-th{
  font-size:36px;font-weight:800;
  color:#1F2937;line-height:1;
  background:linear-gradient(135deg,#4C1D95,#7C3AED);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.divider-gold{
  width:100%;height:2px;
  background:linear-gradient(90deg,#F59E0B,#FCD34D,rgba(245,158,11,0.2));
  margin:14px 0;border-radius:1px;
}
.present-text{font-size:14px;color:#6B7280;margin-bottom:4px;font-style:italic;}
.recipient-name{
  font-size:38px;font-weight:800;color:#1F2937;
  line-height:1.1;margin-bottom:4px;
  font-family:'Playfair Display',serif;
}
.recipient-info{font-size:13px;color:#6B7280;margin-bottom:14px;}
.course-label{font-size:13px;color:#6B7280;font-style:italic;margin-bottom:4px;}
.course-name{
  font-size:20px;font-weight:700;color:#4C1D95;
  line-height:1.3;margin-bottom:20px;
}

/* footer row */
.footer-row{
  display:flex;align-items:flex-end;justify-content:space-between;
  margin-top:auto;padding-top:16px;
  border-top:1px solid #E5E7EB;
}
.sign-block{text-align:center;min-width:140px;}
.sign-line{width:140px;height:1px;background:#374151;margin-bottom:6px;}
.sign-name{font-size:12px;font-weight:700;color:#1F2937;}
.sign-title{font-size:10px;color:#6B7280;margin-top:2px;}
.meta-block{text-align:center;}
.meta-lbl{font-size:9px;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;}
.meta-val{font-size:12px;font-weight:700;color:#374151;}
.seal-block{
  width:72px;height:72px;border-radius:50%;
  background:linear-gradient(135deg,#4C1D95,#7C3AED);
  display:flex;align-items:center;justify-content:center;
  font-size:32px;
  box-shadow:0 4px 14px rgba(76,29,149,0.35);
  border:3px solid rgba(255,255,255,0.8);
  outline:2px solid #7C3AED;
}

/* print button */
.print-bar{
  margin-top:28px;display:flex;gap:12px;justify-content:center;
}
.btn-print{
  padding:12px 36px;border-radius:10px;font-size:15px;
  font-weight:700;cursor:pointer;border:none;
  font-family:'Sarabun',sans-serif;
  background:linear-gradient(135deg,#4C1D95,#7C3AED);
  color:#fff;box-shadow:0 4px 16px rgba(76,29,149,0.4);
  transition:opacity .2s;
}
.btn-print:hover{opacity:.88;}
.btn-close{
  padding:12px 24px;border-radius:10px;font-size:15px;
  font-weight:700;cursor:pointer;
  font-family:'Sarabun',sans-serif;
  background:#F3F4F6;color:#374151;border:1px solid #E5E7EB;
}
</style>
</head>
<body>

<div class="cert-wrap">

  <!-- left panel -->
  <div class="left-panel">
    ${
      thumbnailUrl
        ? `<img src="${thumbnailUrl}" alt="course" style="width:160px;height:160px;object-fit:cover;border-radius:12px;border:3px solid rgba(255,255,255,0.35);box-shadow:0 8px 32px rgba(0,0,0,0.35);margin-bottom:20px;position:relative;z-index:1;"/>`
        : `<div class="emblem">🏥</div>`
    }
    <div class="org-name">BGS<br/>E-Learning</div>
    <div class="gold-line"></div>
    <div class="org-sub">ระบบการเรียนรู้ออนไลน์<br/>สำหรับเจ้าหน้าที่ รพ.สต.</div>
  </div>

  <!-- right panel -->
  <div class="right-panel">

    <!-- watermark -->
    <div class="watermark">BGS</div>

    <!-- corner ornaments -->
    <div class="corner tl"><svg viewBox="0 0 80 80" fill="none"><path d="M4 76V4h72" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><path d="M4 50V4h46" stroke="#F59E0B" stroke-width="1" stroke-linecap="round" opacity=".4"/><circle cx="4" cy="4" r="4" fill="#F59E0B"/></svg></div>
    <div class="corner tr"><svg viewBox="0 0 80 80" fill="none"><path d="M4 76V4h72" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><path d="M4 50V4h46" stroke="#F59E0B" stroke-width="1" stroke-linecap="round" opacity=".4"/><circle cx="4" cy="4" r="4" fill="#F59E0B"/></svg></div>
    <div class="corner bl"><svg viewBox="0 0 80 80" fill="none"><path d="M4 76V4h72" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><path d="M4 50V4h46" stroke="#F59E0B" stroke-width="1" stroke-linecap="round" opacity=".4"/><circle cx="4" cy="4" r="4" fill="#F59E0B"/></svg></div>
    <div class="corner br"><svg viewBox="0 0 80 80" fill="none"><path d="M4 76V4h72" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><path d="M4 50V4h46" stroke="#F59E0B" stroke-width="1" stroke-linecap="round" opacity=".4"/><circle cx="4" cy="4" r="4" fill="#F59E0B"/></svg></div>

    <!-- content -->
    <div class="cert-head">
      <div class="cert-title-en">${titleEn}</div>
      <div class="cert-title-th">${titleTh}</div>
    </div>
    <div class="divider-gold"></div>

    <div class="present-text">${introText}</div>
    <div class="recipient-name">${userName}</div>
    <div class="recipient-info">${recipientInfo}</div>

    <div class="course-label">${courseLabel}</div>
    <div class="course-name">${courseTitle}</div>

    <!-- footer -->
    <div class="footer-row">
      <div class="sign-block">
        <div class="sign-line"></div>
        <div class="sign-name">${signerName}</div>
        <div class="sign-title">${signerTitle}</div>
      </div>

      <div class="seal-block">🏆</div>

      <div style="display:flex;gap:32px;">
        <div class="meta-block">
          <div class="meta-lbl">วันที่ออกใบประกาศ</div>
          <div class="meta-val">${issueDate}</div>
        </div>
        <div class="meta-block">
          <div class="meta-lbl">รหัสยืนยัน</div>
          <div class="meta-val">${verifyCode}</div>
        </div>
      </div>
    </div>

  </div><!-- /right-panel -->
</div><!-- /cert-wrap -->

<div class="print-bar no-print">
  <button class="btn-print" onclick="window.print()">🖨️ พิมพ์ / บันทึก PDF</button>
  <button class="btn-close" onclick="window.close()">✕ ปิด</button>
</div>

</body>
</html>`;
}

export const certificateService = {
  async getOrGenerate(userId: string, courseId: string) {
    const existing = await certificateRepository.findByUserAndCourse(userId, courseId);
    if (existing) return existing;

    const course = await courseRepository.findById(courseId);
    if (!course) throw Object.assign(new Error('Course not found'), { status: 404 });

    const completedCount = await progressRepository.countCompletedVideos(userId, courseId);
    if (completedCount < course.videos.length) {
      throw Object.assign(new Error('Course not completed'), { status: 403 });
    }

    const quizPassed = await quizService.isQuizPassed(userId, courseId);
    if (!quizPassed) {
      throw Object.assign(new Error('Quiz not passed'), { status: 403 });
    }

    const hasTrainingRecord = await trainingRecordRepository.existsForUserAndCourse(
      userId,
      courseId,
    );
    if (!hasTrainingRecord) {
      throw Object.assign(new Error('กรุณาบันทึกผลการปฏิบัติหลังอบรมก่อนรับใบประกาศนียบัตร'), {
        status: 403,
      });
    }

    if (!fs.existsSync(CERTS_DIR)) fs.mkdirSync(CERTS_DIR, { recursive: true });

    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, hospital: true, position: true },
    });

    const issueDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const verifyCode = userId.slice(0, 4).toUpperCase() + '-' + courseId.slice(0, 4).toUpperCase();
    const certSettings = await getCertSettings();

    const fileName = `cert_${userId}_${courseId}.html`;
    const filePath = path.join(CERTS_DIR, fileName);
    const html = buildCertHtml({
      courseTitle: course.title,
      userName: userInfo?.name ?? 'ผู้เรียน',
      userPosition: userInfo?.position ?? null,
      userHospital: userInfo?.hospital ?? null,
      issueDate,
      verifyCode,
      thumbnailUrl: (course as any).thumbnailUrl ?? null,
      ...certSettings,
    });
    fs.writeFileSync(filePath, html, 'utf-8');

    const quizAttempt = await prisma.quizAttempt.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const tier = await getUserTier(userId);
    return certificateRepository.create(
      userId,
      courseId,
      filePath,
      tier,
      quizAttempt?.score ?? null,
    );
  },

  // Always regenerates HTML with current settings — used by the download endpoint
  async downloadHtml(userId: string, courseId: string): Promise<string> {
    const cert = await this.getOrGenerate(userId, courseId);

    const [userInfo, course, certSettings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, hospital: true, position: true },
      }),
      prisma.course.findUnique({ where: { id: courseId } }),
      getCertSettings(),
    ]);

    const issueDate = new Date(cert.issuedAt).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const verifyCode = userId.slice(0, 4).toUpperCase() + '-' + courseId.slice(0, 4).toUpperCase();

    return buildCertHtml({
      courseTitle: course?.title ?? 'หลักสูตร',
      userName: userInfo?.name ?? 'ผู้เรียน',
      userPosition: userInfo?.position ?? null,
      userHospital: userInfo?.hospital ?? null,
      issueDate,
      verifyCode,
      thumbnailUrl: (course as any)?.thumbnailUrl ?? null,
      ...certSettings,
    });
  },

  async listForUser(userId: string) {
    return certificateRepository.findAllByUser(userId);
  },

  async verifyByToken(verifyToken: string) {
    return certificateRepository.findByVerifyToken(verifyToken);
  },

  getUserTier,
};
