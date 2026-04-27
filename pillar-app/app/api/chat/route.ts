import { GoogleGenerativeAI } from "@google/generative-ai";

function looksLikeIndoorQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return (
    m.includes('indoor') ||
    m.includes('inside') ||
    m.includes('rainy') ||
    m.includes('rain')
  );
}

function looksLikeMoreOptionsRequest(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return (
    m.includes('other options') ||
    m.includes('more options') ||
    m.includes('something else') ||
    m.includes('different options') ||
    m.includes('another option') ||
    m.includes('others')
  );
}

function normalizePlaceKey(p: PlaceResult): string {
  const id = (p.placeId || '').trim();
  if (id) return `id:${id}`;
  return `name:${(p.name || '').trim().toLowerCase()}`;
}

function rotate<T>(arr: T[], offset: number): T[] {
  const a = arr.slice();
  if (!a.length) return a;
  const n = ((offset % a.length) + a.length) % a.length;
  return a.slice(n).concat(a.slice(0, n));
}

function takeUniquePlaces(
  candidates: PlaceResult[],
  used: Set<string>,
  max: number
): PlaceResult[] {
  const out: PlaceResult[] = [];
  for (const p of candidates) {
    const k = normalizePlaceKey(p);
    if (!p.name || used.has(k)) continue;
    used.add(k);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}

import { getPropertyBySlug } from "@/lib/airtable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OverloadedError = {
  code: "OVERLOADED";
  message: string;
  retryAfterMs: number;
};

type ChatRequestBody = {
  message: string;
  slug: string;
  variant?: number;
};

type LatLng = { lat: number; lng: number };

type PlaceResult = {
  placeId?: string;
  name: string;
  formattedAddress?: string;
  types?: string[];
  phone?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  rating?: number;
};

type ChatOkResponse =
  | { kind: "text"; response: string; model: string }
  | { kind: "wifi"; wifiName: string; wifiPassword: string; model: string }
  | { kind: "phone"; phoneNumber: string; model: string }
  | {
      kind: "property";
      address: string;
      zip: string;
      houseRules: string;
      managerPhone: string;
      wifiName: string;
      model: string;
    }
  | {
      kind: "itinerary";
      intro: string;
      sections: Array<{
        title: string;
        places: Array<{
          name: string;
          blurb?: string;
          phone?: string;
          googleMapsUri?: string;
        }>;
      }>;
      model: string;
    }
  | {
      kind: "places";
      places: Array<{
        name: string;
        cuisine?: string;
        formattedAddress?: string;
        phone?: string;
        websiteUri?: string;
        googleMapsUri?: string;
        rating?: number;
      }>;
      model: string;
    }
  | { kind: "weather"; summary: string; model: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOverloadedError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e || ""))
    .toLowerCase()
    .trim();

  return (
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit") ||
    msg.includes("overloaded") ||
    msg.includes("temporarily") ||
    msg.includes("retry") ||
    msg.includes("429") ||
    msg.includes("503")
  );
}

async function withOverloadRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = Math.max(
    1,
    Number(process.env.CHAT_RETRY_MAX_ATTEMPTS || 3)
  );
  const baseDelayMs = Math.max(
    0,
    Number(process.env.CHAT_RETRY_BASE_DELAY_MS || 700)
  );
  const maxDelayMs = Math.max(
    baseDelayMs,
    Number(process.env.CHAT_RETRY_MAX_DELAY_MS || 5000)
  );

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isOverloadedError(e) || attempt === maxAttempts) break;

      const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const jitter = Math.floor(Math.random() * 250);
      await sleep(exp + jitter);
    }
  }

  throw lastErr;
}

function requireGeminiApiKey(): string {
  const v = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!v) {
    throw new Error(
      "Gemini API key must be set. Add GEMINI_API_KEY (preferred) or GOOGLE_API_KEY to .env.local"
    );
  }
  return v;
}

