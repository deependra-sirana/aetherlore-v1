import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { CharacterInput, NarrativeResponse } from "./types";
import { SecurityScanResult, constructHardenedPrompt } from "./security";

/**
 * Dispatches character generation exclusively to live AI providers (Google Gemini or OpenAI).
 * If no API keys are configured or if the live API call fails, throws an explicit error
 * so the API route can return a clean 500 error with the specific failure reason.
 */
export async function generateNarrative(
  input: CharacterInput,
  scanResult: SecurityScanResult
): Promise<NarrativeResponse> {
  const startTime = Date.now();
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();
  const configuredProvider = (process.env.AI_PROVIDER || "auto").toLowerCase();

  const isGeminiAvailable = Boolean(
    geminiApiKey &&
    geminiApiKey.length > 5 &&
    geminiApiKey !== "your_gemini_api_key_here"
  );

  const isOpenAiAvailable = Boolean(
    openAiApiKey &&
    openAiApiKey.length > 5 &&
    openAiApiKey !== "your_openai_api_key_here"
  );

  if (!isGeminiAvailable && !isOpenAiAvailable) {
    throw new Error(
      "No valid AI API key found. Please set GEMINI_API_KEY (Google Gemini) or OPENAI_API_KEY (OpenAI) in your environment variables."
    );
  }

  const { systemInstruction, userMessage } = constructHardenedPrompt(input, scanResult);

  let lastError: Error | null = null;

  // 1. Attempt Google Gemini if available
  if (isGeminiAvailable && (configuredProvider === "gemini" || configuredProvider === "auto")) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey as string);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.75,
        },
      });

      const result = await model.generateContent(userMessage);
      const responseText = result.response.text();
      const latencyMs = Date.now() - startTime;

      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Gemini returned an empty response.");
      }

      const cleanedText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleanedText);

      return {
        characterName: parsed.characterName || input.name,
        archetype: parsed.archetype || input.archetype,
        genre: parsed.genre || input.genre,
        title: parsed.title || `${input.name}, The Legend`,
        summary: parsed.summary || "",
        mainStory: parsed.mainStory || "",
        questHooks: Array.isArray(parsed.questHooks) ? parsed.questHooks : [],
        sampleDialogue: Array.isArray(parsed.sampleDialogue) ? parsed.sampleDialogue : [],
        statProfile: parsed.statProfile || {
          primaryStat: "Resilience",
          signatureAbility: "Primary Ability",
          factionAllegiance: "Independent",
          moralAlignment: "Neutral",
        },
        securityAudit: {
          sanitized: true,
          injectionAttemptDetected: !scanResult.isSafe,
          injectionConfidence: scanResult.confidence,
          filteredPatterns: scanResult.detectedPatterns,
          processingLatencyMs: latencyMs,
          provider: "Google Gemini 1.5 Flash (Live)",
        },
      };
    } catch (geminiError) {
      console.error("Google Gemini live API execution failed:", geminiError);
      lastError = geminiError instanceof Error ? geminiError : new Error(String(geminiError));
      
      // If OpenAI is not available or user explicitly chose gemini, don't try OpenAI
      if (!isOpenAiAvailable || configuredProvider === "gemini") {
        throw new Error(`Google Gemini API error: ${lastError.message}`);
      }
    }
  }

  // 2. Attempt OpenAI if available
  if (isOpenAiAvailable && (configuredProvider === "openai" || configuredProvider === "auto")) {
    try {
      const openai = new OpenAI({ apiKey: openAiApiKey as string });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content || content.trim().length === 0) {
        throw new Error("OpenAI returned an empty response.");
      }

      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(content.trim());

      return {
        characterName: parsed.characterName || input.name,
        archetype: parsed.archetype || input.archetype,
        genre: parsed.genre || input.genre,
        title: parsed.title || `${input.name}, The Legend`,
        summary: parsed.summary || "",
        mainStory: parsed.mainStory || "",
        questHooks: Array.isArray(parsed.questHooks) ? parsed.questHooks : [],
        sampleDialogue: Array.isArray(parsed.sampleDialogue) ? parsed.sampleDialogue : [],
        statProfile: parsed.statProfile || {
          primaryStat: "Resilience",
          signatureAbility: "Primary Ability",
          factionAllegiance: "Independent",
          moralAlignment: "Neutral",
        },
        securityAudit: {
          sanitized: true,
          injectionAttemptDetected: !scanResult.isSafe,
          injectionConfidence: scanResult.confidence,
          filteredPatterns: scanResult.detectedPatterns,
          processingLatencyMs: latencyMs,
          provider: "OpenAI GPT-4o-Mini (Live)",
        },
      };
    } catch (openAiError) {
      console.error("OpenAI live API execution failed:", openAiError);
      lastError = openAiError instanceof Error ? openAiError : new Error(String(openAiError));
      throw new Error(`OpenAI API error: ${lastError.message}`);
    }
  }

  throw new Error(
    lastError ? `AI Generation failed: ${lastError.message}` : "Failed to generate narrative from configured AI providers."
  );
}
