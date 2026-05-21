import { GoogleGenerativeAI } from "@google/generative-ai";


function getPlacesLabel(userMessage: string): string {
  const m = userMessage.toLowerCase();
  if (m.includes("dinner") || m.includes("supper")) return "Dinner spots";
  if (m.includes("brunch")) return "Brunch spots";
  if (m.includes("breakfast")) return "Breakfast spots";
  if (m.includes("lunch")) return "Lunch spots";
  if (m.includes("coffee") || m.includes("café") || m.includes("cafe")) return "Coffee spots";
  if (m.includes("bar") || m.includes("cocktail")) return "Bars nearby";
  if (m.includes("spa") || m.includes("wellness")) return "Wellness nearby";
  if (m.includes("gym") || m.includes("fitness")) return "Fitness nearby";
  if (m.includes("grocery") || m.includes("supermarket")) return "Grocery stores";
  if (m.includes("pharmacy")) return "Pharmacies nearby";
  if (m.includes("museum") || m.includes("art")) return "Arts & culture";
  if (m.includes("shopping") || m.includes("shop")) return "Shopping nearby";
  if (m.includes("restaurant") || m.includes("food") || m.includes("eat")) return "Restaurants nearby";
  if (m.includes("activities") || m.includes("things to do")) return "Things to do";
  return "Nearby options";
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

import { getPropertyBySlug } from "@/lib/properties";

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
  history?: Array<{ role: 'user' | 'model'; text: string }>;
};

type IntentResult = {
  needsPlaces: boolean;
  isDayPlan: boolean;
  needsWeather: boolean;
  placesQuery: string;
  dayPlanModifiers: string;
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
          rating?: number;
        }>;
      }>;
      model: string;
    }
  | {
      kind: "places";
      label?: string;
      intro?: string;
      places: Array<{
        name: string;
        cuisine?: string;
        blurb?: string;
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

function wmoToCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing rain";
  if (code <= 75) return "Snow";
  if (code <= 77) return "Snow grains";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "";
}

function summarizeWeather(weatherJson: unknown): string {
  if (!weatherJson || typeof weatherJson !== "object") return "(unavailable)";
  const cur = (weatherJson as { current?: Record<string, unknown> }).current;
  if (!cur || typeof cur !== "object") return "(unavailable)";

  const t = cur.temperature_2m;
  const feels = cur.apparent_temperature;
  const precip = cur.precipitation;
  const wind = cur.wind_speed_10m;
  const code = cur.weathercode;

  const parts: string[] = [];
  if (typeof t === "number") parts.push(`${Math.round(t)}°F`);
  if (typeof code === "number") { const c = wmoToCondition(code); if (c) parts.push(c); }
  if (typeof feels === "number") parts.push(`Feels like ${Math.round(feels)}°F`);
  if (typeof precip === "number" && precip > 0) parts.push(`${precip}mm precip`);
  if (typeof wind === "number") parts.push(`Wind ${Math.round(wind)} mph`);

  return parts.join(" · ") || "(unavailable)";
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/__([^_\n]+)__/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "");
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
    "&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weathercode" +
    "&temperature_unit=fahrenheit&wind_speed_unit=mph";

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

  // Enrich the top 5 we'll actually show — fewer parallel calls, same UX.
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

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3000);
      let detailsRes: Response;
      try {
        detailsRes = await fetch(detailsUrl, { cache: "no-store", signal: controller.signal });
      } finally {
        clearTimeout(tid);
      }
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

