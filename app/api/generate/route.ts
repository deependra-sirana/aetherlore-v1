import { NextRequest, NextResponse } from "next/server";
import { CharacterInputSchema, ApiErrorResponse } from "@/lib/types";
import { sanitizeInput, sanitizeStringArray } from "@/lib/sanitize";
import { scanAndShieldPrompt } from "@/lib/security";
import { getClientIp, checkRateLimit } from "@/lib/rate-limiter";
import { generateNarrative } from "@/lib/ai-provider";

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
      return NextResponse.json(errorBody, { status: 415 });
    }

    // 2. Client IP extraction & Sliding Window Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);

    const rateLimitHeaders = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetSeconds.toString(),
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

    // 3. Payload size validation
    const rawBody = await req.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      const errorBody: ApiErrorResponse = {
        error: "Payload too large. Maximum request size is 15KB.",
        code: "PAYLOAD_TOO_LARGE",
        timestamp,
      };
      return NextResponse.json(errorBody, {
        status: 413,
        headers: rateLimitHeaders,
      });
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      const errorBody: ApiErrorResponse = {
        error: "Malformed JSON payload.",
        code: "BAD_REQUEST",
        timestamp,
      };
      return NextResponse.json(errorBody, {
        status: 400,
        headers: rateLimitHeaders,
      });
    }

    // 4. Pre-Validation Sanitization (XSS Mitigation)
    const rawInput = parsedJson as Record<string, unknown>;
    const sanitizedInputCandidate = {
      name: sanitizeInput(rawInput.name as string),
      archetype: rawInput.archetype,
      genre: rawInput.genre,
      format: rawInput.format,
      tone: rawInput.tone,
      traits: sanitizeStringArray(rawInput.traits as string[]),
      flaw: sanitizeInput(rawInput.flaw as string),
      secretMotivation: sanitizeInput(rawInput.secretMotivation as string),
      backstoryPrompt: sanitizeInput(rawInput.backstoryPrompt as string),
    };

    // 5. Strict Schema Validation via Zod
    const validationResult = CharacterInputSchema.safeParse(sanitizedInputCandidate);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten().fieldErrors;
      const errorBody: ApiErrorResponse = {
        error: "Input validation failed. Please check your character parameters.",
        details: flattenedErrors as Record<string, string[]>,
        code: "VALIDATION_FAILED",
        timestamp,
      };
      return NextResponse.json(errorBody, {
        status: 422,
        headers: rateLimitHeaders,
      });
    }

    const validatedInput = validationResult.data;

    // 6. Prompt Injection Defense & Heuristic Scanner
    const scanResult = scanAndShieldPrompt(validatedInput);

    // 7. Secure AI Generation (Gemini / OpenAI / Hardened Sandbox Fallback)
    const narrativeResult = await generateNarrative(validatedInput, scanResult);

    // 8. Return response with rate limit headers
    return NextResponse.json(narrativeResult, {
      status: 200,
      headers: {
        ...rateLimitHeaders,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Unhandled error in /api/generate:", error);

    // Never leak stack trace or internal error messages to the client
    const errorBody: ApiErrorResponse = {
      error: "An internal server error occurred while processing the narrative. Please try again.",
      code: "INTERNAL_SERVER_ERROR",
      timestamp,
    };

    return NextResponse.json(errorBody, { status: 500 });
  }
}

// Block non-POST methods explicitly
export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
