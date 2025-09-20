// gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

export async function generateImage(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    const result = await model.generateContent(prompt);

    // Extract the inline image data
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        // Convert Base64 into a browser-friendly Data URL
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image found in Gemini response");
  } catch (err) {
    console.error("Image generation error:", err);
    return "/placeholder.svg"; // fallback
  }
}
