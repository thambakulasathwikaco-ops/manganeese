import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const latStr = urlObj.searchParams.get('lat');
  const lonStr = urlObj.searchParams.get('lon');

  if (!latStr || !lonStr) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Latitude and longitude parameters are required' }));
    return;
  }

  try {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const macrostratUrl = `https://macrostrat.org/api/v2/geologic_units/map?lat=${lat}&lng=${lon}`;
    
    const fetchRes = await fetch(macrostratUrl);
    if (fetchRes.ok) {
      const data = await fetchRes.json();
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ success: { data: [] } }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Geological survey database temporarily offline' }));
  }
}
