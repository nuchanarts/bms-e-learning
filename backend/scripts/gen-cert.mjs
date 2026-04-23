import http from 'http';

async function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5501, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve(buf); } });
    });
    r.on('error', e => resolve({ error: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

const auth = await req('POST', '/auth/login', { email: 'user@bgs.local', password: 'user1234' });
const token = auth.accessToken;
const cert = await req('GET', '/certificates/d731cf43-b6d0-4593-a757-d434ea8b43db', null, token);
const fileName = cert.filePath ? cert.filePath.split('\\').pop() : 'none';
console.log('✓ cert id:', cert.id);
console.log('✓ file:', fileName);
console.log('✓ issuedAt:', cert.issuedAt);
