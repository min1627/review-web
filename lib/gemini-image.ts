/**
 * Google Gemini API — Image Generation & Editing
 * Official docs: https://ai.google.dev/gemini-api/docs/image-generation
 *
 * API Key: https://aistudio.google.com → "Get API Key"
 */

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash-image";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. Google AI Studio에서 발급하세요: https://aistudio.google.com");
  return key;
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    };
  }>;
  error?: { message: string; code: number };
}

async function callGemini(
  contents: Array<{ role: string; parts: GeminiPart[] }>,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API 오류 (${response.status}): ${errText}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini API: ${data.error.message}`);
  }

  // Find image part in response
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data; // base64 encoded image
    }
  }

  throw new Error("Gemini API 응답에 이미지가 포함되지 않았습니다.");
}

/**
 * Edit an existing image with a text prompt
 */
export async function editImage(params: {
  imageBase64: string;
  mimeType?: string;
  prompt: string;
}): Promise<string> {
  // Strip data URL prefix if present
  const base64 = params.imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = params.mimeType || "image/png";

  return callGemini([
    {
      role: "user",
      parts: [
        { text: params.prompt },
        { inlineData: { mimeType, data: base64 } },
      ],
    },
  ]);
}

/**
 * Generate a new image from a text prompt
 */
export async function generateImage(params: {
  prompt: string;
}): Promise<string> {
  return callGemini([
    {
      role: "user",
      parts: [{ text: params.prompt }],
    },
  ]);
}
