// seed-courses.mjs — adds BGS courses + videos via API
import http from 'http';

const BASE = 'http://localhost:5501';

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5501,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch { resolve(buf); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Login
  const auth = await request('POST', '/auth/login', {
    email: 'admin@bgs.local',
    password: 'admin1234',
  });
  const token = auth.accessToken;
  console.log('✓ Logged in as admin');

  const courses = [
    {
      title: 'เวชระเบียน',
      description: 'การบันทึกข้อมูลผู้ป่วยในระบบเวชระเบียน',
      videos: [
        { title: 'การบันทึกข้อมูลทั่วไป', url: 'https://www.youtube.com/watch?v=RKje_mDM9SE' },
        { title: 'การบันทึกสิทธิการรักษา', url: 'https://www.youtube.com/watch?v=0qL6sPP5lX0' },
        { title: 'การบันทึกส่งตรวจ ในหน้าจอส่งตรวจผู้ป่วย', url: 'https://www.youtube.com/watch?v=46coNCIhyHw' },
        { title: 'การบันทึกการแพ้ยา', url: 'https://www.youtube.com/watch?v=sMzrzhkZ3Eo' },
        { title: 'การบันทึกโรคประจำตัว', url: 'https://www.youtube.com/watch?v=CsrfM1u2rKs' },
        { title: 'การบันทึก Audit', url: 'https://www.youtube.com/watch?v=RfP7VRdMVFA' },
        { title: 'การบันทึกการพิมพ์เอกสาร', url: 'https://www.youtube.com/watch?v=JPugPQN8oew' },
        { title: 'การบันทึกการนัดหมาย', url: 'https://www.youtube.com/watch?v=ee1v9ytnVWc' },
        { title: 'การบันทึกข้อมูลปกปิด', url: 'https://www.youtube.com/watch?v=TLdwaJwFgqY' },
        { title: 'การบันทึกการแพ้อาหาร', url: 'https://www.youtube.com/watch?v=3iNdPU_E68Q' },
        { title: 'การบันทึกสถานะพิเศษ', url: 'https://www.youtube.com/watch?v=2BOaZTIJgSQ' },
      ],
    },
    {
      title: 'One Stop Service',
      description: 'การบันทึกข้อมูลในหน้าจอ One Stop Service',
      videos: [
        { title: 'การบันทึกการคัดกรอง', url: 'https://www.youtube.com/watch?v=HHaRCcChl7M' },
        { title: 'การบันทึกประวัติ', url: 'https://www.youtube.com/watch?v=eYHPGMN1bvk' },
        { title: 'การบันทึกตรวจร่างกาย', url: 'https://www.youtube.com/watch?v=cuociSljymA' },
        { title: 'การบันทึกหัตถการ', url: 'https://www.youtube.com/watch?v=SdLNWFWEKNg' },
        { title: 'การบันทึกวินิจฉัย', url: 'https://www.youtube.com/watch?v=lxJfFDDszIY' },
        { title: 'การบันทึกสั่งยา', url: 'https://www.youtube.com/watch?v=yvkA1PSuOzM' },
        { title: 'การลงข้อมูลนัดหมาย', url: 'https://www.youtube.com/watch?v=11yfhOrrH-w' },
        { title: 'การบันทึกการตรวจ Lab', url: 'https://www.youtube.com/watch?v=3hCz00Brkh4' },
        { title: 'การบันทึกทันตกรรม', url: 'https://www.youtube.com/watch?v=ssERxbBlu5A' },
        { title: 'การบันทึกแพทย์แผนไทย', url: 'https://www.youtube.com/watch?v=xRUAG3GzDDs' },
        { title: 'การบันทึกวัคซีน', url: 'https://www.youtube.com/watch?v=5MJfPxKkpBs' },
        { title: 'การบันทึกใบรับรอง', url: 'https://www.youtube.com/watch?v=wKuqRP0oaxw' },
        { title: 'การบันทึกโรคเรื้อรัง', url: 'https://www.youtube.com/watch?v=HljRnzjWBFc' },
        { title: 'งานป้องกันโรค', url: 'https://www.youtube.com/watch?v=IODVWMWNUyM' },
        { title: 'การบันทึกการส่งตัว', url: 'https://www.youtube.com/watch?v=UHran8J4h2c' },
        { title: 'การลงข้อมูลการเงิน', url: 'https://www.youtube.com/watch?v=0z7l_oT0vxU' },
      ],
    },
    {
      title: 'ระบบงานส่งเสริมสุขภาพ',
      description: 'ระบบงานส่งเสริมสุขภาพ',
      videos: [],
    },
    {
      title: 'ระบบงานบัญชี',
      description: 'ระบบงานบัญชี',
      videos: [
        { title: 'ระบบงานบัญชี บทที่ 1', url: 'https://www.youtube.com/watch?v=uwhbLl7ZWjc' },
        { title: 'ระบบงานบัญชี บทที่ 2', url: 'https://www.youtube.com/watch?v=2uG44WW0muU' },
        { title: 'ระบบงานบัญชี บทที่ 3', url: 'https://www.youtube.com/watch?v=HEeQKv0qf_Q' },
        { title: 'ระบบงานบัญชี บทที่ 4', url: 'https://www.youtube.com/watch?v=fHYFmargeaw' },
        { title: 'ระบบงานบัญชี บทที่ 5', url: 'https://www.youtube.com/watch?v=2kAM6Ke2Sds' },
        { title: 'ระบบงานบัญชี บทที่ 7', url: 'https://www.youtube.com/watch?v=bUioTenzL9Q' },
        { title: 'ระบบงานบัญชี บทที่ 8', url: 'https://www.youtube.com/watch?v=49Des6xUDOU' },
      ],
    },
    {
      title: 'ระบบงานคลังสินค้า',
      description: 'ระบบงานคลังสินค้า',
      videos: [
        { title: 'ระบบงานคลังสินค้า', url: 'https://www.youtube.com/watch?v=Dsa2xVruY3o' },
      ],
    },
    {
      title: 'การตั้งค่าระบบ',
      description: 'การตั้งค่าระบบและหน่วยบริการ',
      videos: [
        { title: 'การตั้งค่าหน่วยบริการ (Organization)', url: 'https://www.youtube.com/watch?v=mi3lAw5LmFk' },
        { title: 'การตั้งค่าหน่วยบริการ (Medical Expenses)', url: 'https://www.youtube.com/watch?v=13MNrEvBuJQ' },
      ],
    },
  ];

  for (const course of courses) {
    const created = await request('POST', '/admin/courses', {
      title: course.title,
      description: course.description,
      price: null,
    }, token);
    console.log(`✓ Course: ${course.title} [${created.id}]`);

    for (let i = 0; i < course.videos.length; i++) {
      const v = course.videos[i];
      await request('POST', `/admin/courses/${created.id}/videos`, {
        title: v.title,
        url: v.url,
        duration: 600,
        order: i + 1,
      }, token);
      console.log(`  ↳ ${i + 1}. ${v.title}`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
