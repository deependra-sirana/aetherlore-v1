import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { CharacterInput, NarrativeResponse } from "./types";
import { SecurityScanResult, constructHardenedPrompt } from "./security";

/**
 * Fallback procedural generator that produces rich, contextual game lore
 * if no external API key (Gemini / OpenAI) is configured.
 */
function generateContextualFallbackLore(
  input: CharacterInput,
  scanResult: SecurityScanResult,
  latencyMs: number
): NarrativeResponse {
  const genreTitles: Record<string, string> = {
    cyberpunk: "The Ghost in the Fiber Matrix",
    dark_fantasy: "The Ashen Covenant's Curse",
    sci_fi_space_opera: "Vanguard of the Outer Rim",
    post_apocalyptic: "Scavenger of the Obsidian Dunes",
    steampunk: "Architect of the Brass Leviathan",
    eldritch_horror: "Bearer of the Unspoken Cipher",
    high_fantasy: "Champion of the Sunstone Citadel",
  };

  const archetypeAbilities: Record<string, { stat: string; ability: string; faction: string; alignment: string }> = {
    netrunner: {
      stat: "Cybernetic Synapse 94%",
      ability: "Zero-Day Memory Siphon",
      faction: "Glitchware Underground",
      alignment: "Chaotic Pragmatic",
    },
    void_walker: {
      stat: "Void Resonance IV",
      ability: "Singularity Step",
      faction: "The Eclipse Concordat",
      alignment: "Neutral Neutral",
    },
    eldritch_scholar: {
      stat: "Forbidden Insight 88/100",
      ability: "Whisper of the Thousand-Eyed",
      faction: "The Miskatonic Synod",
      alignment: "Chaotic Curious",
    },
    fallen_paladin: {
      stat: "Corrupted Faith +15",
      ability: "Wrath of the Fractured Oath",
      faction: "Order of the Bleeding Sun",
      alignment: "Lawful Renegade",
    },
    cyber_samurai: {
      stat: "Mono-Molecular Edge 100",
      ability: "Chronos Blade Dance",
      faction: "Kurogane Conglomerate",
      alignment: "Lawful Neutral",
    },
    alchemical_artificer: {
      stat: "Transmutation Catalyst 92%",
      ability: "Aetheric Overcharge",
      faction: "Guild of Guilded Gears",
      alignment: "Chaotic Good",
    },
    shadow_infiltrator: {
      stat: "Cloaking Matrix Mk.VII",
      ability: "Phantom Silhouette",
      faction: "The Whisper Ring",
      alignment: "True Neutral",
    },
    biotech_mutant: {
      stat: "Adaptive Gene Splice 8.4",
      ability: "Chitinous Hyper-Regen",
      faction: "The Bio-Liberation Front",
      alignment: "Chaotic Neutral",
    },
    renegade_captain: {
      stat: "Command Aura & Grav-Tactics",
      ability: "Orbital Salvo Call",
      faction: "The Free Corsair Fleet",
      alignment: "Chaotic Good",
    },
  };

  const meta = archetypeAbilities[input.archetype] || {
    stat: "Tactical Resilience 85",
    ability: "Aether Strike",
    faction: "The Wandering Vanguard",
    alignment: "Neutral",
  };

  const title = genreTitles[input.genre] || "The Legendary Wanderer";
  const traitList = input.traits.join(", ");

  const mainStory = `${input.name} has long walked the razor-thin precipice between survival and damnation in the unforgiving domains of ${input.genre.replace(/_/g, " ")}. As a ${input.archetype.replace(/_/g, " ")}, their reputation is forged in equal parts reverence and dread. Known for being distinctly ${traitList}, every step they take reverberates through the clandestine networks and shadowy enclaves of the world.

${input.flaw ? `Yet perfection is an illusion; their enduring burden—${input.flaw}—has cost them comrades, glory, and blood across countless skirmishes.` : `Their past remains an enigma, etched only into the scars across their gear.`} ${input.secretMotivation ? `Underneath the hardened exterior lies a singular driving obsession: ${input.secretMotivation}.` : `They answer to no master save the relentless call of the journey.`}

When darkness falls across the frontier, ${input.name} is the harbinger whispers speak of. Whether dismantling corrupted hyper-conglomerates or binding eldritch breaches in the bedrock of reality, their chronicle is only beginning to unfold.`;

  return {
    characterName: input.name,
    archetype: input.archetype,
    genre: input.genre,
    title: `${input.name}, ${title}`,
    summary: `${input.name} is a formidable ${input.archetype.replace(/_/g, " ")} operating across the grim frontiers of ${input.genre.replace(/_/g, " ")}, wielding rare abilities while battling their inner demons.`,
    mainStory,
    questHooks: [
      {
        title: "Operation: Shattered Beacon",
        description: `Infiltrate the perimeter of the abandoned sector where ${input.name}'s former associates left behind a classified cryptographic node.`,
        dangerLevel: "High",
      },
      {
        title: "The Price of Blood & Silicon",
        description: `A rival faction has placed an immense bounty on ${input.name}. Ambush their vanguard before they compromise the sanctuary.`,
        dangerLevel: "Lethal",
      },
      {
        title: "Echoes in the Void",
        description: `Investigate an anomalous transmission carrying biometric telemetry matching ${input.name}'s long-lost kin.`,
        dangerLevel: "Mythic",
      },
    ],
    sampleDialogue: [
      {
        speaker: input.name,
        line: `"You think this world has rules? Rules are just fairy tales written by corpses who died before they could learn the truth."`,
        context: "Spoken when a squad commander attempts to negotiate surrender",
      },
      {
        speaker: input.name,
        line: `"Step back. If I trigger this mechanism, none of us are walking away in one piece."`,
        context: "During a tense climax in an unstable underground vault",
      },
    ],
    statProfile: {
      primaryStat: meta.stat,
      signatureAbility: meta.ability,
      factionAllegiance: meta.faction,
      moralAlignment: meta.alignment,
    },
    securityAudit: {
      sanitized: true,
      injectionAttemptDetected: !scanResult.isSafe,
      injectionConfidence: scanResult.confidence,
      filteredPatterns: scanResult.detectedPatterns,
      processingLatencyMs: latencyMs,
      provider: "AetherLore Simulation Engine (Safe Sandbox Mode)",
    },
  };
}