// AI-powered intent classifier — uses conversation history so follow-ups like
// "spa sounds great" are understood in context rather than keyword-matched blindly.
async function classifyWithAI(
  genAI: GoogleGenerativeAI,
  modelId: string,
  history: Array<{ role: "user" | "model"; text: string }>,
  message: string,
  near: string,
  historyHasPlacesContext: boolean
): Promise<IntentResult> {
  const ctx = history
    .slice(-6)
    .map((h) => `${h.role === "user" ? "Guest" : "Concierge"}: ${h.text.slice(0, 300)}`)
    .join("\n");

  const placesContextNote = historyHasPlacesContext
    ? `\nCRITICAL — The concierge already showed place recommendations or a full-day itinerary in this conversation. Rules for follow-ups:
• If the history shows a FULL-DAY ITINERARY and the guest wants to adjust/modify/redo it in any way (indoor, outdoor, vegetarian, romantic, budget, different options, different vibe, etc.) → isDayPlan:true, needsPlaces:true, dayPlanModifiers:"the preference". Even vague requests like "something different" or "make it better" count as plan modifications.
• If the guest asks for ONE specific new category ("just coffee shops", "only bars", "find me a spa") → isDayPlan:false, needsPlaces:true.
• Only set needsPlaces:false if the guest is asking about WiFi, house rules, check-in/out, or weather — nothing else qualifies.`
    : "";

  const prompt = `You are classifying a hotel guest’s message to determine what data to fetch.
Property location: ${near}

Recent conversation:
${ctx}

Guest’s latest message: "${message}"

Reply with ONLY valid JSON, no markdown fences:
{"needsPlaces":boolean,"isDayPlan":boolean,"needsWeather":boolean,"placesQuery":"specific Google Places search query","dayPlanModifiers":"short phrase or empty string"}

Rules:
- needsPlaces: true when the guest wants FRESH place data from Google — any request for a type of place (restaurant, spa, activity, bar, shop, attraction, coffee, gym, etc.). Set true even after a day plan was already shown — if they ask about places, always fetch fresh results. ALWAYS true when isDayPlan is true. Set false ONLY for purely conversational questions needing no new data that are NOT about local places.
- isDayPlan: true ONLY when (a) guest explicitly requests a full-day itinerary ("plan my day", "full itinerary", "what should we do all day"), OR (b) a full itinerary was previously shown AND guest clearly wants to redo the whole plan ("keep it indoors", "show me a different version", "redo the plan outdoors"). A single-category request ("what restaurants?", "good coffee nearby?", "show me activities") is NEVER isDayPlan even after a prior day plan.
- needsWeather: true if guest asks about current weather or forecast
- placesQuery: best Google Places search string for the guest’s actual intent, informed by the full conversation — e.g. if earlier turns discussed wellness and guest says "spa sounds great", return "spa near ${near}". For follow-up questions about shown places ("any vegetarian?", "which is closest?"), derive a contextually appropriate search (e.g. "vegetarian restaurants near ${near}").
- dayPlanModifiers: ONLY when isDayPlan is true — short phrase capturing preferences from the full conversation ("indoor only", "outdoor", "rainy day", "romantic", "budget"). Empty string if none. If guest said "indoors", "inside", "rainy", or "not outdoor" use "indoor only".
- Always provide a non-empty placesQuery when needsPlaces is true.${placesContextNote}`;

  const model = genAI.getGenerativeModel({ model: modelId, generationConfig: { maxOutputTokens: 160 } });
  const result = await withOverloadRetry(() => model.generateContent(prompt));
  const raw = result.response
    .text()
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(raw) as Partial<IntentResult>;
  return {
    needsPlaces: parsed.needsPlaces === true,
    isDayPlan: parsed.isDayPlan === true,
    needsWeather: parsed.needsWeather === true,
    placesQuery:
      typeof parsed.placesQuery === "string" && parsed.placesQuery.trim()
        ? parsed.placesQuery.trim()
        : `${message} near ${near}`,
    dayPlanModifiers:
      typeof parsed.dayPlanModifiers === "string" ? parsed.dayPlanModifiers.trim() : "",
  };
}

