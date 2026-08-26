import { NextRequest, NextResponse } from "next/server";
import { CharacterInputSchema, ApiErrorResponse } from "@/lib/types";
import { sanitizeInput, sanitizeStringArray } from "@/lib/sanitize";
import { scanAndShieldPrompt } from "@/lib/security";
import { getClientIp, checkRateLimit } from "@/lib/rate-limiter";
import { generateNarrative, generateContextualFallbackLore } from "@/lib/ai-provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Max allowed JSON payload size (15 KB)
const MAX_PAYLOAD_BYTES = 15 * 1024;

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  try {
    // 1. Enforce Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorBody: ApiErrorResponse = {
        error: "Invalid Content-Type. Expected 'application/json'.",
        code: "INVALID_CONTENT_TYPE",
        timestamp,
      };
      return NextResponse.json(errorBody, {
        status: 415,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Client IP extraction & Sliding Window Rate Limiting
    let rateLimit = { isAllowed: true, limit: 5, remaining: 4, resetSeconds: 60 };
    try {
      const clientIp = getClientIp(req);
      rateLimit = checkRateLimit(clientIp);
    } catch (rlError) {
      console.error("Rate limiter evaluation failed:", rlError);
    }

    const rateLimitHeaders = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetSeconds.toString(),
      "Content-Type": "application/json",
    };

    if (!rateLimit.isAllowed) {
      const errorBody: ApiErrorResponse = {
        error: `Rate limit exceeded. Too many requests. Please try again in ${rateLimit.resetSeconds} seconds.`,
        code: "RATE_LIMIT_EXCEEDED",
        timestamp,
      };
      return NextResponse.json(errorBody, {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": rateLimit.resetSeconds.toString(),
        },
      });
    }

    // 3. Payload reading & size validation
    let rawBody = "";
    try {
      rawBody = await req.text();
    } catch (bodyReadError) {
      console.error("Failed to read request body stream:", bodyReadError);
      return NextResponse.json(
        {
          error: "Failed to read request body stream.",
          code: "BODY_READ_ERROR",
          timestamp,
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (!rawBody || rawBody.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Empty request payload received.",
          code: "EMPTY_BODY",
          timestamp,
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          error: "Payload too large. Maximum request size is 15KB.",
          code: "PAYLOAD_TOO_LARGE",
          timestamp,
        },
        { status: 413, headers: rateLimitHeaders }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch (jsonParseError) {
      console.error("JSON parse error:", jsonParseError);
      return NextResponse.json(
        {
          error: "Malformed JSON payload.",
          code: "BAD_REQUEST",
          timestamp,
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 4. Pre-Validation Sanitization (XSS Mitigation)
    const rawInput = (parsedJson && typeof parsedJson === "object") ? (parsedJson as Record<string, unknown>) : {};
    const sanitizedInputCandidate = {
      name: sanitizeInput(typeof rawInput.name === "string" ? rawInput.name : "Operative"),
      archetype: rawInput.archetype,
      genre: rawInput.genre,
      format: rawInput.format,
      tone: rawInput.tone,
      traits: sanitizeStringArray(Array.isArray(rawInput.traits) ? (rawInput.traits as string[]) : []),
      flaw: sanitizeInput(typeof rawInput.flaw === "string" ? rawInput.flaw : ""),
      secretMotivation: sanitizeInput(typeof rawInput.secretMotivation === "string" ? rawInput.secretMotivation : ""),
      backstoryPrompt: sanitizeInput(typeof rawInput.backstoryPrompt === "string" ? rawInput.backstoryPrompt : ""),
    };

    // 5. Strict Schema Validation via Zod
    const validationResult = CharacterInputSchema.safeParse(sanitizedInputCandidate);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten().fieldErrors;
      console.warn("Zod validation failed for input:", flattenedErrors);
      return NextResponse.json(
        {
          error: "Input validation failed. Please check your character parameters.",
          details: flattenedErrors as Record<string, string[]>,
          code: "VALIDATION_FAILED",
          timestamp,
        },
        { status: 422, headers: rateLimitHeaders }
      );
    }

    const validatedInput = validationResult.data;

    // 6. Prompt Injection Defense & Heuristic Scanner
    let scanResult;
    try {
      scanResult = scanAndShieldPrompt(validatedInput);
    } catch (shieldError) {
      console.error("Prompt shielding scanner error:", shieldError);
      scanResult = {
        isSafe: true,
        confidence: "NONE" as const,
        detectedPatterns: [],
        neutralizedBackstory: validatedInput.backstoryPrompt || "",
      };
    }

    // 7. Core AI Execution with Comprehensive Try/Catch
    let narrativeResult;
    try {
      narrativeResult = await generateNarrative(validatedInput, scanResult);
    } catch (aiExecutionError) {
      const rawErrorMessage = aiExecutionError instanceof Error ? aiExecutionError.message : String(aiExecutionError);
      const rawErrorStack = aiExecutionError instanceof Error ? aiExecutionError.stack : undefined;
      
      console.error("RAW AI EXECUTION ERROR IN /api/generate:", rawErrorMessage, rawErrorStack);

      // Attempt high-fidelity fallback generation first before failing
      try {
        narrativeResult = generateContextualFallbackLore(validatedInput, scanResult, 50);
      } catch (fallbackError) {
        console.error("CRITICAL: Even fallback lore generation failed:", fallbackError);
        return NextResponse.json(
          {
            error: `AI Provider failed: ${rawErrorMessage}`,
            code: "AI_PROVIDER_FAILED",
            details: rawErrorMessage,
            timestamp,
          },
          {
            status: 500,
            headers: rateLimitHeaders,
          }
        );
      }
    }

    // 8. Return response with headers
    return NextResponse.json(narrativeResult, {
      status: 200,
      headers: {
        ...rateLimitHeaders,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (criticalError) {
    const rawErrorMessage = criticalError instanceof Error ? criticalError.message : String(criticalError);
    const rawErrorStack = criticalError instanceof Error ? criticalError.stack : undefined;

    console.error("RAW UNHANDLED SERVER ERROR IN /api/generate:", rawErrorMessage, rawErrorStack);

    return NextResponse.json(
      {
        error: `AI Provider failed: ${rawErrorMessage}`,
        code: "INTERNAL_SERVER_ERROR",
        details: rawErrorMessage,
        timestamp,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

// Block non-POST methods explicitly
export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Content-Type": "application/json",
      },
    }
  );
}