function requireGooglePlacesApiKey(): string {
  const v = (
    process.env.GOOGLE_PLACES_API_KEY ||
    // Common alternate naming on hosts like Netlify/Vercel.
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_PLATFORM_API_KEY ||
    ""
  ).trim();

  if (!v) {
    throw new Error(
      "Missing Google Places key. Set GOOGLE_PLACES_API_KEY (recommended). If deployed (e.g. Netlify), add it in your host's Environment Variables; .env.local is not deployed."
    );
  }

  return v;
}

function getPinnedGeminiModelId(): string {
  return (process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash").trim();
}

function getVertexApiKey(): string | null {
  const v = process.env.VERTEX_API_KEY?.trim();
  return v || null;
}

function getVertexModelId(): string {
  return (process.env.VERTEX_MODEL?.trim() || "gemini-2.5-flash-lite").trim();
}

async function vertexGenerateContent(opts: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  userText: string;
}): Promise<string> {
  const url =
    `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(opts.model)}:generateContent` +
    `?key=${encodeURIComponent(opts.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        role: "system",
        parts: [{ text: opts.systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: opts.userText }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Vertex generateContent failed (HTTP ${res.status}): ${body.slice(0, 300)}`
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
    "";
  return text.trim();
}

function looksLikeLocalBusinessQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return [
    "itinerary",
    "plan a day",
    "plan my day",
    "nearby",
    "near me",
    "around here",
    "local",
    "restaurant",
    "breakfast",
    "brunch",
    "lunch",
    "dinner",
    "coffee",
    "bar",
    "bike",
    "rent",
    "rental",
    "pharmacy",
    "grocery",
    "spa",
    "gym",
    "museum",
    "shopping",
    "things to do",
  ].some((k) => m.includes(k));
}

function looksLikeDayPlanQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  // If the guest explicitly asks for a day plan / itinerary, or requests multiple meal stops + activities,
  // we should NOT use the single-query fast-path.
  const explicit =
    m.includes("itinerary") ||
    m.includes("plan a day") ||
    m.includes("plan my day") ||
    m.includes("day plan") ||
    m.includes("full day");

  const mealHits = ["breakfast", "brunch", "lunch", "dinner"].filter((k) =>
    m.includes(k)
  ).length;
  const wantsActivities =
    m.includes("things to do") ||
    m.includes("activities") ||
    m.includes("what should we do") ||
    m.includes("what to do") ||
    m.includes("day") ||
    m.includes("afternoon");

  return explicit || (mealHits >= 2 && wantsActivities);
}

type MealIntent = "breakfast" | "brunch" | "lunch" | "dinner" | null;

function getMealIntent(userMessage: string): MealIntent {
  const m = userMessage.toLowerCase();
  if (m.includes("brunch")) return "brunch";
  if (m.includes("breakfast")) return "breakfast";
  if (m.includes("lunch")) return "lunch";
  if (m.includes("dinner") || m.includes("supper")) return "dinner";
  return null;
}

