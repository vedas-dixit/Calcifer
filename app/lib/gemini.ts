import { GoogleGenerativeAI } from "@google/generative-ai";

// gemini-2.5-pro: most capable, best for complex analysis
const MODEL = "gemini-2.5-pro";

export async function generateAnalysis(
  prompt: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.4,     // focused and consistent
      maxOutputTokens: 8192,
    },
  });

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("API_KEY_INVALID") || msg.includes("401")) {
      throw new Error("Invalid Gemini API key. Update it in Settings (⚙).");
    }
    if (msg.includes("QUOTA_EXCEEDED") || msg.includes("429")) {
      throw new Error(
        "Gemini API quota exceeded. Wait a minute or upgrade your Google AI Studio plan."
      );
    }
    if (msg.includes("SAFETY")) {
      throw new Error(
        "Gemini blocked the response for safety reasons. Try a different repository or focus area."
      );
    }
    throw new Error(`Gemini error: ${msg}`);
  }

  const text = result.response.text();
  if (!text || text.trim().length === 0) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }
  return text;
}
