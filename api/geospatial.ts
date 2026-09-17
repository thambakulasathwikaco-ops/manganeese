import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const latStr = urlObj.searchParams.get('lat') || '21.5333';
  const lonStr = urlObj.searchParams.get('lon') || '79.7167';
  const radiusKm = parseInt(urlObj.searchParams.get('radius') || '10', 10);

  try {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const radiusMeters = radiusKm * 1000;

    const overpassQuery = `
      [out:json][timeout:8];
      (
        way["highway"](around:${radiusMeters},${lat},${lon});
        way["waterway"](around:${radiusMeters},${lat},${lon});
        node["place"~"city|town|village|hamlet"](around:${radiusMeters},${lat},${lon});
      );
      out count;
    `;

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (overpassRes.ok) {
      const data = await overpassRes.json();
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ elements: [] }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Geospatial service error' }));
  }
}