function shapePlacesQuery(userMessage: string, property: { PropertyZipCode: string; PropertyAddress: string }) {
  const meal = getMealIntent(userMessage);
  const base = `${userMessage} near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  if (!meal) return base;

  // Bias toward the right kind of result from Places.
  if (meal === "dinner") return `${userMessage} dinner restaurant`.trim() + ` near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  if (meal === "lunch") return `${userMessage} lunch restaurant`.trim() + ` near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  if (meal === "breakfast") return `${userMessage} breakfast`.trim() + ` near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  if (meal === "brunch") return `${userMessage} brunch`.trim() + ` near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  return base;
}

function filterPlacesForIntent(userMessage: string, places: PlaceResult[]): PlaceResult[] {
  const meal = getMealIntent(userMessage);
  if (!meal) return places;

  const badNameDinner = ["breakfast", "brunch", "cafe", "coffee", "bakery"];
  const badTypesDinner = ["cafe", "bakery", "coffee_shop"];
  const goodTypesDinner = ["restaurant", "meal_takeaway", "meal_delivery"];

  if (meal === "dinner") {
    const filtered = places.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const types = (p.types || []).map((t) => t.toLowerCase());

      if (badNameDinner.some((k) => name.includes(k))) return false;
      if (types.some((t) => badTypesDinner.includes(t))) return false;

      // If Google gives us types, enforce that it looks like a place that serves meals.
      if (types.length && !types.some((t) => goodTypesDinner.includes(t))) return false;
      return true;
    });

    // If we filtered too aggressively (e.g. missing types), fall back to the original list.
    return filtered.length ? filtered : places;
  }

  return places;
}

function looksLikeWeatherQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return ["weather", "forecast", "temperature", "rain", "snow", "wind"].some((k) =>
    m.includes(k)
  );
}

function looksLikeWifiQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return ["wifi", "wi-fi", "network", "internet"].some((k) => m.includes(k));
}

function looksLikeWifiPasswordQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return looksLikeWifiQuestion(m) && ["password", "passcode", "pw"].some((k) => m.includes(k));
}

function looksLikePhoneQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return ["phone", "call", "contact", "manager", "host"].some((k) => m.includes(k));
}

function looksLikePropertyProfileQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return [
    "house rules",
    "rules",
    "address",
    "check out",
    "checkout",
    "check-out",
    "check in",
    "checkin",
    "check-in",
    "about the house",
    "property info",
    "property information",
    "house info",
  ].some((k) => m.includes(k));
}

function looksLikePropertyInfoQuestion(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  return [
    'wifi',
    'wi-fi',
    'password',
    'network',
    'address',
    'house rules',
    'rules',
    'manager',
    'phone',
  ].some((k) => m.includes(k));
}

function inferCuisine(place: PlaceResult): string | undefined {
  const name = (place.name || "").toLowerCase();
  const types = (place.types || []).map((t) => t.toLowerCase());

  const keywords: Array<[string, string]> = [
    ["sushi", "Japanese"],
    ["ramen", "Japanese"],
    ["thai", "Thai"],
    ["mex", "Mexican"],
    ["taco", "Mexican"],
    ["pizza", "Pizza"],
    ["bbq", "BBQ"],
    ["barbecue", "BBQ"],
    ["steak", "Steakhouse"],
    ["italian", "Italian"],
    ["pasta", "Italian"],
    ["indian", "Indian"],
    ["kebab", "Mediterranean"],
    ["mediterr", "Mediterranean"],
    ["greek", "Greek"],
    ["vietnam", "Vietnamese"],
    ["pho", "Vietnamese"],
    ["korean", "Korean"],
    ["burger", "Burgers"],
  ];

  for (const [k, label] of keywords) {
    if (name.includes(k)) return label;
  }

  if (types.includes("cafe")) return "Cafe";
  if (types.includes("bar")) return "Bar";
  if (types.includes("bakery")) return "Bakery";
  if (types.includes("restaurant")) return "Restaurant";

  return undefined;
}

function summarizeWeather(weatherJson: unknown): string {
  if (!weatherJson || typeof weatherJson !== "object") return "(unavailable)";
  const cur = (weatherJson as { current?: Record<string, unknown> }).current;
  if (!cur || typeof cur !== "object") return "(unavailable)";

  const t = cur.temperature_2m;
  const feels = cur.apparent_temperature;
  const precip = cur.precipitation;
  const wind = cur.wind_speed_10m;

  const parts = [
    typeof t === "number" ? `Temp: ${t}°` : null,
    typeof feels === "number" ? `Feels like: ${feels}°` : null,
    typeof precip === "number" ? `Precip: ${precip}mm` : null,
    typeof wind === "number" ? `Wind: ${wind}` : null,
  ].filter(Boolean);

  return parts.join(" | ") || "(unavailable)";
}

async function openMeteoGeocodeZip(zip: string): Promise<LatLng> {
  const z = zip.trim();
  if (!z) throw new Error("Missing zip code for weather lookup.");

  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(z) +
    "&count=1&language=en&format=json";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather geocoding failed (HTTP ${res.status}).`);

  const data = (await res.json()) as {
    results?: Array<{ latitude?: number; longitude?: number }>;
  };

  const first = data.results?.[0];
  if (!first || typeof first.latitude !== "number" || typeof first.longitude !== "number") {
    throw new Error("Weather geocoding returned no coordinates for this zip.");
  }

  return { lat: first.latitude, lng: first.longitude };
}