function buildDayPlanQueries(near: string, modifiers: string) {
  const m = modifiers.toLowerCase();
  const indoor = /indoor|inside|rainy|bad.weather|stay.in|not.outdoor|no.outdoor|indoors/i.test(m);
  const vegetarian = /vegetarian|vegan|plant.based/i.test(m);
  const romantic = /romantic|date.night|couples/i.test(m);
  const budget = /budget|cheap|affordable|inexpensive/i.test(m);

  const mealSuffix = [
    vegetarian ? 'vegetarian' : '',
    romantic ? 'romantic upscale' : '',
    budget ? 'affordable casual' : '',
    indoor ? 'indoor' : '',
  ].filter(Boolean).join(' ');

  const activitySuffix = [
    indoor ? 'indoor' : 'outdoor',
    romantic ? 'romantic' : '',
    budget ? 'free or affordable' : '',
  ].filter(Boolean).join(' ');

  return {
    breakfast: `${mealSuffix} breakfast cafe near ${near}`.trim(),
    morningActivity: indoor
      ? `indoor activities museum gallery art exhibit near ${near}`
      : `${activitySuffix} morning sightseeing attractions near ${near}`.trim(),
    lunch: `${mealSuffix} lunch restaurant near ${near}`.trim(),
    afternoonActivity: indoor
      ? `indoor entertainment bowling escape room shopping cinema near ${near}`
      : `${activitySuffix} afternoon activities parks scenic near ${near}`.trim(),
    dinner: `${mealSuffix} dinner restaurant near ${near}`.trim(),
    dessert: `${mealSuffix} dessert bakery cafe near ${near}`.trim(),
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ChatRequestBody>;
    const message = body.message?.toString().trim();
    const slug = body.slug?.toString().trim();
    const variant =
      typeof body.variant === "number" && Number.isFinite(body.variant) ? body.variant : 0;

    // Parse and validate conversation history sent from the frontend
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history = (rawHistory as Array<{ role?: unknown; text?: unknown }>).filter(
      (h): h is { role: "user" | "model"; text: string } =>
        (h.role === "user" || h.role === "model") &&
        typeof h.text === "string" &&
        h.text.trim() !== ""
    );
    const hasHistory = history.length > 0;

    if (!message) return Response.json({ error: "Missing ‘message’" }, { status: 400 });
    if (!slug) return Response.json({ error: "Missing ‘slug’" }, { status: 400 });

    const property = await getPropertyBySlug(slug);
    if (!property) return Response.json({ error: "Property not found" }, { status: 404 });

    const near = `${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
    const geminiKey = requireGeminiApiKey();
    const modelId = getPinnedGeminiModelId();
    const genAI = new GoogleGenerativeAI(geminiKey);

    // ── Reliable fast paths: WiFi / phone / property profile ─────────────────
    // These are stateless lookups that don’t need conversation context.
    const propertyFastPathEnabled = (process.env.CHAT_PROPERTY_FAST_PATH || "1") !== "0";
    if (propertyFastPathEnabled && looksLikePropertyInfoQuestion(message) && !hasHistory) {
      if (looksLikeWifiQuestion(message) || looksLikeWifiPasswordQuestion(message)) {
        return Response.json(
          { kind: "wifi", wifiName: property.WiFiName || "", wifiPassword: property.WiFiPassword || "", model: "fast-wifi" } satisfies ChatOkResponse,
          { status: 200 }
        );
      }
      if (looksLikePhoneQuestion(message)) {
        return Response.json(
          { kind: "phone", phoneNumber: property.ManagerPhone || "", model: "fast-phone" } satisfies ChatOkResponse,
          { status: 200 }
        );
      }
      if (looksLikePropertyProfileQuestion(message)) {
        return Response.json(
          { kind: "property", address: property.PropertyAddress || "", zip: property.PropertyZipCode || "", houseRules: property.HouseRules || "", managerPhone: property.ManagerPhone || "", wifiName: property.WiFiName || "", model: "fast-property" } satisfies ChatOkResponse,
          { status: 200 }
        );
      }
    }

    // ── Determine intent ──────────────────────────────────────────────────────
    let wantsLocal = looksLikeLocalBusinessQuestion(message);
    let wantsDayPlan = wantsLocal && looksLikeDayPlanQuestion(message);
    let wantsWeather = looksLikeWeatherQuestion(message);
    let smartPlacesQuery = shapePlacesQuery(message, property);
    let smartPlacesModifier = '';

    // Speed optimisation: for follow-up messages that look like place requests,
    // kick off a speculative Places fetch immediately while the AI classifier runs
    // in parallel so both finish together instead of sequentially.
    const speculativeApiKey = (
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_PLATFORM_API_KEY || ''
    ).trim();
    let speculativeFetch: Promise<PlaceResult[]> | null = null;
    let speculativeQuery = '';
    if (hasHistory && wantsLocal && !wantsDayPlan && speculativeApiKey) {
      speculativeQuery = smartPlacesQuery;
      speculativeFetch = placesTextSearchLegacy(speculativeApiKey, speculativeQuery)
        .then(r => r.slice(0, 8))
        .catch(() => []);
    }

    // Keyword detection acts as a floor — if keywords say it's a place request,
    // the AI classifier cannot suppress the fetch (it can only refine the query).
    const keywordWantsLocal = wantsLocal;
    const keywordWantsDayPlan = wantsDayPlan;

    // Detect if places or an itinerary were shown earlier in this conversation.
    // When true we keep every response in structured-card mode.
    const historyHasPlacesContext = history.some(
      (h) =>
        h.role === "model" &&
        (h.text.includes("[Showed place") || h.text.includes("[Showed a full-day itinerary"))
    );

    // Derive a fallback query from the previous shown label, e.g. "[Showed place recommendations (Dinner spots): ...]"
    let historyPlacesQuery = "";
    if (historyHasPlacesContext) {
      for (let i = history.length - 1; i >= 0; i--) {
        const h = history[i];
        if (h.role !== "model") continue;
        const labelMatch = h.text.match(/\[Showed place recommendations \(([^)]+)\)/);
        if (labelMatch) { historyPlacesQuery = `${labelMatch[1]} near ${near}`; break; }
        if (h.text.includes("[Showed a full-day itinerary")) { historyPlacesQuery = `restaurants and activities near ${near}`; break; }
      }
    }

    // Was a full-day itinerary shown earlier? If so, follow-ups should redo the plan.
    const historyHasItinerary = history.some(
      (h) => h.role === "model" && h.text.includes("[Showed a full-day itinerary")
    );

    if (hasHistory) {
      const forceLocal = historyHasPlacesContext &&
        !looksLikePropertyInfoQuestion(message) &&
        !looksLikeWeatherQuestion(message);

      try {
        const intent = await classifyWithAI(genAI, modelId, history, message, near, historyHasPlacesContext);

        wantsLocal = intent.needsPlaces || intent.isDayPlan || keywordWantsLocal || forceLocal;
        wantsDayPlan = intent.isDayPlan || keywordWantsDayPlan;
        wantsWeather = intent.needsWeather;
        smartPlacesModifier = intent.dayPlanModifiers || '';

        if (intent.needsPlaces || intent.isDayPlan) {
          smartPlacesQuery = intent.placesQuery;
        } else if (forceLocal && historyPlacesQuery) {
          smartPlacesQuery = historyPlacesQuery;
        }

        // Safety net: if an itinerary was shown and the classifier flagged local intent
        // but didn't set isDayPlan, default to redoing the full plan so the guest
        // always gets a structured itinerary response rather than a single places card.
        if (historyHasItinerary && wantsLocal && !wantsDayPlan) {
          wantsDayPlan = true;
        }
        // When redoing the plan without a modifier from the classifier, use the raw
        // message so keywords like "indoor", "vegetarian", "romantic" are picked up.
        if (wantsDayPlan && !smartPlacesModifier) {
          smartPlacesModifier = message;
        }
      } catch {
        wantsLocal = keywordWantsLocal || forceLocal;
        if (historyHasItinerary && wantsLocal) {
          wantsDayPlan = true;
          smartPlacesModifier = message;
        }
        if (forceLocal && historyPlacesQuery) smartPlacesQuery = historyPlacesQuery;
      }
    }

    // ── Fetch live data ───────────────────────────────────────────────────────
    const wantsMoreOptions = looksLikeMoreOptionsRequest(message);
    let livePlaces: PlaceResult[] = [];
    let dayPlanPlaces: {
      breakfast: PlaceResult[];
      morningActivity: PlaceResult[];
      lunch: PlaceResult[];
      afternoonActivity: PlaceResult[];
      dinner: PlaceResult[];
      dessert: PlaceResult[];
    } | null = null;
    let weatherJson: unknown = null;

    if (wantsLocal) {
      const placesKey = requireGooglePlacesApiKey();
      const fetchPlaces = async (query: string): Promise<PlaceResult[]> =>
        (await withOverloadRetry(() => placesTextSearchLegacy(placesKey, query))).slice(0, 8);

      if (wantsDayPlan) {
        const dayPlanQ = buildDayPlanQueries(near, smartPlacesModifier);
        const [breakfast, morningActivity, lunch, afternoonActivity, dinner, dessert] = await Promise.all([
          fetchPlaces(dayPlanQ.breakfast),
          fetchPlaces(dayPlanQ.morningActivity),
          fetchPlaces(dayPlanQ.lunch),
          fetchPlaces(dayPlanQ.afternoonActivity),
          fetchPlaces(dayPlanQ.dinner),
          fetchPlaces(dayPlanQ.dessert),
        ]);
        dayPlanPlaces = {
          breakfast: filterPlacesForIntent("breakfast", breakfast),
          morningActivity,
          lunch: filterPlacesForIntent("lunch", lunch),
          afternoonActivity,
          dinner: filterPlacesForIntent("dinner", dinner),
          dessert,
        };
        livePlaces = [
          ...dayPlanPlaces.breakfast,
          ...dayPlanPlaces.morningActivity,
          ...dayPlanPlaces.lunch,
          ...dayPlanPlaces.afternoonActivity,
          ...dayPlanPlaces.dinner,
          ...dayPlanPlaces.dessert,
        ];
      } else {
        // Use the speculative fetch if it was for the same query the classifier confirmed,
        // otherwise fall back to a fresh fetch.
        let rawPlaces: PlaceResult[];
        if (speculativeFetch && speculativeQuery === smartPlacesQuery) {
          rawPlaces = await speculativeFetch;
          if (!rawPlaces.length) rawPlaces = await withOverloadRetry(() => fetchPlaces(smartPlacesQuery));
        } else {
          rawPlaces = await withOverloadRetry(() => fetchPlaces(smartPlacesQuery));
        }
        livePlaces = filterPlacesForIntent(message, rawPlaces);
      }
    }

    if (wantsWeather) {
      try {
        const latLng = await withOverloadRetry(() =>
          openMeteoGeocodeZip(property.PropertyZipCode || "")
        );
        weatherJson = await withOverloadRetry(() => fetchOpenMeteoCurrent(latLng));
      } catch {
        // Weather is optional; fall through
      }
    }

    // Weather is pure data with no conversational nuance — fast-path is fine.
    if (wantsWeather && weatherJson) {
      return Response.json(
        { kind: "weather", summary: summarizeWeather(weatherJson), model: "fast-weather" } satisfies ChatOkResponse,
        { status: 200 }
      );
    }

    // ── Places fast path: structured card + one-shot blurb generation ────────
    // Uses an offset when the guest asks for "more options" so results rotate.
    if (wantsLocal && !wantsDayPlan && livePlaces.length > 0) {
      const offset = wantsMoreOptions ? 5 : 0;
      // If the rotation offset would produce an empty slice (fewer results than expected),
      // fall back to showing the first available set rather than falling through to plain text.
      const selected = livePlaces.slice(offset, offset + 5).length > 0
        ? livePlaces.slice(offset, offset + 5)
        : livePlaces.slice(0, 5);
      if (selected.length > 0) {
        // Single Gemini call: warm intro sentence + one blurb per place.
        let blurbs: Record<string, string> = {};
        let placesIntro: string | undefined;
        try {
          const blurbModel = genAI.getGenerativeModel({ model: modelId, generationConfig: { maxOutputTokens: 600 } });
          const blurbPrompt = `You are Pillar — a warm, attentive personal concierge for a private estate. The guest just asked: "${message}"

Write ONE brief intro sentence (12 words max) as if you're personally steering them toward these spots — genuine, specific to their ask, not a generic opener. Sound like a trusted friend who knows the area.

Then for each place write ONE sentence (12 words max) in a concierge's personal voice — a genuine endorsement, not a review snippet. Highlight what makes it worth visiting.

Return ONLY valid JSON, no markdown:
{"intro":"your warm sentence","blurbs":[{"name":"exact name","blurb":"sentence"}]}

Places:
${selected.map((p) => `- ${p.name}${p.types?.length ? ` (${p.types[0].replace(/_/g, " ")})` : ""}`).join("\n")}`;
          const blurbResult = await withOverloadRetry(() => blurbModel.generateContent(blurbPrompt));
          // Robust extraction: find the outermost { ... } so any prose Gemini adds before/after doesn't break parsing
          const rawBlurbText = blurbResult.response.text().replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
          const bStart = rawBlurbText.indexOf("{");
          const bEnd = rawBlurbText.lastIndexOf("}");
          const blurbRaw = bStart !== -1 && bEnd > bStart ? rawBlurbText.slice(bStart, bEnd + 1) : rawBlurbText.trim();
          const blurbParsed = JSON.parse(blurbRaw) as { intro?: string; blurbs?: Array<{ name: string; blurb: string }> };
          if (blurbParsed.intro) placesIntro = stripMarkdown(blurbParsed.intro);
          for (const b of blurbParsed.blurbs ?? []) {
            if (b.name && b.blurb) blurbs[b.name.toLowerCase().trim()] = stripMarkdown(b.blurb);
          }
        } catch {
          // Blurbs/intro are optional — fall through without them if Gemini fails
        }

        return Response.json(
          {
            kind: "places",
            label: getPlacesLabel(message),
            intro: placesIntro,
            places: selected.map((p) => ({
              name: p.name,
              cuisine: inferCuisine(p),
              blurb: blurbs[p.name.toLowerCase().trim()],
              formattedAddress: p.formattedAddress,
              phone: p.phone,
              websiteUri: p.websiteUri,
              googleMapsUri: p.googleMapsUri,
              rating: p.rating,
            })),
            model: modelId,
          } satisfies ChatOkResponse,
          { status: 200 }
        );
      }
    }

    // ── Gemini text response with full conversation history ───────────────────
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
          ...dayPlanPlaces.breakfast.slice(0, 4).map(fmtPlace),
          "",
          "Morning activities:",
          ...dayPlanPlaces.morningActivity.slice(0, 4).map(fmtPlace),
          "",
          "Lunch options:",
          ...dayPlanPlaces.lunch.slice(0, 4).map(fmtPlace),
          "",
          "Afternoon activities:",
          ...dayPlanPlaces.afternoonActivity.slice(0, 4).map(fmtPlace),
          "",
          "Dinner options:",
          ...dayPlanPlaces.dinner.slice(0, 4).map(fmtPlace),
          "",
          "Dessert options:",
          ...dayPlanPlaces.dessert.slice(0, 4).map(fmtPlace),
        ].join("\n")
      : livePlaces.length > 0
        ? livePlaces.slice(0, 5).map(fmtPlace).join("\n")
        : null;

    const weatherSummary = weatherJson ? summarizeWeather(weatherJson) : null;

    const systemInstruction = [
      "You are Pillar — an exceptionally attentive, warm, and knowledgeable concierge for a luxury private estate.",
      "",
      "## MOST IMPORTANT RULE",
      "Read the ENTIRE conversation history before every response. If the guest has expressed ANY preference, refinement, or correction — even a casual one like \"I’d rather stay indoors\", \"not a fan of seafood\", \"something quieter\", \"show me different ones\" — you MUST honor it immediately and completely. NEVER suggest something the guest has already rejected or said they don’t want. Adapt as if you were a real, attentive human concierge who truly listens.",
      smartPlacesModifier ? `\n## Guest’s stated preferences for this request\n${smartPlacesModifier} — select ONLY places that match this preference. If the guest said anything about staying indoors, never suggest outdoor parks or outdoor attractions.` : null,
      "",
      "## Property data",
      `WiFi: ${property.WiFiName || "(not set)"}  |  Password: ${property.WiFiPassword || "(not set)"}`,
      `Address: ${property.PropertyAddress || "(not set)"}  |  ZIP: ${property.PropertyZipCode || "(not set)"}`,
      property.HouseRules ? `House rules: ${property.HouseRules}` : null,
      property.DetailedHouseBio ? `About the property: ${property.DetailedHouseBio}` : null,
      "",
      placesText ? "## Live local data (Google Places — use these as your source)" : null,
      placesText,
      "",
      weatherSummary ? `## Live weather\n${weatherSummary}` : null,
      "",
      "## Response guidelines",
      "- Honor all prior preferences immediately — just do it, don’t announce it.",
      "- When redirecting based on guest feedback, one brief transition phrase is the maximum (‘Here are some quieter options —‘). Never apologise, never grovel, never over-explain a pivot.",
      "- Do not use apology words: ‘sorry’, ‘apologies’, ‘I apologize’, ‘I’m sorry’, ‘my apologies’. If something isn’t available, simply move to what is.",
      "- Keep responses concise, elegant, and specific. No filler openers like ‘Certainly!’, ‘Of course!’, ‘Absolutely!’, ‘Great choice!’.",
      "- Use short paragraphs or tight bullet points — never dense walls of text.",
      "- For property questions (check-in, parking, appliances, etc.), answer directly and confidently from the data provided.",
      "- For questions not covered by property data, draw on your broad knowledge as a luxury hospitality expert.",
      "- Never fabricate property-specific details you don’t have. If unknown, say so briefly and offer what you do know.",
      "- Tone: confident, warm, and unhurried — like a world-class concierge who gets things done.",
    ]
      .filter((l): l is string => l !== null)
      .join("\n");

    // Build Gemini chat history so the model has full conversation context
    const geminiHistory = history
      .filter((h) => h.text.trim())
      .map((h) => ({ role: h.role, parts: [{ text: h.text }] }));

    // ── Day plan: ask AI to return structured itinerary JSON ─────────────────
    // Falls through to text generation if JSON parsing fails.
    if (wantsDayPlan && dayPlanPlaces) {
      try {
        const allFetchedPlaces = [
          ...dayPlanPlaces.breakfast,
          ...dayPlanPlaces.morningActivity,
          ...dayPlanPlaces.lunch,
          ...dayPlanPlaces.afternoonActivity,
          ...dayPlanPlaces.dinner,
          ...dayPlanPlaces.dessert,
        ];
        const placeByName = new Map<string, PlaceResult>(
          allFetchedPlaces.map((p) => [p.name.toLowerCase().trim(), p])
        );

        const itModel = genAI.getGenerativeModel({ model: modelId, systemInstruction });
        const prefLine = smartPlacesModifier
          ? `\n\nGuest's stated preferences: "${smartPlacesModifier}". You MUST honor this when picking places. For example, if the guest wants indoor activities, only pick indoor venues for activity sections — never parks, trails, or outdoor attractions.`
          : '';
        const itPrompt = `Using the places listed in your context, build a full-day itinerary with exactly these 6 sections. Pick ONE place per section — the best option from the available data for that time of day. Use exact place names from the data. Write blurbs in plain text only — no asterisks, no markdown, no bold formatting.${prefLine}
Return ONLY valid JSON (no markdown fences, no extra text):
{"sections":[{"title":"Breakfast","places":[{"name":"Exact Name","blurb":"one vivid sentence describing the experience"}]},{"title":"Morning Activity","places":[{"name":"Exact Name","blurb":"one vivid sentence describing what to do there"}]},{"title":"Lunch","places":[{"name":"Exact Name","blurb":"one vivid sentence describing the experience"}]},{"title":"Afternoon Activity","places":[{"name":"Exact Name","blurb":"one vivid sentence describing what to do there"}]},{"title":"Dinner","places":[{"name":"Exact Name","blurb":"one vivid sentence describing the experience"}]},{"title":"Dessert","places":[{"name":"Exact Name","blurb":"one vivid sentence describing the experience"}]}]}`;

        let rawText: string;
        if (geminiHistory.length > 0) {
          const chat = itModel.startChat({ history: geminiHistory });
          const r = await withOverloadRetry(() => chat.sendMessage(itPrompt));
          rawText = r.response.text();
        } else {
          const r = await withOverloadRetry(() => itModel.generateContent(itPrompt));
          rawText = r.response.text();
        }

        // Strip all markdown fences (may appear mid-text, not just at start/end),
        // then find the outermost JSON object in whatever Gemini returns.
        const stripped = rawText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
        const jsonStart = stripped.indexOf("{");
        const jsonEnd = stripped.lastIndexOf("}");
        const cleaned =
          jsonStart !== -1 && jsonEnd > jsonStart
            ? stripped.slice(jsonStart, jsonEnd + 1)
            : stripped.trim();

        const parsed = JSON.parse(cleaned) as {
          intro?: string;
          sections?: Array<{ title?: string; places?: Array<{ name?: string; blurb?: string }> }>;
        };

        const sections = (Array.isArray(parsed.sections) ? parsed.sections : []).map((s) => ({
          title: s.title || "—",
          places: (Array.isArray(s.places) ? s.places : []).map((p) => {
            const fetched = placeByName.get((p.name || "").toLowerCase().trim());
            return {
              name: p.name || "—",
              blurb: p.blurb ? stripMarkdown(p.blurb) : undefined,
              phone: fetched?.phone,
              googleMapsUri: fetched?.googleMapsUri,
              rating: fetched?.rating,
            };
          }),
        }));

        return Response.json(
          {
            kind: "itinerary",
            intro: "",
            sections,
            model: modelId,
          } satisfies ChatOkResponse,
          { status: 200 }
        );
      } catch {
        // Gemini returned malformed JSON — build the itinerary directly from the
        // fetched Places data so the guest always gets structured cards.
        try {
          const used = new Set<string>();
          const breakfastPlaces = takeUniquePlaces(dayPlanPlaces.breakfast, used, 1);
          const morningActPlaces = takeUniquePlaces(dayPlanPlaces.morningActivity, used, 1);
          const lunchPlaces = takeUniquePlaces(dayPlanPlaces.lunch, used, 1);
          const afternoonActPlaces = takeUniquePlaces(dayPlanPlaces.afternoonActivity, used, 1);
          const dinnerPlaces = takeUniquePlaces(dayPlanPlaces.dinner, used, 1);
          const dessertPlaces = takeUniquePlaces(dayPlanPlaces.dessert, used, 1);
          const allSelected = [...breakfastPlaces, ...morningActPlaces, ...lunchPlaces, ...afternoonActPlaces, ...dinnerPlaces, ...dessertPlaces];

          let blurbs: Record<string, string> = {};
          if (allSelected.length > 0) {
            try {
              const blurbModel = genAI.getGenerativeModel({ model: modelId });
              const blurbPrompt = `You are a luxury estate concierge. For each place write ONE vivid sentence (max 15 words) telling a nearby guest why they will love visiting it. Return ONLY valid JSON, no markdown: {"blurbs":[{"name":"exact name","blurb":"sentence"}]}\n\nPlaces:\n${allSelected.map((p) => `- ${p.name}${p.formattedAddress ? ` (${p.formattedAddress.split(",").slice(0, 2).join(",")})` : ""}`).join("\n")}`;
              const blurbResult = await withOverloadRetry(() => blurbModel.generateContent(blurbPrompt));
              const blurbStrippedRaw = blurbResult.response.text().replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
              const bStart = blurbStrippedRaw.indexOf("{");
              const bEnd = blurbStrippedRaw.lastIndexOf("}");
              const blurbRaw = bStart !== -1 && bEnd > bStart ? blurbStrippedRaw.slice(bStart, bEnd + 1) : blurbStrippedRaw.trim();
              const blurbParsed = JSON.parse(blurbRaw) as { blurbs?: Array<{ name: string; blurb: string }> };
              for (const b of blurbParsed.blurbs ?? []) {
                if (b.name && b.blurb) blurbs[b.name.toLowerCase().trim()] = stripMarkdown(b.blurb);
              }
            } catch {
              // Blurbs are optional
            }
          }

          const makeSection = (title: string, places: PlaceResult[]) => ({
            title,
            places: places.map((p) => ({
              name: p.name,
              blurb: blurbs[p.name.toLowerCase().trim()],
              phone: p.phone,
              googleMapsUri: p.googleMapsUri,
              rating: p.rating,
            })),
          });

          const sections = [
            makeSection("Breakfast", breakfastPlaces),
            makeSection("Morning Activity", morningActPlaces),
            makeSection("Lunch", lunchPlaces),
            makeSection("Afternoon Activity", afternoonActPlaces),
            makeSection("Dinner", dinnerPlaces),
            makeSection("Dessert", dessertPlaces),
          ].filter((s) => s.places.length > 0);

          if (sections.length > 0) {
            return Response.json(
              {
                kind: "itinerary",
                intro: "",
                sections,
                model: modelId,
              } satisfies ChatOkResponse,
              { status: 200 }
            );
          }
        } catch {
          // Fall through to text generation only if the fallback itself fails
        }
      }
    }

    const model = genAI.getGenerativeModel({ model: modelId, systemInstruction });

    try {
      let text: string;
      if (geminiHistory.length > 0) {
        const chat = model.startChat({ history: geminiHistory });
        const result = await withOverloadRetry(() => chat.sendMessage(message));
        text = result.response.text();
      } else {
        const result = await withOverloadRetry(() => model.generateContent(message));
        text = result.response.text();
      }
      return Response.json(
        { kind: "text", response: stripMarkdown(text), model: modelId } satisfies ChatOkResponse,
        { status: 200 }
      );
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
          return Response.json(
            { kind: "text", response: text || "—", model: `vertex:${vertexModel}` } satisfies ChatOkResponse,
            { status: 200 }
          );
        }
      }
      throw e;
    }
  } catch (e) {
    console.error("[chat] request failed", e);
    return Response.json(
      { error: "We're temporarily unable to process your request. Please try again in a moment." },
      { status: 500 }
    );
  }
}
