import { z } from "zod";

/**
 * Supported Game World Genres
 */
export const GameGenreEnum = z.enum([
  "cyberpunk",
  "dark_fantasy",
  "sci_fi_space_opera",
  "post_apocalyptic",
  "steampunk",
  "eldritch_horror",
  "high_fantasy",
]);
export type GameGenre = z.infer<typeof GameGenreEnum>;

/**
 * Character Archetypes / Classes
 */
export const CharacterArchetypeEnum = z.enum([
  "netrunner",
  "void_walker",
  "eldritch_scholar",
  "fallen_paladin",
  "cyber_samurai",
  "alchemical_artificer",
  "shadow_infiltrator",
  "biotech_mutant",
  "renegade_captain",
]);
export type CharacterArchetype = z.infer<typeof CharacterArchetypeEnum>;

/**
 * Narrative Output Formats
 */
export const NarrativeFormatEnum = z.enum([
  "origin_story",
  "quest_briefing",
  "legendary_lore",
  "dialogue_encounter",
  "boss_monologue",
]);
export type NarrativeFormat = z.infer<typeof NarrativeFormatEnum>;

/**
 * Narrative Tone
 */
export const NarrativeToneEnum = z.enum([
  "grimdark",
  "epic_heroic",
  "mysterious",
  "satirical_gritty",
  "melancholic",
]);
export type NarrativeTone = z.infer<typeof NarrativeToneEnum>;

/**
 * Strict Zod Validation Schema for User Input
 */
export const CharacterInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Character name must be at least 2 characters long." })
    .max(50, { message: "Character name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9\s'\-_.]+$/, {
      message: "Character name contains invalid characters.",
    }),
  archetype: CharacterArchetypeEnum,
  genre: GameGenreEnum,
  format: NarrativeFormatEnum,
  tone: NarrativeToneEnum,
  traits: z
    .array(z.string().trim().max(30))
    .min(1, { message: "Provide at least one core character trait." })
    .max(8, { message: "Maximum 8 traits allowed." }),
  flaw: z
    .string()
    .trim()
    .max(150, { message: "Character flaw cannot exceed 150 characters." })
    .optional()
    .default(""),
  secretMotivation: z
    .string()
    .trim()
    .max(200, { message: "Secret motivation cannot exceed 200 characters." })
    .optional()
    .default(""),
  backstoryPrompt: z
    .string()
    .trim()
    .max(500, { message: "Custom lore prompt cannot exceed 500 characters." })
    .optional()
    .default(""),
});

export type CharacterInput = z.infer<typeof CharacterInputSchema>;

/**
 * Structure of the AI Generated Game Narrative Output
 */
export interface NarrativeResponse {
  characterName: string;
  archetype: string;
  genre: string;
  title: string;
  summary: string;
  mainStory: string;
  questHooks: {
    title: string;
    description: string;
    dangerLevel: "Moderate" | "High" | "Lethal" | "Mythic";
  }[];
  sampleDialogue: {
    speaker: string;
    line: string;
    context: string;
  }[];
  statProfile: {
    primaryStat: string;
    signatureAbility: string;
    factionAllegiance: string;
    moralAlignment: string;
  };
  securityAudit: {
    sanitized: boolean;
    injectionAttemptDetected: boolean;
    injectionConfidence: "NONE" | "LOW" | "HIGH";
    filteredPatterns: string[];
    processingLatencyMs: number;
    provider: string;
  };
}

/**
 * Generic API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]> | string;
  code: string;
  timestamp: string;
}