/**
 * Dispatches character generation to the configured AI provider
 * (Google Gemini or OpenAI), with graceful fallback.
 */
export async function generateNarrative(
  input: CharacterInput,
  scanResult: SecurityScanResult
): Promise<NarrativeResponse> {
  const startTime = Date.now();
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const configuredProvider = process.env.AI_PROVIDER || "auto";

  const { systemInstruction, userMessage } = constructHardenedPrompt(input, scanResult);

  // 1. Attempt Google Gemini if available
  if (
    geminiApiKey &&
    geminiApiKey !== "your_gemini_api_key_here" &&
    (configuredProvider === "gemini" || configuredProvider === "auto")
  ) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(userMessage);
      const responseText = result.response.text();
      const latencyMs = Date.now() - startTime;

      const parsed = JSON.parse(responseText);
      return {
        ...parsed,
        securityAudit: {
          sanitized: true,
          injectionAttemptDetected: !scanResult.isSafe,
          injectionConfidence: scanResult.confidence,
          filteredPatterns: scanResult.detectedPatterns,
          processingLatencyMs: latencyMs,
          provider: "Google Gemini 1.5 Flash (Secured)",
        },
      };
    } catch (err) {
      console.warn("Gemini generation failed, trying secondary fallback:", err);
    }
  }

  // 2. Attempt OpenAI if available
  if (
    openAiApiKey &&
    openAiApiKey !== "your_openai_api_key_here" &&
    (configuredProvider === "openai" || configuredProvider === "auto")
  ) {
    try {
      const openai = new OpenAI({ apiKey: openAiApiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const latencyMs = Date.now() - startTime;
        const parsed = JSON.parse(content);
        return {
          ...parsed,
          securityAudit: {
            sanitized: true,
            injectionAttemptDetected: !scanResult.isSafe,
            injectionConfidence: scanResult.confidence,
            filteredPatterns: scanResult.detectedPatterns,
            processingLatencyMs: latencyMs,
            provider: "OpenAI GPT-4o-Mini (Secured)",
          },
        };
      }
    } catch (err) {
      console.warn("OpenAI generation failed, using internal engine:", err);
    }
  }

  // 3. Fallback High-Fidelity Engine
  const latencyMs = Date.now() - startTime;
  return generateContextualFallbackLore(input, scanResult, latencyMs);
}
