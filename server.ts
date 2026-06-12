/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser configuration to accept base64 image uploads for crop stress scanners
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy GoogleGenAI client initialization to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is missing or unconfigured. Please configure it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Diagnose Crop Stress (Pests, diseases, nutrient deficiency)
app.post("/api/diagnose", async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropName, notes, region, language, imageBase64 } = req.body;
    const ai = getGenAIClient();

    const parts: any[] = [];

    // System advice context based on user language
    const currentLang = language || "English";
    const currentRegion = region || "West Africa";

    let promptText = `You are a professional Agronomist and Crop Protection Expert specializing in West African farming ecosystems.
Diagnose the crop stress condition for the following crop: "${cropName}".
Farmer's Location/Region: "${currentRegion}"
Farmer's observed symptoms & field notes: "${notes || "No extra symptoms described"}"

Please provide your diagnostic advice entirely in the language: "${currentLang}" but keep terminology simple and accessible for smallholder farmers.

Generate a structured JSON output with the exact schema returned. Focus on highly realistic organic remedies, home-grown solutions (like neem tree oil/boiled solutions, wood ash, biological repellents, manual thinning, or pest traps) which are low cost and offline-reproducible.`;

    parts.push({ text: promptText });

    if (imageBase64) {
      // Decode image base64 if available
      const mimeType = imageBase64.startsWith("data:") 
        ? imageBase64.slice(5, imageBase64.indexOf(";")) 
        : "image/png";
      const cleanData = imageBase64.includes(",") 
        ? imageBase64.substring(imageBase64.indexOf(",") + 1) 
        : imageBase64;

      parts.push({
        inlineData: {
          mimeType,
          data: cleanData
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: "You are a friendly, humble agricultural advisory scientist. You always give practical solutions using local West African context and materials.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["diseaseName", "confidence", "description", "remedies", "preventions", "organicAlternatives"],
          properties: {
            diseaseName: {
              type: Type.STRING,
              description: "The name of the diagnosed plant disease, pest, or nutrient deficiency."
            },
            confidence: {
              type: Type.NUMBER,
              description: "The probability/confidence score between 0.0 and 1.0."
            },
            description: {
              type: Type.STRING,
              description: "A simple, clear explanation of what this condition is and why it happens, translated into the farmer's target language."
            },
            remedies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of immediate organic/remedial actions the farmer can take (e.g., pruning, spraying homemade neem solutions, burying infected pods)."
            },
            preventions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of preventative measures to stop this condition from returning next season (e.g., resistant seed stock, proper spacing, drainage layouts)."
            },
            organicAlternatives: {
              type: Type.STRING,
              description: "A summary highlighting affordable, locally available organic materials as substitutes for expensive chemical pesticides."
            }
          }
        }
      }
    });

    const diagnosisText = response.text || "{}";
    res.json(JSON.parse(diagnosisText));
  } catch (err: any) {
    console.error("DIAGNOSE ERROR:", err);
    res.status(500).json({ 
      error: err.message || "An unexpected error occurred during crop diagnosis." 
    });
  }
});

// 2. Generate Localized Climate-Smart Cropping Calendar & Timeline
app.post("/api/generate-plan", async (req: Request, res: Response): Promise<void> => {
  try {
    const { cropName, region, soilType, language } = req.body;
    const ai = getGenAIClient();

    const currentLang = language || "English";
    const currentRegion = region || "West Africa";

    const promptText = `Generate a localized, climate-smart cropping calendar and farming guide for:
Crop Type: "${cropName}"
Region: "${currentRegion}"
Soil Profile: "${soilType || "standard loamy soil"}"
Target Language: "${currentLang}"

Break down the optimal timeline into 4 stages: Land Preparation, Planting & Spacing, Crop Management, and Harvesting & Curing.
Keep instructions tailored around eco-friendly regenerative agriculture, moisture-saving layouts (e.g., zero-tillage, natural mulching, contour bands) to combat unpredictable weather spikes as of 2026.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are an expert agronomist specialized in West African smallholder climate adaptation. You output accurate agro-ecological timelines reflecting wet/dry transitions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["cropName", "region", "notes", "timeline"],
          properties: {
            cropName: { type: Type.STRING },
            region: { type: Type.STRING },
            notes: { type: Type.STRING, description: "A high-level climate-smart warning or adaptation note based on 2026 weather trends." },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phase", "timing", "tasks", "requirements"],
                properties: {
                  phase: { type: Type.STRING, description: "Phase title, e.g., Land Prep, Sowing, Tending, Harvest" },
                  timing: { type: Type.STRING, description: "Optimal weeks or weather trigger to begin this phase" },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Step-by-step practical, rustic instructions"
                  },
                  requirements: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Rustic/low-cost materials or tools required (e.g., visual stakes, hand hoe, organic compost)"
                  }
                }
              }
            }
          }
        }
      }
    });

    const planText = response.text || "{}";
    res.json(JSON.parse(planText));
  } catch (err: any) {
    console.error("PLAN GENERATION ERROR:", err);
    res.status(500).json({ 
      error: err.message || "An unexpected error occurred during cropping plan generation." 
    });
  }
});

// 3. Multilingual Synthetic Audio Advisory Read-aloud simulation
app.post("/api/audio-advisory", async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, languageCode } = req.body;
    const ai = getGenAIClient();

    if (!text) {
      res.status(400).json({ error: "Text to synthesize is required." });
      return;
    }

    // Translating and reading aloud together utilizing Gemini 3.1 TTS
    const voicePrompt = `You are a rural radio announcer reading local farming advisory bulletins in a clear, friendly accent. Translating into code "${languageCode}" first if appropriate, read the following report aloud:
"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: voicePrompt }] }],
      config: {
        // responseModalities must be ['AUDIO'] for TTS model
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        audioBase64: base64Audio,
        playbackMime: "audio/pcm;rate=24000",
        message: "Audio synthesized successfully. Ready for 24kHz PCM browser slot playback."
      });
    } else {
      res.status(502).json({ 
        error: "Voice synthesizer didn't output audio bytes. Returning text translation instead.",
        translationOnly: true
      });
    }
  } catch (err: any) {
    console.error("TTS AUDIO ERROR:", err);
    res.status(500).json({ 
      error: err.message || "An unexpected error occurred during voice synthesization." 
    });
  }
});

// Setup Vite Dev server or Serve build assets
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite development middlewares
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[West African Farmer Advisory] Full-stack Server running at http://localhost:${PORT}`);
  });
}

bootstrap();