async function fetchOpenMeteoCurrent(latLng: LatLng): Promise<unknown> {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(String(latLng.lat)) +
    "&longitude=" +
    encodeURIComponent(String(latLng.lng)) +
    "&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather lookup failed (HTTP ${res.status}).`);
  return (await res.json()) as unknown;
}

async function placesTextSearchLegacy(apiKey: string, query: string): Promise<PlaceResult[]> {
  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
    encodeURIComponent(query) +
    "&key=" +
    encodeURIComponent(apiKey);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Places text search failed (HTTP ${res.status}).`);
  }

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    results?: Array<{
      place_id?: string;
      name?: string;
      formatted_address?: string;
      types?: string[];
      rating?: number;
    }>;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      `Places text search failed (${data.status || "UNKNOWN"}): ${data.error_message || ""}`.trim()
    );
  }

  const base = (data.results || [])
    .map((r) => {
      const placeId = r.place_id;
      return {
        placeId,
        name: r.name || "",
        formattedAddress: r.formatted_address,
        types: Array.isArray(r.types) ? r.types : undefined,
        rating: r.rating,
        // Always provide a Google link (even if we don't/enrich can't fetch details).
        googleMapsUri: placeId
          ? `https://www.google.com/maps/place/?q=place_id:${placeId}`
          : undefined,
      } satisfies PlaceResult;
    })
    .filter((p) => p.name);

  // We only return the top 5 results in the fast-path payload; enrich that same set.
  const top = base.slice(0, 5);
  const rest = base.slice(5);

  const enrichedTopSettled = await Promise.allSettled(
    top.map(async (p) => {
      if (!p.placeId) return p;

      const detailsUrl =
        "https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
        encodeURIComponent(p.placeId) +
        "&fields=" +
        encodeURIComponent("formatted_phone_number,website,url") +
        "&key=" +
        encodeURIComponent(apiKey);

      const detailsRes = await fetch(detailsUrl, { cache: "no-store" });
      if (!detailsRes.ok) return p;

      const details = (await detailsRes.json()) as {
        status?: string;
        error_message?: string;
        result?: {
          formatted_phone_number?: string;
          website?: string;
          url?: string;
        };
      };

      if (details.status !== "OK") return p;

      return {
        ...p,
        phone: details.result?.formatted_phone_number,
        websiteUri: details.result?.website,
        googleMapsUri: details.result?.url || p.googleMapsUri,
      };
    })
  );

  const enrichedTop = enrichedTopSettled.map((r, idx) =>
    r.status === "fulfilled" ? r.value : top[idx]
  );

  return [...enrichedTop, ...rest];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ChatRequestBody>;
    const message = body.message?.toString().trim();
    const slug = body.slug?.toString().trim();
    const variant = typeof body.variant === 'number' && Number.isFinite(body.variant) ? body.variant : 0;

    if (!message) {
      return Response.json({ error: "Missing 'message'" }, { status: 400 });
    }
    if (!slug) {
      return Response.json({ error: "Missing 'slug'" }, { status: 400 });
    }

    const property = await getPropertyBySlug(slug);
    if (!property) {
      return Response.json({ error: "Property not found" }, { status: 404 });
    }

    const wantsLocal = looksLikeLocalBusinessQuestion(message);
    const wantsDayPlan = wantsLocal && looksLikeDayPlanQuestion(message);
    const wantsWeather = looksLikeWeatherQuestion(message);
    const wantsPropertyInfo = looksLikePropertyInfoQuestion(message);
    const wantsMoreOptions = looksLikeMoreOptionsRequest(message);

    let livePlaces: PlaceResult[] = [];
    let dayPlanPlaces: {
      breakfast: PlaceResult[];
      lunch: PlaceResult[];
      dinner: PlaceResult[];
      activities: PlaceResult[];
    } | null = null;
    let weatherJson: unknown = null;

    if (wantsLocal) {
      const placesKey = requireGooglePlacesApiKey();

      const fetchPlaces = async (query: string): Promise<PlaceResult[]> => {
        const raw = await withOverloadRetry(() => placesTextSearchLegacy(placesKey, query));
        // We only need a small set for the prompt; keep it deterministic.
        return raw.slice(0, 8);
      };

      if (wantsDayPlan) {
        const near = `${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
        const [breakfast, lunch, dinner, activities] = await Promise.all([
          fetchPlaces(`breakfast near ${near}`.trim()),
          fetchPlaces(`lunch near ${near}`.trim()),
          fetchPlaces(`dinner restaurant near ${near}`.trim()),
          fetchPlaces(`things to do near ${near}`.trim()),
        ]);

        dayPlanPlaces = {
          breakfast: filterPlacesForIntent("breakfast", breakfast),
          lunch: filterPlacesForIntent("lunch", lunch),
          dinner: filterPlacesForIntent("dinner", dinner),
          activities,
        };

        // Also keep a merged list for any fast-path payloads / fallback prompt text.
        livePlaces = [
          ...dayPlanPlaces.breakfast,
          ...dayPlanPlaces.lunch,
          ...dayPlanPlaces.dinner,
          ...dayPlanPlaces.activities,
        ];
      } else {
        const q = shapePlacesQuery(message, property);
        const rawPlaces = await withOverloadRetry(() => placesTextSearchLegacy(placesKey, q));
        livePlaces = filterPlacesForIntent(message, rawPlaces);

        // If we got no results (or filtering removed everything), broaden the search so we stay helpful.
        if (!livePlaces.length) {
          const near = `${property.PropertyZipCode || ''} ${property.PropertyAddress || ''}`.trim();
          const broad = looksLikeIndoorQuestion(message)
            ? `indoor activities near ${near}`.trim()
            : `things to do near ${near}`.trim();
          const rawBroad = await withOverloadRetry(() => placesTextSearchLegacy(placesKey, broad));
          livePlaces = rawBroad.slice(0, 8);
        }
      }
    }

    if (wantsWeather) {
      const latLng = await withOverloadRetry(() =>
        openMeteoGeocodeZip(property.PropertyZipCode || "")
      );
      weatherJson = await withOverloadRetry(() => fetchOpenMeteoCurrent(latLng));
    }

    const fastPathEnabled = (process.env.CHAT_FAST_PATH || "1") !== "0";
    const propertyFastPathEnabled = (process.env.CHAT_PROPERTY_FAST_PATH || "1") !== "0";

    if (propertyFastPathEnabled && wantsPropertyInfo && !wantsLocal && !wantsWeather) {
      if (looksLikeWifiQuestion(message) || looksLikeWifiPasswordQuestion(message)) {
        const payload: ChatOkResponse = {
          kind: "wifi",
          wifiName: property.WiFiName || "",
          wifiPassword: property.WiFiPassword || "",
          model: "fast-wifi",
        };
        return Response.json(payload, { status: 200 });
      }

      if (looksLikePhoneQuestion(message)) {
        const payload: ChatOkResponse = {
          kind: "phone",
          phoneNumber: property.ManagerPhone || "",
          model: "fast-phone",
        };
        return Response.json(payload, { status: 200 });
      }

      if (looksLikePropertyProfileQuestion(message)) {
        const payload: ChatOkResponse = {
          kind: "property",
          address: property.PropertyAddress || "",
          zip: property.PropertyZipCode || "",
          houseRules: property.HouseRules || "",
          managerPhone: property.ManagerPhone || "",
          wifiName: property.WiFiName || "",
          model: "fast-property",
        };
        return Response.json(payload, { status: 200 });
      }

      return Response.json(
        {
          kind: "text",
          response:
            "I can help with WiFi, manager contact, house rules, or the address. What exactly do you need?",
          model: "fast-property",
        } satisfies ChatOkResponse,
        { status: 200 }
      );
    }

    if (fastPathEnabled && wantsDayPlan && dayPlanPlaces) {
      const toMini = (p: PlaceResult) => ({
        name: p.name,
        blurb: inferCuisine(p),
        phone: p.phone,
        googleMapsUri: p.googleMapsUri,
      });

      // Rotate results when the guest asks for other options, and ensure we never repeat a place
      // across breakfast/lunch/dinner/activities within a single payload.
      const rot = wantsMoreOptions ? Math.max(0, variant) : 0;
      const used = new Set<string>();
      const breakfast = takeUniquePlaces(rotate(dayPlanPlaces.breakfast, rot), used, 2);
      const activities = takeUniquePlaces(rotate(dayPlanPlaces.activities, rot), used, 2);
      const lunch = takeUniquePlaces(rotate(dayPlanPlaces.lunch, rot), used, 2);
      const dinner = takeUniquePlaces(rotate(dayPlanPlaces.dinner, rot), used, 2);

      const b1 = (breakfast[0]?.name || '').trim();
      const l1 = (lunch[0]?.name || '').trim();
      const d1 = (dinner[0]?.name || '').trim();
      const a1 = (activities[0]?.name || '').trim();

      const introParts = [
        "I planned a relaxed day nearby for you.",
        b1 ? `Start with breakfast at ${b1}.` : null,
        a1 ? `Then I’d spend late morning at ${a1}.` : null,
        l1 ? `For lunch, I’d do ${l1}.` : null,
        d1 ? `And finish with dinner at ${d1}.` : null,
      ].filter(Boolean);

      const intro = introParts.join(" ");

      const payload: ChatOkResponse = {
        kind: "itinerary",
        intro,
        sections: [
          { title: "Breakfast", places: breakfast.map(toMini) },
          { title: "Lunch", places: lunch.map(toMini) },
          { title: "Dinner", places: dinner.map(toMini) },
          { title: "Things to do", places: activities.map(toMini) },
        ],
        model: "fast-itinerary",
      };

      return Response.json(payload, { status: 200 });
    }

    if (fastPathEnabled && (wantsLocal || wantsWeather) && !wantsDayPlan) {
      if (wantsLocal) {
        const rot = wantsMoreOptions ? Math.max(0, variant) : 0;
        const rotated = rotate(livePlaces, rot);
        const payload: ChatOkResponse = {
          kind: "places",
          places: rotated.slice(0, 5).map((p) => ({
            name: p.name,
            cuisine: inferCuisine(p),
            formattedAddress: p.formattedAddress,
            phone: p.phone,
            websiteUri: p.websiteUri,
            googleMapsUri: p.googleMapsUri,
            rating: p.rating,
          })),
          model: "fast-places",
        };
        return Response.json(payload, { status: 200 });
      }
      if (wantsWeather) {
        const weatherSummary = weatherJson ? summarizeWeather(weatherJson) : "(unavailable)";
        const payload: ChatOkResponse = {
          kind: "weather",
          summary: weatherSummary,
          model: "fast-weather",
        };
        return Response.json(payload, { status: 200 });
      }
      const payload: ChatOkResponse = {
        kind: "text",
        response: "—",
        model: "fast-path",
      };
      return Response.json(payload, { status: 200 });
    }

    const geminiKey = requireGeminiApiKey();

    const fmtPlace = (p: PlaceResult) => {
      const parts = [
        p.name,
        p.formattedAddress ? `Address: ${p.formattedAddress}` : null,
        p.phone ? `Phone: ${p.phone}` : null,
        p.websiteUri ? `Website: ${p.websiteUri}` : null,
        p.googleMapsUri ? `Maps: ${p.googleMapsUri}` : null,
        typeof p.rating === "number" ? `Rating: ${p.rating}` : null,
      ].filter(Boolean);
      return `- ${parts.join(" | ")}`;
    };

    const placesText = dayPlanPlaces
      ? [
          "Breakfast options:",
          ...(dayPlanPlaces.breakfast.slice(0, 5).map(fmtPlace) || ["- (none)"]),
          "",
          "Lunch options:",
          ...(dayPlanPlaces.lunch.slice(0, 5).map(fmtPlace) || ["- (none)"]),
          "",
          "Dinner options:",
          ...(dayPlanPlaces.dinner.slice(0, 5).map(fmtPlace) || ["- (none)"]),
          "",
          "Things to do:",
          ...(dayPlanPlaces.activities.slice(0, 5).map(fmtPlace) || ["- (none)"]),
        ].join("\n")
      : livePlaces.length > 0
        ? livePlaces.slice(0, 5).map(fmtPlace).join("\n")
        : "- (none)";

    const weatherSummary = weatherJson ? summarizeWeather(weatherJson) : null;

    const systemInstruction = [
      "Your name is the Pillar. You are an elite, sophisticated concierge for a multi-million dollar estate.",
      "",
      "You have access to the following house data:",
      `- WiFiName: ${property.WiFiName || ""}`,
      `- WiFiPassword: ${property.WiFiPassword || ""}`,
      `- DetailedHouseBio: ${property.DetailedHouseBio || ""}`,
      `- PropertyAddress: ${property.PropertyAddress || ""}`,
      `- PropertyZipCode: ${property.PropertyZipCode || ""}`,
      "",
      "Live local search results (Google Places):",
      placesText,
      "",
      weatherSummary ? "Live weather (current):" : null,
      weatherSummary,
      weatherSummary ? "" : null,
      "If the guest asks about the local area:",
      "- Prefer recommending places from the Live local search results above.",
      "- If the live list is empty or irrelevant, do NOT say you can't help. Instead:",
      "  - Suggest useful categories (e.g. museums, galleries, indoor markets, breweries, aquariums, bowling, escape rooms, cinemas, spas),",
      "  - Ask one concise clarifying question (e.g. budget, distance, vibe),",
      "  - Offer to try again with refined criteria.",
      "- Provide 2–5 options unless the guest asked for one.",
      "- For every recommended place, include direct links when available: add `Website: <url>` and `Maps: <url>`.",
      "- Prefer a compact, scannable format using ` | ` separators (e.g. `1) Name | Address: ... | Website: ... | Maps: ...`).",
      "Tone: elegant, concise, and professional.",
    ]
      .filter(Boolean)
      .join("\n");

    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelId = getPinnedGeminiModelId();
    const model = genAI.getGenerativeModel({ model: modelId, systemInstruction });

    try {
      const result = await withOverloadRetry(() => model.generateContent(message));
      const text = result.response.text();
      const payload: ChatOkResponse = { kind: "text", response: text, model: modelId };
      return Response.json(payload, { status: 200 });
    } catch (e) {
      if (isOverloadedError(e)) {
        const vertexKey = getVertexApiKey();
        if (vertexKey) {
          const vertexModel = getVertexModelId();
          const text = await vertexGenerateContent({
            apiKey: vertexKey,
            model: vertexModel,
            systemInstruction,
            userText: message,
          });
          const payload: ChatOkResponse = {
            kind: "text",
            response: text || "—",
            model: `vertex:${vertexModel}`,
          };
          return Response.json(
            payload,
            { status: 200 }
          );
        }
      }
      throw e;
    }
  } catch (e) {
    console.error("[chat] request failed", e);
    return Response.json(
      {
        error:
          "Oh No! We apologize for this inconvience, and are actively working on fixing this issue",
      },
      { status: 500 }
    );
  }
}
