export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip')?.trim();

  if (!zip) return Response.json({ error: 'Missing zip' }, { status: 400 });

  try {
    // Geocode ZIP → lat/lon server-side (Nominatim requires a proper User-Agent)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zip)}&country=US&format=json&limit=1`,
      { headers: { 'User-Agent': 'Pillar/1.0 (https://pmpillar.com)', 'Accept-Language': 'en' } }
    );
    const geoData = (await geoRes.json()) as Array<{ lat: string; lon: string }>;
    if (!geoData[0]) return Response.json({ error: 'Location not found' }, { status: 404 });

    const { lat, lon } = geoData[0];

    // Fetch forecast from Open-Meteo
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`
    );
    const wxData = await wxRes.json();

    return Response.json(wxData, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
    });
  } catch {
    return Response.json({ error: 'Weather unavailable' }, { status: 500 });
  }
}
