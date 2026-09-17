import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage & { query?: any; body?: any }, res: ServerResponse & { status?: any; json?: any }) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action') || 'geocode';
  const query = urlObj.searchParams.get('q') || '';
  const latStr = urlObj.searchParams.get('lat');
  const lonStr = urlObj.searchParams.get('lon');

  try {
    if (action === 'reverse' && latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'MoilSmartMineAI/1.0' }
      });
      if (response.ok) {
        const data = await response.json();
        res.statusCode = 200;
        res.end(JSON.stringify(data));
        return;
      }
    }

    if (query) {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'MoilSmartMineAI/1.0' }
      });
      if (response.ok) {
        const data = await response.json();
        res.statusCode = 200;
        res.end(JSON.stringify(data));
        return;
      }
    }

    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing parameters or invalid query' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Location service error' }));
  }
}
