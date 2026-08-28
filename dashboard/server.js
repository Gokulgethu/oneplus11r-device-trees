const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const REPO_ROOT = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Allow all preview hosts
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // API endpoint: fetch repository files for inspection
  if (pathname.startsWith('/api/file')) {
    const requestedFile = url.searchParams.get('name');
    const allowedFiles = [
      'evolution_udon.mk',
      'BoardConfig.mk',
      'BoardConfigCommon.mk',
      'device.mk',
      'evolution_udon.xml',
      'crave.yaml',
      'queue_build.sh',
      'crave.conf.sample',
      'crave_build.sh',
      'crave_run.sh',
      'ci/crave_evolution_x.yml',
      'evolution.dependencies',
      'CRAVE_BUILD_GUIDE.md'
    ];

    if (!requestedFile || !allowedFiles.includes(requestedFile)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not allowed or not found' }));
      return;
    }

    const filePath = path.join(REPO_ROOT, requestedFile);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ filename: requestedFile, content: data }));
    });
    return;
  }

  // API endpoint: build status & metadata
  if (pathname === '/api/info') {
    const info = {
      device: 'OnePlus 11R 5G (udon / CPH2487)',
      platform: 'Qualcomm Snapdragon 8+ Gen 1 (SM8475 / taro)',
      rom: 'Evolution X 12.1',
      android_version: '17 (cnb)',
      branch: 'arena/01a042ed-oneplus11r-device-trees',
      lunch_target: 'evolution_udon-userdebug',
      builder: 'Crave.io Cloud Builds',
      status: 'Device Tree Ready & Configured',
      files: [
        'evolution_udon.mk',
        'BoardConfig.mk',
        'BoardConfigCommon.mk',
        'device.mk',
        'evolution_udon.xml',
        'crave.yaml',
        'crave_build.sh',
        'crave_run.sh',
        'ci/crave_evolution_x.yml',
        'evolution.dependencies'
      ]
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info));
    return;
  }

  // Serve static files
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Evolution X Crave Builder Dashboard running on http://${HOST}:${PORT}`);
});
