import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const DEFAULT_MODEL = "gemini-1.5-flash-latest";
export { ai };


// documentation : https://ai.google.dev/gemini-api/docs#javascript