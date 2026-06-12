const https = require('https');

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function makeRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const UPLOADTHING_TOKEN = 'eyJhcGlLZXkiOiJza19saXZlXzI1ZDIwZmVkMTczZGJiMGEyYWY1NGNmMDVkZWFlOGJlMmFiMWRhMzMzZWQzMzczZTYxZWUyMDE1MGU3NjNmODIiLCJhcHBJZCI6ImJkNDAyZGtoaDEiLCJyZWdpb25zIjpbInNlYTEiXX0=';
const parsedToken = JSON.parse(Buffer.from(UPLOADTHING_TOKEN, 'base64').toString('utf8'));
const UPLOADTHING_SECRET = parsedToken.apiKey;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    let body;
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      body = await parseBody(req);
    }

    if (body.password !== 'reddevils2026') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    const { fileName, fileData } = body;
    if (!fileName || !fileData) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing fileName or fileData' }));
      return;
    }

    const fileBuffer = Buffer.from(fileData, 'base64');
    const fileSize = fileBuffer.length;
    let fileType = 'image/jpeg';
    if (fileName.toLowerCase().endsWith('.png')) fileType = 'image/png';
    else if (fileName.toLowerCase().endsWith('.webp')) fileType = 'image/webp';
    else if (fileName.toLowerCase().endsWith('.gif')) fileType = 'image/gif';

    const presignedRes = await makeRequest('https://api.uploadthing.com/v7/prepareUpload', {
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

    if (presignedRes.statusCode !== 200) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'UploadThing presigned URL failed', details: presignedRes.data }));
      return;
    }

    const responseData = JSON.parse(presignedRes.data);
    const { url: uploadUrl } = responseData;

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const parts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
      `Content-Type: ${fileType}\r\n\r\n`
    ];

    const part1Buf = Buffer.from(parts.join(''), 'utf-8');
    const part2Buf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const bodyBuffer = Buffer.concat([part1Buf, fileBuffer, part2Buf]);

    const s3Res = await makeRequest(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      }
    }, bodyBuffer);

    if (s3Res.statusCode >= 200 && s3Res.statusCode < 300) {
      const uploadResult = JSON.parse(s3Res.data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, url: uploadResult.url }));
    } else {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'S3 upload failed', details: s3Res.data }));
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Internal error', details: err.message }));
  }
};