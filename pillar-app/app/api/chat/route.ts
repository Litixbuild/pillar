import { GoogleGenerativeAI } from "@google/generative-ai";

// New Places API (places.googleapis.com) text search — richer fields than the legacy endpoint.
async function placesTextSearchV1(apiKey: string, query: string): Promise<PlaceResult[]> {
  const cacheKey = `v2:${query.trim().toLowerCase()}`;
  const cached = getCachedPlaces(cacheKey);
  if (cached) return cached;

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 4500);
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Field mask keeps responses fast/cheap.
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.types',
          'places.primaryType',
          'places.primaryTypeDisplayName',
          'places.editorialSummary',
          'places.priceLevel',
          'places.takeout',
          'places.delivery',
          'places.dineIn',
          'places.reservable',
          'places.servesBeer',
          'places.servesWine',
          'places.servesVegetarianFood',
          'places.nationalPhoneNumber',
          'places.internationalPhoneNumber',
          'places.websiteUri',
          'places.googleMapsUri',
          'places.rating',
        ].join(','),
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'en', regionCode: 'US' }),
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(tid);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places v1 searchText failed (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      types?: string[];
      primaryType?: string;
      editorialSummary?: { text?: string };
      priceLevel?: string;
      takeout?: boolean;
      delivery?: boolean;
      dineIn?: boolean;
      reservable?: boolean;
      servesBeer?: boolean;
      servesWine?: boolean;
      servesVegetarianFood?: boolean;
      nationalPhoneNumber?: string;
      internationalPhoneNumber?: string;
      websiteUri?: string;
      googleMapsUri?: string;
      rating?: number;
    }>;
  };

  const out = (data.places || [])
    .map((p) => ({
      placeId: p.id,
      name: p.displayName?.text || '',
      formattedAddress: p.formattedAddress,
      types: Array.isArray(p.types) ? p.types : undefined,
      primaryType: typeof p.primaryType === 'string' ? p.primaryType : undefined,
      editorialSummary: p.editorialSummary?.text || undefined,
      priceLevel: typeof p.priceLevel === 'string' ? p.priceLevel : undefined,
      takeout: typeof p.takeout === 'boolean' ? p.takeout : undefined,
      delivery: typeof p.delivery === 'boolean' ? p.delivery : undefined,
      dineIn: typeof p.dineIn === 'boolean' ? p.dineIn : undefined,
      reservable: typeof p.reservable === 'boolean' ? p.reservable : undefined,
      servesBeer: typeof p.servesBeer === 'boolean' ? p.servesBeer : undefined,
      servesWine: typeof p.servesWine === 'boolean' ? p.servesWine : undefined,
      servesVegetarianFood: typeof p.servesVegetarianFood === 'boolean' ? p.servesVegetarianFood : undefined,
      phone: p.internationalPhoneNumber || p.nationalPhoneNumber || undefined,
      websiteUri: p.websiteUri,
      googleMapsUri: p.googleMapsUri,
      rating: p.rating,
    }) satisfies PlaceResult)
    .filter((p) => p.name);

  setCachedPlaces(cacheKey, out);
  return out;
}


