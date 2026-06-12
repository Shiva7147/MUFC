const https = require('https');
const fs = require('fs');
const path = require('path');

// Safe parsing helper
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const GITHUB_PAT = process.env.GITHUB_PAT;
  const REPO_OWNER = 'Shiva7147';
  const REPO_NAME = 'MUFC';
  const FILE_PATH = 'data.json';
  const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

  // GET: Retrieve data
  if (req.method === 'GET') {
    try {
      if (GITHUB_PAT) {
        // Fetch fresh data from GitHub API to avoid Vercel edge caching
        const gitRes = await request(GITHUB_API_URL + '?ref=main', {
          headers: { 'Authorization': `token ${GITHUB_PAT}` }
        });

        if (gitRes.statusCode === 200) {
          const fileData = JSON.parse(gitRes.data);
          const decoded = Buffer.from(fileData.content, 'base64').toString('utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(decoded);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching from GitHub:', e);
    }

    // Fallback: Read local data.json included in the static build
    try {
      const localPath = path.join(process.cwd(), 'data.json');
      if (fs.existsSync(localPath)) {
        const localData = fs.readFileSync(localPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(localData);
        return;
      }
    } catch (e) {
      console.error('Error reading local file:', e);
    }

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to retrieve data' }));
    return;
  }

  // POST: Update data
  if (req.method === 'POST') {
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
        res.end(JSON.stringify({ success: false, error: 'Unauthorized: Invalid password' }));
        return;
      }

      const updatedData = body.data;
      if (!updatedData) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Bad Request: Missing data payload' }));
        return;
      }

      const jsonString = JSON.stringify(updatedData, null, 2);

      if (GITHUB_PAT) {
        // 1. Fetch current file to get SHA (required to update files in GitHub API)
        const fetchRes = await request(GITHUB_API_URL + '?ref=main', {
          headers: { 'Authorization': `token ${GITHUB_PAT}` }
        });

        let sha = null;
        if (fetchRes.statusCode === 200) {
          sha = JSON.parse(fetchRes.data).sha;
        }

        // 2. Commit updated file back to GitHub
        const commitBody = JSON.stringify({
          message: 'Update website data via Admin Dashboard',
          content: Buffer.from(jsonString).toString('base64'),
          sha: sha,
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Successfully committed to GitHub!' }));
          return;
        } else {
          console.error('Commit failed:', commitRes.statusCode, commitRes.data);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'GitHub API commit failed', details: commitRes.data }));
          return;
        }
      } else {
        // Fallback: local localStorage warning
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          localOnly: true,
          message: 'No GITHUB_PAT env variable configured on Vercel. Changes will only persist locally on this browser.'
        }));
        return;
      }
    } catch (e) {
      console.error('Error handling POST:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal Server Error', details: e.message }));
      return;
    }
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
