/**
 * Generate an image from a text prompt using the Gemini image-generation model
 * (Nano Banana) via the official @google/genai SDK, and save it as a PNG.
 *
 * Usage:
 *   pnpm gen:image "a minimalist dashboard UI for an HR app, soft indigo accents"
 *
 * Requires GEMINI_API_KEY in .env. The model defaults to the current
 * gemini-3.1-flash-image and can be overridden with GEMINI_IMAGE_MODEL.
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
const OUTPUT_DIR = path.join(process.cwd(), "public", "generated");

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY. Add it to .env (GEMINI_API_KEY=...).");
    process.exit(1);
  }

  const prompt = process.argv.slice(2).join(" ").trim();
  if (!prompt) {
    console.error('Usage: pnpm gen:image "your image prompt here"');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log(`Generating image with ${MODEL}…`);
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    // No image came back — surface any text the model returned (often a
    // safety refusal or clarification) so the failure is debuggable.
    const text = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join("\n");
    console.error(`No image was returned by ${MODEL}.${text ? `\nModel said: ${text}` : ""}`);
    process.exit(1);
  }

  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  await mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `${Date.now()}-${slugify(prompt)}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await writeFile(filepath, buffer);

  console.log(`Saved ${(buffer.length / 1024).toFixed(1)} KB → public/generated/${filename}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
