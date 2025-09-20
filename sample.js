import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateImage(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateImage({
      prompt: prompt,
      size: "1024x1024", // can be 512x512, 1024x1024, etc.
    });

    // The image is returned as base64
    const imageBase64 = result.data[0].b64_json;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    fs.writeFileSync("generated.png", imageBuffer);
    console.log("✅ Image saved as generated.png");
  } catch (err) {
    console.error("❌ Error generating image:", err);
  }
}

// Example usage
generateImage("A futuristic city skyline at night with flying cars");