function getPlacesLabel(userMessage: string): string {
  const m = userMessage.toLowerCase();
  if (m.includes("dinner") || m.includes("supper")) return "Dinner spots";
  if (m.includes("brunch")) return "Brunch spots";
  if (m.includes("breakfast")) return "Breakfast spots";
  if (m.includes("lunch")) return "Lunch spots";
  if (m.includes("coffee") || m.includes("café") || m.includes("cafe")) return "Coffee spots";
  if (m.includes("cocktail") || m.includes("bar") || m.includes("pub")) return "Bars nearby";
  if (m.includes("brewery") || m.includes("winery")) return "Breweries & wineries";
  if (m.includes("spa") || m.includes("massage") || m.includes("wellness")) return "Wellness nearby";
  if (m.includes("yoga") || m.includes("pilates") || m.includes("crossfit")) return "Fitness studios";
  if (m.includes("gym") || m.includes("fitness")) return "Gyms nearby";
  if (m.includes("bike") || m.includes("bicycle") || m.includes("cycling")) return "Bike shops & rentals";
  if (m.includes("kayak") || m.includes("paddleboard") || m.includes("canoe")) return "Water sports";
  if (m.includes("surf")) return "Surf shops";
  if (m.includes("golf")) return "Golf nearby";
  if (m.includes("tennis") || m.includes("pickleball")) return "Courts nearby";
  if (m.includes("bowling")) return "Bowling alleys";
  if (m.includes("pool") || m.includes("swim")) return "Pools & aquatics";
  if (m.includes("beach")) return "Beaches nearby";
  if (m.includes("park") || m.includes("trail") || m.includes("hike")) return "Parks & trails";
  if (m.includes("waterpark") || m.includes("water park") || m.includes("amusement")) return "Attractions";
  if (m.includes("museum")) return "Museums nearby";
  if (m.includes("gallery") || m.includes("art")) return "Art & galleries";
  if (m.includes("theater") || m.includes("cinema") || m.includes("movie")) return "Entertainment";
  if (m.includes("concert") || m.includes("live music")) return "Live music";
  if (m.includes("nightclub")) return "Nightlife";
  if (m.includes("smoke") || m.includes("vape") || m.includes("tobacco") || m.includes("cigar") || m.includes("hookah")) return "Smoke shops";
  if (m.includes("dispensary") || m.includes("cannabis")) return "Dispensaries";
  if (m.includes("grocery") || m.includes("supermarket")) return "Grocery stores";
  if (m.includes("pharmacy") || m.includes("drug store")) return "Pharmacies nearby";
  if (m.includes("gas station")) return "Gas stations";
  if (m.includes("car wash") || m.includes("auto")) return "Auto services";
  if (m.includes("salon") || m.includes("barber") || m.includes("nail")) return "Salons & barbers";
  if (m.includes("laundry") || m.includes("dry clean")) return "Laundry nearby";
  if (m.includes("pet store") || m.includes("vet")) return "Pet services";
  if (m.includes("urgent care") || m.includes("clinic") || m.includes("doctor") || m.includes("dentist")) return "Medical nearby";
  if (m.includes("bank") || m.includes("atm")) return "Banks & ATMs";
  if (m.includes("hardware")) return "Hardware stores";
  if (m.includes("tire") || m.includes("mechanic") || m.includes("oil change") || m.includes("auto repair")) return "Auto services";
  if (m.includes("locksmith")) return "Locksmiths nearby";
  if (m.includes("liquor") || m.includes("wine store")) return "Liquor & wine";
  if (m.includes("ice cream") || m.includes("dessert") || m.includes("bakery") || m.includes("donut")) return "Desserts nearby";
  if (m.includes("sandwich") || m.includes("deli") || m.includes("bagel")) return "Delis & cafes";
  if (m.includes("florist") || m.includes("flower")) return "Florists nearby";
  if (m.includes("jewelry") || m.includes("antique")) return "Shops nearby";
  if (m.includes("bookstore") || m.includes("book store")) return "Bookstores nearby";
  if (m.includes("mall") || m.includes("boutique") || m.includes("clothing") || m.includes("shoes")) return "Shopping nearby";
  if (m.includes("shopping") || m.includes("shop") || m.includes("store")) return "Shopping nearby";
  if (m.includes("restaurant") || m.includes("food") || m.includes("eat")) return "Restaurants nearby";
  if (m.includes("activities") || m.includes("things to do") || m.includes("attractions")) return "Things to do";
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
    m.includes('others') ||
    m.includes('show me more') ||
    m.includes('see more') ||
    m.includes('give me more') ||
    m.includes('any others') ||
    m.includes('more choices') ||
    m.includes('other choices') ||
    m.includes('different ones') ||
    m.includes('show me others') ||
    m.includes('let me see more') ||
    m.includes('other suggestions') ||
    m.includes('more suggestions')
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

type CacheEntry<T> = { value: T; expiresAtMs: number };

// Best-effort in-memory caches to reduce latency/cost for repeated queries.
// Note: these live only for the lifetime of the Node process (works well on warm lambdas).
const PLACES_CACHE_TTL_MS = Math.max(5_000, Number(process.env.PLACES_CACHE_TTL_MS || 60_000));
const placesCache: Map<string, CacheEntry<PlaceResult[]>> = new Map();

function getCachedPlaces(key: string): PlaceResult[] | null {
  const hit = placesCache.get(key);
  if (!hit) return null;
  if (Date.now() >= hit.expiresAtMs) {
    placesCache.delete(key);
    return null;
  }
  return hit.value;
}

function setCachedPlaces(key: string, value: PlaceResult[]) {
  placesCache.set(key, { value, expiresAtMs: Date.now() + PLACES_CACHE_TTL_MS });
}

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
  primaryType?: string;
  editorialSummary?: string;
  priceLevel?: string;
  takeout?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  reservable?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesVegetarianFood?: boolean;
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

function getFastGeminiModelId(): string {
  return (process.env.GEMINI_FAST_MODEL?.trim() || "gemini-2.5-flash").trim();
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
  // Specific place types and activities
  const specific = [
    "restaurant", "breakfast", "brunch", "lunch", "dinner", "eat", "food", "taco", "pizza",
    "burger", "sushi", "bbq", "seafood", "steakhouse", "italian", "mexican", "thai", "chinese",
    "coffee", "cafe", "café", "bar", "pub", "cocktail", "brewery", "winery", "nightclub",
    "bike", "bicycle", "cycling", "kayak", "canoe", "paddleboard", "surf", "skate", "golf",
    "gym", "fitness", "yoga", "pilates", "crossfit", "pool", "tennis", "bowling",
    "spa", "massage", "salon", "barber", "nail",
    "museum", "gallery", "art", "theater", "cinema", "movie", "concert", "live music",
    "park", "trail", "hike", "beach", "waterpark", "water park", "amusement",
    "grocery", "supermarket", "pharmacy", "drug store", "cvs", "walgreens",
    "shopping", "mall", "boutique", "clothing", "shoes",
    "smoke", "vape", "tobacco", "cigar", "hookah",
    "dispensary", "cannabis",
    "gas station", "car wash", "auto",
    "hotel", "motel", "airbnb",
    "urgent care", "hospital", "clinic", "dentist", "doctor",
    "bank", "atm",
    "laundry", "dry clean",
    "pet store", "vet",
    "rent", "rental",
    "hardware", "home depot", "ace hardware", "lowe",
    "tire", "mechanic", "oil change", "auto repair",
    "locksmith", "storage", "print", "fedex", "ups store",
    "liquor", "wine store", "beer",
    "ice cream", "dessert", "bakery", "donut", "pastry",
    "food truck", "sandwich", "deli", "bagel",
    "florist", "flower",
    "jewelry", "watch", "antique",
    "bookstore", "book store",
    "itinerary", "plan a day", "plan my day", "day plan", "full day",
    "things to do", "activities", "attractions",
  ];
  if (specific.some((k) => m.includes(k))) return true;

  // Generic "find me a ___" / "where is a ___" / "___ near me" patterns — catches anything
  const genericPatterns = [
    /\bnear(by| me| here| us)\b/,
    /\baround here\b/,
    /\bin the area\b/,
    /\bclose by\b/,
    /\blocal\b/,
    /\bwhere (can|do|is|are)\b/,
    /\b(find|show|get) me\b/,
    /\blooking for\b/,
    /\bany .{2,30} (near|around|close|in)\b/,
    /\b\w+ shop\b/,
    /\b\w+ store\b/,
    /\b\w+ place\b/,
  ];
  return genericPatterns.some((re) => re.test(m));
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

function looksLikeDayPlanModification(userMessage: string): boolean {
  const m = userMessage.toLowerCase();
  // Signals that the guest wants to redo or modify a previously proposed full-day itinerary.
  // Does NOT include "more options" / "other options" — those are single-category rotation
  // requests handled by looksLikeMoreOptionsRequest, not full plan redos.
  return [
    'redo',
    'revise',
    'adjust',
    'change the plan',
    'update the plan',
    'modify',
    'make it better',
    'different version',
    'different plan',
    'redo the plan',
    'redo the day',
    'indoors',
    'indoor',
    'inside',
    'outdoor',
    'rainy',
    'vegetarian',
    'vegan',
    'romantic',
    'budget',
    'kid',
    'family',
  ].some((k) => m.includes(k));
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

function extractPlaceSearchTerms(userMessage: string): string {
  // Strip common filler from the front so Google Places gets clean search terms.
  let s = userMessage.trim();
  s = s.replace(/^(can you |could you |please )?(are there any|find me( a| an| some)?|show me( a| an| some)?|i('m| am) looking for( a| an| some)?|where (can i find|is there a?|are there( any)?)|give me( a| an| some)?|i want( to find)?( a| an| some)?|looking for( a| an| some)?|what (are|is)|tell me about( some)?|any good|any)\s+/i, '');
  // Strip trailing location phrases ("near me", "around here", etc.)
  s = s.replace(/\s*(near me|nearby|around here|in the area|close by|around|near here|close to here|in this area)\s*[?.!]?$/i, '').trim();
  return s.length >= 2 ? s : userMessage.trim();
}

function shapePlacesQuery(userMessage: string, property: { PropertyZipCode: string; PropertyAddress: string }) {
  const terms = extractPlaceSearchTerms(userMessage);
  const near = `near ${property.PropertyZipCode || ""} ${property.PropertyAddress || ""}`.trim();
  const meal = getMealIntent(terms);
  if (!meal) return `${terms} ${near}`.trim();
  if (meal === "dinner") return `${terms} dinner restaurant ${near}`.trim();
  if (meal === "lunch") return `${terms} lunch restaurant ${near}`.trim();
  if (meal === "breakfast") return `${terms} breakfast ${near}`.trim();
  if (meal === "brunch") return `${terms} brunch ${near}`.trim();
  return `${terms} ${near}`.trim();
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

function buildPlaceDescription(place: PlaceResult): string {
  // Priority 1: use Google's editorial summary — it's always place-specific.
  if (place.editorialSummary?.trim()) return place.editorialSummary.trim();

  // Priority 2: build a real description sentence from structured data.
  const typeRaw = place.primaryType
    || place.types?.find(t => !['point_of_interest', 'establishment', 'food', 'store', 'premise'].includes(t))
    || place.types?.[0]
    || 'local spot';
  const type = typeRaw.replace(/_/g, ' ').trim();
  const article = /^[aeiou]/i.test(type) ? 'An' : 'A';
  let description = `${article} ${type}.`;

  const extras: string[] = [];
  const priceMap: Record<string, string> = {
    PRICE_LEVEL_FREE: 'Free admission.',
    PRICE_LEVEL_INEXPENSIVE: 'Budget-friendly.',
    PRICE_LEVEL_MODERATE: 'Moderately priced.',
    PRICE_LEVEL_EXPENSIVE: 'Upscale.',
    PRICE_LEVEL_VERY_EXPENSIVE: 'Fine dining.',
  };
  if (place.priceLevel && priceMap[place.priceLevel]) extras.push(priceMap[place.priceLevel]);
  const services: string[] = [];
  if (place.dineIn) services.push('dine-in');
  if (place.takeout) services.push('takeout');
  if (place.delivery) services.push('delivery');
  if (services.length) extras.push(`Offers ${services.join(' and ')}.`);
  if (place.reservable) extras.push('Reservations available.');
  if (place.servesVegetarianFood) extras.push('Vegetarian-friendly.');
  if (place.servesBeer || place.servesWine) extras.push('Serves beer and wine.');

  return [description, ...extras].join(' ');
}

function placeBlurbFromApi(place: PlaceResult): string {
  return buildPlaceDescription(place);
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
  const cacheKey = `v1:${query.trim().toLowerCase()}`;
  const cached = getCachedPlaces(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 3500);
  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
    encodeURIComponent(query) +
    "&key=" +
    encodeURIComponent(apiKey);

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(tid);
  }
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
      const detailsTimeoutMs = Math.max(2500, Number(process.env.PLACES_DETAILS_TIMEOUT_MS || 5000));
      const tid = setTimeout(() => controller.abort(), detailsTimeoutMs);
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

  const out = [...enrichedTop, ...rest];
  setCachedPlaces(cacheKey, out);
  return out;
}

// AI-powered intent classifier — uses conversation history so follow-ups like
// "spa sounds great" are understood in context rather than keyword-matched blindly.
async function classifyWithAI(
  genAI: GoogleGenerativeAI,
  _modelId: string,
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
• "More options", "show me others", "other options", "something else", "different ones", "see more" → needsPlaces:true. Re-use the SAME category from the previous shown results as the placesQuery (e.g. if spas were shown, placesQuery should be "spa near ${near}").
• If the history shows a FULL-DAY ITINERARY and the guest wants to adjust/modify/redo it → isDayPlan:true, needsPlaces:true, dayPlanModifiers:"the preference".
• If the guest asks for any new type of place or activity (restaurant, spa, bike shop, grocery, smoke shop, bar, museum — anything) → isDayPlan:false, needsPlaces:true, placesQuery describes that specific thing.
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

  const model = genAI.getGenerativeModel({ model: getFastGeminiModelId(), generationConfig: { maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } } as any });
  const result = await withOverloadRetry(() => model.generateContent(prompt));
  // Strip any markdown fences (global), then find the outermost JSON object —
  // same approach used for place-description parsing; far more robust than anchored strip.
  let raw = result.response.text().replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  const jStart = raw.indexOf("{");
  const jEnd = raw.lastIndexOf("}");
  if (jStart !== -1 && jEnd > jStart) raw = raw.slice(jStart, jEnd + 1);

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
    // These are stateless lookups — always apply regardless of conversation history.
    const propertyFastPathEnabled = (process.env.CHAT_PROPERTY_FAST_PATH || "1") !== "0";
    if (propertyFastPathEnabled && looksLikePropertyInfoQuestion(message)) {
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
          { kind: "property", address: property.PropertyAddress || "", zip: property.PropertyZipCode || "", houseRules: "", managerPhone: property.ManagerPhone || "", wifiName: property.WiFiName || "", model: "fast-property" } satisfies ChatOkResponse,
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
        .then(r => r.slice(0, 12))
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

    // Was a full-day itinerary shown earlier? If so, follow-ups should redo the plan.
    const historyHasItinerary = history.some(
      (h) => h.role === "model" && h.text.includes("[Showed a full-day itinerary")
    );

    const wantsMoreOptions = looksLikeMoreOptionsRequest(message);

    // For "more options" requests, extract the previous shown category from history so we
    // can re-run the same query with an offset. Used as a fallback if the classifier misses it.
    let prevCategoryQuery = "";
    if (wantsMoreOptions && historyHasPlacesContext) {
      for (let i = history.length - 1; i >= 0; i--) {
        const h = history[i];
        if (h.role !== "model") continue;
        const m = h.text.match(/\[Showed place recommendations \(([^)]+)\)/);
        if (m) { prevCategoryQuery = `${m[1]} near ${near}`; break; }
        if (h.text.includes("[Showed a full-day itinerary")) { prevCategoryQuery = `restaurants and activities near ${near}`; break; }
      }
    }

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
        } else if (wantsMoreOptions && prevCategoryQuery) {
          // "More options" — classifier missed it; re-fetch the previous category.
          smartPlacesQuery = prevCategoryQuery;
          wantsLocal = true;
        } else if (forceLocal) {
          // Use the raw message as the query — never recycle the old category from history
          // since the guest may be asking about a completely different type of place.
          smartPlacesQuery = `${message} near ${near}`;
        }

        // Safety net (narrow): if an itinerary was shown earlier and the guest is clearly
        // trying to adjust/redo the plan, default to day-plan mode even if the classifier
        // missed it. NEVER triggers for "more options" requests — those are single-category
        // rotations, not plan redos.
        if (historyHasItinerary && wantsLocal && !wantsDayPlan && !wantsMoreOptions && looksLikeDayPlanModification(message)) {
          wantsDayPlan = true;
        }
        // When redoing the plan without a modifier from the classifier, use the raw
        // message so keywords like "indoor", "vegetarian", "romantic" are picked up.
        if (wantsDayPlan && !smartPlacesModifier) {
          smartPlacesModifier = message;
        }
      } catch {
        wantsLocal = keywordWantsLocal || forceLocal;
        if (historyHasItinerary && wantsLocal && looksLikeDayPlanModification(message)) {
          wantsDayPlan = true;
          smartPlacesModifier = message;
        }
        // For "more options", re-fetch the previous category even when classifier fails.
        if (wantsMoreOptions && prevCategoryQuery) {
          smartPlacesQuery = prevCategoryQuery;
          wantsLocal = true;
        }
        // Otherwise keep the shapePlacesQuery already set from the current message —
        // never recycle the old category for a completely different follow-up request.
      }
    } else if (wantsLocal || wantsDayPlan) {
      // First message: run classifier with empty history to get a clean Places query.
      // shapePlacesQuery already strips filler words, but the classifier also resolves
      // ambiguous phrasing ("find me a smoke shop" → "smoke shop near [zip]").
      try {
        const intent = await classifyWithAI(genAI, modelId, [], message, near, false);
        if (intent.needsPlaces || intent.isDayPlan) {
          smartPlacesQuery = intent.placesQuery;
        }
        wantsDayPlan = intent.isDayPlan || keywordWantsDayPlan;
        if (intent.isDayPlan) smartPlacesModifier = intent.dayPlanModifiers || '';
      } catch {
        // keep keyword-based shapePlacesQuery as-is
      }
    }

    // ── Fetch live data ───────────────────────────────────────────────────────
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
        (await withOverloadRetry(async () => {
          try {
            return await placesTextSearchV1(placesKey, query);
          } catch {
            // Fallback to legacy if v1 isn't enabled on the key.
            return await placesTextSearchLegacy(placesKey, query);
          }
        // Fetch up to 12 so "more options" requests can show a distinct second page (offset 5).
        })).slice(0, 12);

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
        const filteredPlaces = filterPlacesForIntent(message, rawPlaces);
        livePlaces = filteredPlaces.length >= 3 ? filteredPlaces : (filteredPlaces.length < rawPlaces.length ? rawPlaces : filteredPlaces);
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

    // Enrich single-category results with phone/website now.
    // Descriptions are generated later, after systemInstruction is built with full place context.
    let singlePlacesSelected: PlaceResult[] = [];
    if (wantsLocal && !wantsDayPlan && livePlaces.length > 0) {
      if (wantsMoreOptions) {
        const shownKeys = new Set(livePlaces.slice(0, 5).map(normalizePlaceKey));
        const nextBatch = livePlaces.filter((p) => !shownKeys.has(normalizePlaceKey(p))).slice(0, 5);
        singlePlacesSelected = nextBatch.length >= 3 ? nextBatch : livePlaces.slice(0, 5);
      } else {
        singlePlacesSelected = livePlaces.slice(0, 5);
      }
      if (singlePlacesSelected.length > 0) {
        try {
          const placesKey = requireGooglePlacesApiKey();
          const missingDetails = singlePlacesSelected.filter((p) => p.placeId && !p.phone);
          if (missingDetails.length) {
            const settled = await Promise.allSettled(
              missingDetails.map(async (p) => {
                const detailsUrl =
                  "https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
                  encodeURIComponent(String(p.placeId)) +
                  "&fields=" +
                  encodeURIComponent("formatted_phone_number,website,url") +
                  "&key=" +
                  encodeURIComponent(placesKey);
                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), Math.max(2500, Number(process.env.PLACES_DETAILS_TIMEOUT_MS || 5000)));
                try {
                  const res = await fetch(detailsUrl, { cache: 'no-store', signal: controller.signal });
                  if (!res.ok) return p;
                  const json = (await res.json()) as { status?: string; result?: { formatted_phone_number?: string; website?: string; url?: string } };
                  if (json.status !== 'OK') return p;
                  return { ...p, phone: json.result?.formatted_phone_number || p.phone, websiteUri: json.result?.website || p.websiteUri, googleMapsUri: json.result?.url || p.googleMapsUri };
                } finally { clearTimeout(tid); }
              })
            );
            const byId = new Map(settled.map((r, i) => [missingDetails[i].placeId, r.status === 'fulfilled' ? r.value : missingDetails[i]]));
            for (let i = 0; i < singlePlacesSelected.length; i++) {
              const id = singlePlacesSelected[i].placeId;
              if (!id) continue;
              const enriched = byId.get(id);
              if (enriched) singlePlacesSelected[i] = enriched;
            }
          }
        } catch { /* best-effort */ }
      }
    }

    // ── Gemini text response with full conversation history ───────────────────
    const fmtPlace = (p: PlaceResult) => {
      const parts = [
        p.name,
        p.formattedAddress ? `Address: ${p.formattedAddress}` : null,
        p.editorialSummary ? `Description: ${p.editorialSummary}` : null,
        typeof p.rating === "number" ? `Rating: ${p.rating}` : null,
        p.priceLevel ? `Price: ${p.priceLevel.replace(/_/g, ' ')}` : null,
        p.primaryType ? `Type: ${p.primaryType.replace(/_/g, ' ')}` : null,
        [p.dineIn && 'dine-in', p.takeout && 'takeout', p.delivery && 'delivery', p.reservable && 'reservations', p.servesVegetarianFood && 'vegetarian options'].filter(Boolean).join(', ') || null,
        p.phone ? `Phone: ${p.phone}` : null,
        p.websiteUri ? `Website: ${p.websiteUri}` : null,
        p.googleMapsUri ? `Maps: ${p.googleMapsUri}` : null,
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

    // ── Single-category places: Gemini generates descriptions with full place context ──
    // systemInstruction already has all place data (editorialSummary, type, price, etc.)
    // via fmtPlace — same setup that makes day-plan descriptions work perfectly.
    if (singlePlacesSelected.length > 0) {
      const enrichedForDesc = singlePlacesSelected;

      let descBlurbs: Record<string, string> = {};
      let descIntro: string | undefined;
      try {
        // Build a fresh placesText that includes any website-sourced editorialSummary.
        const enrichedPlacesText = enrichedForDesc.map((p) => {
          const parts = [
            p.name,
            p.formattedAddress ? `Address: ${p.formattedAddress}` : null,
            p.editorialSummary ? `Description: ${p.editorialSummary}` : null,
            typeof p.rating === 'number' ? `Rating: ${p.rating}` : null,
            p.priceLevel ? `Price: ${p.priceLevel.replace(/_/g, ' ')}` : null,
            p.primaryType ? `Type: ${p.primaryType.replace(/_/g, ' ')}` : null,
            [p.dineIn && 'dine-in', p.takeout && 'takeout', p.delivery && 'delivery', p.reservable && 'reservations', p.servesVegetarianFood && 'vegetarian options'].filter(Boolean).join(', ') || null,
          ].filter(Boolean);
          return `- ${parts.join(' | ')}`;
        }).join('\n');

        const descSystemInstruction = [
          'You are Pillar — a warm, knowledgeable concierge for a luxury private estate.',
          '',
          '## Live local data (Google Places)',
          enrichedPlacesText,
          '',
          '## Guidelines',
          '- Write descriptions using the Description, Type, Price, and attributes only.',
          '- Never mention the location, address, city, or rating in the description.',
          '- If no Description is provided, write from the Type and Name — make it specific and useful.',
          '- Never write "I don\'t have information". Always write something compelling.',
          '- Tone: confident, warm, specific — no filler phrases like "a great place to visit".',
        ].join('\n');

        // JSON response mode: forces clean JSON output and avoids thinking overhead
        // consuming all the token budget before visible output is generated.
        const descModel = genAI.getGenerativeModel({
          model: getFastGeminiModelId(),
          systemInstruction: descSystemInstruction,
          generationConfig: {
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          } as any,
        });
        const names = enrichedForDesc.map((p) => `"${p.name}"`).join(', ');
        const descPrompt = `Write concierge-voice descriptions for these places. Use Description data when available; otherwise use the Type and Name to craft something specific. Do not mention the location, address, city, or rating anywhere in the descriptions. Also write one short warm intro sentence (max 20 words) for the overall list.\n\nPlaces: ${names}\n\nReturn JSON:\n{"intro":"one warm intro sentence","blurbs":[{"name":"Exact Name","blurb":"2-3 sentence description"}]}`;

        // Always use generateContent — description generation is structured data extraction,
        // not conversation continuation. Chat history about prior places confuses the model.
        const r = await withOverloadRetry(() => descModel.generateContent(descPrompt));
        const rawDescText = r.response.text();
        const strippedDesc = rawDescText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
        const dS = strippedDesc.indexOf('{');
        const dE = strippedDesc.lastIndexOf('}');
        const cleanedDesc = dS !== -1 && dE > dS ? strippedDesc.slice(dS, dE + 1) : strippedDesc.trim();
        const parsedDesc = JSON.parse(cleanedDesc) as { intro?: string; blurbs?: Array<{ name: string; blurb: string }> };
        if (typeof parsedDesc.intro === 'string' && parsedDesc.intro.trim()) descIntro = parsedDesc.intro.trim();
        for (const b of parsedDesc.blurbs ?? []) {
          if (b.name && b.blurb) descBlurbs[b.name.toLowerCase().trim()] = stripMarkdown(b.blurb);
        }
      } catch { /* fall through to buildPlaceDescription */ }

      return Response.json(
        {
          kind: 'places',
          label: getPlacesLabel(message),
          intro: descIntro,
          places: enrichedForDesc.map((p) => ({
            name: p.name,
            cuisine: inferCuisine(p),
            blurb: descBlurbs[p.name.toLowerCase().trim()] || placeBlurbFromApi(p),
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

For each blurb: write 2-3 sentences that are SPECIFIC to that actual place. Use the Description, Type, Price, and attribute data provided (dine-in, vegetarian, reservations, etc.) to ground every sentence in what that place actually is. Do not write generic descriptions. Do not mention location, address, city, or rating in any blurb.

Return ONLY valid JSON (no markdown fences, no extra text):
{"sections":[{"title":"Breakfast","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]},{"title":"Morning Activity","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]},{"title":"Lunch","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]},{"title":"Afternoon Activity","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]},{"title":"Dinner","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]},{"title":"Dessert","places":[{"name":"Exact Name","blurb":"2-3 sentence description specific to this place"}]}]}`;

        // Always use generateContent for itinerary — structured data extraction, not chat continuation.
        const r2 = await withOverloadRetry(() => itModel.generateContent(itPrompt));
        const rawText = r2.response.text();

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
              const blurbModel = genAI.getGenerativeModel({ model: modelId, generationConfig: { maxOutputTokens: 700 } });
              const placeCtx = allSelected.map((p) => {
                const attrs: string[] = [];
                if (p.editorialSummary) attrs.push(`Google description: "${p.editorialSummary}"`);
                if (p.rating) attrs.push(`Rating: ${p.rating}`);
                if (p.priceLevel) attrs.push(`Price: ${p.priceLevel.replace(/_/g, ' ')}`);
                const typeStr2 = p.primaryType || (p.types && p.types.length > 0 ? p.types.find(t => !['point_of_interest','establishment','food'].includes(t)) || p.types[0] : undefined);
                if (typeStr2) attrs.push(`Type: ${typeStr2.replace(/_/g, ' ')}`);
                if (p.dineIn) attrs.push('dine-in');
                if (p.takeout) attrs.push('takeout');
                if (p.reservable) attrs.push('accepts reservations');
                if (p.servesVegetarianFood) attrs.push('vegetarian options');
                return `Name: ${p.name}\n  Location: ${p.formattedAddress ? p.formattedAddress.split(',').slice(0, 2).join(',') : 'nearby'}\n  ${attrs.length ? attrs.join(' | ') : '(no additional data)'}`.trimEnd();
              }).join('\n\n');
              const blurbPrompt = `You are a luxury estate concierge building a day itinerary. For each place write 2-3 sentences SPECIFIC to what that place actually is — use the description, type, and attribute data provided. Do not mention location, address, city, or rating in any description. Plain text only, no markdown. Return ONLY valid JSON, no markdown fences: {"blurbs":[{"name":"exact name","blurb":"2-3 sentence description"}]}\n\nPlaces:\n${placeCtx}`;
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
