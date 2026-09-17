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
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&hourly=relative_humidity_2m,soil_moisture_0_to_1cm&timezone=auto`;

    const fetchRes = await fetch(openMeteoUrl);
    if (!fetchRes.ok) {
      res.statusCode = fetchRes.status;
      res.end(JSON.stringify({ error: 'Weather data temporarily unavailable' }));
      return;
    }

    const data = await fetchRes.json();
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (err: any) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Weather data temporarily unavailable' }));
  }
}
