const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper to parse request body
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

// Helper for https request
function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'MUSCB-Admin-Dashboard',
      'Accept': 'application/vnd.github.v3+json'
    };
    options.headers = { ...defaultHeaders, ...options.headers };

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

module.exports = async (req, res) => {
  // CORS Headers
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

    // Password authorization check
    if (body.password !== 'reddevils2026') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    const { fileName, fileData } = body;
    if (!fileName || !fileData) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Bad Request: Missing fileName or fileData' }));
      return;
    }

    const GITHUB_PAT = process.env.GITHUB_PAT;
    const REPO_OWNER = 'Shiva7147';
    const REPO_NAME = 'MUFC';
    const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const relativePath = `images/${cleanFileName}`;

    if (GITHUB_PAT) {
      // Production (Vercel) -> Commit image directly to GitHub images/ directory
      const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${relativePath}`;
      
      const commitBody = JSON.stringify({
        message: `Upload image ${cleanFileName} via Admin Dashboard`,
        content: fileData, // Already base64 encoded from client
        branch: 'main'
      });

      const commitRes = await request(GITHUB_API_URL, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Content-Type': 'application/json'
        }
      }, commitBody);

      if (commitRes.statusCode === 200 || commitRes.statusCode === 201) {
        // Return raw github usercontent URL for instant availability
        const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${relativePath}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: rawUrl }));
        return;
      } else {
        console.error('GitHub Image Upload failed:', commitRes.statusCode, commitRes.data);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'GitHub API upload failed', details: commitRes.data }));
        return;
      }
    } else {
      // Local development -> Write directly to local images directory
      try {
        const localImagesDir = path.join(process.cwd(), 'images');
        if (!fs.existsSync(localImagesDir)) {
          fs.mkdirSync(localImagesDir, { recursive: true });
        }
        
        const localFilePath = path.join(localImagesDir, cleanFileName);
        const buffer = Buffer.from(fileData, 'base64');
        fs.writeFileSync(localFilePath, buffer);
        
        const localUrl = `images/${cleanFileName}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: localUrl }));
        return;
      } catch (e) {
        console.error('Local file write error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to write local file', details: e.message }));
        return;
      }
    }
  } catch (err) {
    console.error('Error handling upload:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Internal Server Error', details: err.message }));
  }
};
