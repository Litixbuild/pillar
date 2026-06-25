import { GoogleGenerativeAI } from '@google/generative-ai';

function requireGeminiApiKey(): string {
  const v = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!v) {
    throw new Error('Gemini API key must be set. Add GEMINI_API_KEY (preferred) or GOOGLE_API_KEY to your environment.');
  }
  return v;
}

function getModelId(): string {
  return (process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash').trim();
}

function getVertexApiKey(): string | null {
  return process.env.VERTEX_API_KEY?.trim() || null;
}

function getVertexModelId(): string {
  return (process.env.VERTEX_MODEL?.trim() || 'gemini-2.5-flash-lite').trim();
}

const SYSTEM_INSTRUCTION = [
  "You draft factual incident-documentation narratives for short-term rental hosts to attach to a damage claim",
  "or review dispute with whichever booking platform they list their property on.",
  "",
  "Rules:",
  "1. Use ONLY the facts provided in the prompt — never invent dates, counts, names, or details not given to you.",
  "2. Write in a neutral, professional, objective tone. No accusatory language, no speculation about guest intent.",
  "3. Structure as 2-4 short paragraphs: (a) the stay and the cleanliness confirmation recorded on arrival,",
  "   (b) any damage documented and when, (c) a closing sentence noting this is host-prepared documentation.",
  "4. Do not name or cite any specific booking platform or its policy language — that is handled elsewhere.",
  "5. If no damage was reported, state plainly that the unit's condition was confirmed clean at arrival and",
  "   no damage was documented during this stay. Do not fabricate an incident.",
  "6. Output plain text only — no markdown, no headers, no bullet points.",
].join('\n');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isOverloadedError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e || '')).toLowerCase().trim();
  return (
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('temporarily') ||
    msg.includes('high demand') ||
    msg.includes('retry') ||
    msg.includes('429') ||
    msg.includes('503')
  );
}

async function withOverloadRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  const baseDelayMs = 700;
  const maxDelayMs = 5000;

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
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { role: 'system', parts: [{ text: opts.systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: opts.userText }] }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vertex generateContent failed (HTTP ${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

export async function draftStayNarrative(facts: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(requireGeminiApiKey());
    const model = genAI.getGenerativeModel({ model: getModelId(), systemInstruction: SYSTEM_INSTRUCTION });
    const result = await withOverloadRetry(() => model.generateContent(facts));
    const text = result.response.text().trim();
    if (!text) throw new Error('Gemini returned an empty narrative');
    return text;
  } catch (e) {
    if (isOverloadedError(e)) {
      const vertexKey = getVertexApiKey();
      if (vertexKey) {
        try {
          const text = await vertexGenerateContent({
            apiKey: vertexKey,
            model: getVertexModelId(),
            systemInstruction: SYSTEM_INSTRUCTION,
            userText: facts,
          });
          const trimmed = text.trim();
          if (trimmed) return trimmed;
        } catch (vertexError) {
          console.error('[stayReportNarrative] Vertex fallback also failed:', vertexError);
        }
      }
      throw new Error('The AI model is temporarily overloaded. Please try generating the report again in a moment.');
    }
    throw e;
  }
}
