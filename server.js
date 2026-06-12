const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname);
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Intercept API routes for local development
  if (urlPath === '/api/data') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'GET') {
      const dbPath = path.join(ROOT, 'data.json');
      fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to read database file' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          
          if (payload.password !== 'reddevils2026') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
          }

          const dbPath = path.join(ROOT, 'data.json');
          fs.writeFile(dbPath, JSON.stringify(payload.data, null, 2), 'utf8', (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Failed to write database file' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Successfully saved to local disk!' }));
          });
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // Intercept upload API route for local development
  if (urlPath === '/api/upload') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          if (payload.password !== 'reddevils2026') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
          }
          const { fileName, fileData } = payload;
          if (!fileName || !fileData) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Missing fileName or fileData' }));
            return;
          }
          
          // Call UploadThing S3 API
          const fileBuffer = Buffer.from(fileData, 'base64');
          const fileSize = fileBuffer.length;
          let fileType = 'image/jpeg';
          if (fileName.toLowerCase().endsWith('.png')) fileType = 'image/png';
          else if (fileName.toLowerCase().endsWith('.webp')) fileType = 'image/webp';
          
          const UPLOADTHING_TOKEN = 'eyJhcGlLZXkiOiJza19saXZlXzI1ZDIwZmVkMTczZGJiMGEyYWY1NGNmMDVkZWFlOGJlMmFiMWRhMzMzZWQzMzczZTYxZWUyMDE1MGU3NjNmODIiLCJhcHBJZCI6ImJkNDAyZGtoaDEiLCJyZWdpb25zIjpbInNlYTEiXX0=';
          const parsedToken = JSON.parse(Buffer.from(UPLOADTHING_TOKEN, 'base64').toString('utf8'));
          const UPLOADTHING_SECRET = parsedToken.apiKey;
          
          const https = require('https');
          const makeUTRequest = (url, opts, pData) => {
            return new Promise((resolve, reject) => {
              const r = https.request(url, opts, (rs) => {
                let d = '';
                rs.on('data', c => { d += c; });
                rs.on('end', () => resolve({ statusCode: rs.statusCode, data: d }));
              });
              r.on('error', e => reject(e));
              if (pData) r.write(pData);
              r.end();
            });
          };

          const presigned = await makeUTRequest('https://api.uploadthing.com/v7/prepareUpload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-uploadthing-api-key': UPLOADTHING_SECRET,
              'x-uploadthing-version': '7.7.4'
            }
          }, JSON.stringify({
            fileName: fileName,
            fileSize: fileSize,
            fileType: fileType,
            acl: 'public-read'
          }));

          if (presigned.statusCode !== 200) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'UploadThing failed', details: presigned.data }));
            return;
          }

          const { url: uploadUrl } = JSON.parse(presigned.data);

          const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
          const parts = [
            `--${boundary}\r\n`,
            `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
            `Content-Type: ${fileType}\r\n\r\n`
          ];

          const t1 = Buffer.from(parts.join(''), 'utf-8');
          const t2 = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
          const utBuffer = Buffer.concat([t1, fileBuffer, t2]);

          const s3Result = await makeUTRequest(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': utBuffer.length
            }
          }, utBuffer);

          if (s3Result.statusCode >= 200 && s3Result.statusCode < 300) {
            const uploadResult = JSON.parse(s3Result.data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, url: uploadResult.url }));
          } else {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'S3 failed', details: s3Result.data }));
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🔴 MUSCB Website v2 — Old Trafford Edition`);
  console.log(`📍 Running at: http://localhost:${PORT}`);
  console.log(`📸 Instagram: @muscbengaluru\n`);
});
