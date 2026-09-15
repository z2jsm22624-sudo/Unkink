const http = require('http');
const { buildWeeklyInsightPayload } = require('./api/generate-weekly-insights');

const PORT = process.env.PORT || 3000;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'POST' && url.pathname === '/api/generate-weekly-insights') {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const userId = parsed.userId || 'demo-user';
          const payload = await buildWeeklyInsightPayload(userId);
          sendJson(res, 200, payload);
        } catch (error) {
          console.error('Weekly insight generation failed:', error);
          sendJson(res, 500, {
            error: 'Weekly insight generation failed.',
          });
        }
      });

      return;
    } catch (error) {
      console.error('Route error:', error);
      sendJson(res, 500, { error: 'Internal server error.' });
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Unkink weekly insights API running on http://localhost:${PORT}`);
});
