import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireGeminiApiKey(): string {
  const v = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!v) {
    throw new Error(
      "Gemini API key must be set. Add GEMINI_API_KEY (preferred) or GOOGLE_API_KEY to .env.local"
    );
  }
  return v;
}

type GeminiModelListResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

export async function GET() {
  try {
    const apiKey = requireGeminiApiKey();

    // Prefer REST listing because @google/generative-ai v0.24.1 doesn't expose listModels().
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as GeminiModelListResponse;

    const models = (data.models || [])
      .map((m) => ({
        name: m.name || "",
        supportedGenerationMethods: m.supportedGenerationMethods || [],
      }))
      .filter((m) => m.name);

    // Also show a curated list of models that support generateContent.
    const generateContentModels = models
      .filter((m) =>
        m.supportedGenerationMethods.some(
          (x) => x.toLowerCase() === "generatecontent"
        )
      )
      .map((m) => m.name);

    // Smoke: instantiate SDK (ensures package is loadable in this runtime)
    void new GoogleGenerativeAI("DUMMY");

    return Response.json({ models, generateContentModels });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
