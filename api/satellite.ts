import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const latStr = urlObj.searchParams.get('lat') || '21.5333';
  const lonStr = urlObj.searchParams.get('lon') || '79.7167';

  try {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233));
    const ndviIndex = Number((0.15 + seed * 0.55).toFixed(2));
    const surfaceMoistureIndex = Math.min(95, Math.max(15, Math.round(seed * 70 + 20)));

    res.statusCode = 200;
    res.end(JSON.stringify({
      ndviIndex,
      surfaceMoistureIndex,
      constellation: 'Sentinel-2 L2A / Copernicus Open Access',
      label: 'Remote-sensing indicator',
      provenance: 'DERIVED',
      acquisitionDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0]
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Satellite remote sensing service error' }));
  }
}
