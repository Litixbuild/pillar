export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip')?.trim();

  if (!zip) return Response.json({ error: 'Missing zip' }, { status: 400 });

  try {
    // ZIP → lat/lon via zippopotam.us (purpose-built for US postal codes, no auth required)
    const geoRes = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
    if (!geoRes.ok) return Response.json({ error: 'ZIP not found' }, { status: 404 });

    const geoData = (await geoRes.json()) as { places?: Array<{ latitude: string; longitude: string }> };
    const place = geoData.places?.[0];
    if (!place) return Response.json({ error: 'ZIP not found' }, { status: 404 });

    // Fetch forecast from Open-Meteo
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,apparent_temperature,weather_code` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`
    );
    if (!wxRes.ok) return Response.json({ error: 'Forecast unavailable' }, { status: 502 });

    const wxData = await wxRes.json();

    return Response.json(wxData, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300' },
    });
  } catch {
    return Response.json({ error: 'Weather unavailable' }, { status: 500 });
  }
}
