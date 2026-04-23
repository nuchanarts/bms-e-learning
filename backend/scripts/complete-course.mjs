import http from 'http';

const COURSE_ID = 'd731cf43-b6d0-4593-a757-d434ea8b43db';
const VIDEO_IDS = [
  '8d189d9e-0492-4ace-a53b-32f1db6a02c8',
  '63a18aec-e932-41ad-9984-a084bd0574f3',
  '0effc574-ec10-4726-a5f5-b904e0e5f281',
  'c207f20e-f922-4b73-9ce4-3016a2d48856',
  '3db3a79b-562a-4f51-b7bd-ef1113874050',
  '6edadd81-4576-4d63-85c3-9c89e8e2462c',
  'e6db1084-9558-4f86-b43b-5c49816ccd8f',
  '9ecc979f-e4e0-4c5c-871f-3ffdcbc7f5da',
  '5aac51be-55e7-439a-b0d2-406fbd6fed38',
  '4adff199-7dad-4bec-9919-a4647c110278',
  '953cab4e-fc7a-432c-976c-47729843041c',
];

async function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5501, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve(buf); } });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const auth = await req('POST', '/auth/login', { email: 'user@bgs.local', password: 'user1234' });
  const token = auth.accessToken;
  console.log('✓ Login:', auth.user.name);

  // Mark all videos 100% watched
  for (const vid of VIDEO_IDS) {
    const res = await req('POST', '/progress', {
      videoId: vid,
      courseId: COURSE_ID,
      percent: 100,
      watchedSeconds: 600,
    }, token);
    process.stdout.write('.');
  }
  console.log('\n✓ ดูครบ', VIDEO_IDS.length, 'วิดีโอ');

  // Check dashboard to confirm course completed
  const dash = await req('GET', '/dashboard', null, token);
  const course = dash.courses?.find(c => c.id === COURSE_ID);
  console.log('✓ Course progress:', course?.progressPercent + '%', '| completed:', course?.isCompleted);

  // Check certificates
  const certs = await req('GET', '/certificates', null, token);
  console.log('✓ Certificates:', JSON.stringify(certs, null, 2));
}

main().catch(console.error);
