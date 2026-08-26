import DOMPurify from "isomorphic-dompurify";

/**
 * Fallback regex-based sanitizer that strips HTML tags, scripts, event handlers,
 * and malicious pseudo-protocols when DOMPurify/JSDOM is unavailable.
 */
function fallbackSanitize(str: string): string {
  return str
    // Strip script and style blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip all other HTML tags
    .replace(/<[^>]*>/g, "")
    // Strip dangerous attributes & event handlers
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    // Strip dangerous pseudo-protocols
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "")
    // Strip HTML comments
    .replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Sanitizes a string input by removing all HTML tags, script entities,
 * dangerous characters, and control characters to prevent Cross-Site Scripting (XSS).
 *
 * @param input Raw untrusted string from user input
 * @returns Cleaned and sanitized plain text
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let purified = input;

  // 1. Attempt isomorphic DOMPurify sanitization safely
  try {
    if (typeof DOMPurify !== "undefined" && typeof DOMPurify.sanitize === "function") {
      purified = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "svg", "img", "link"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "javascript:"],
      });
    } else {
      purified = fallbackSanitize(input);
    }
  } catch {
    purified = fallbackSanitize(input);
  }

  // Double-pass regex check to guarantee clean text
  purified = fallbackSanitize(purified);

  // 2. Normalize and strip non-printable/control characters (ASCII 0-31 except tab/newline)
  const normalized = purified
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, "  ")
    .trim();

  return normalized;
}

/**
 * Sanitizes an array of string items (e.g. character trait tags)
 */
export function sanitizeStringArray(items: string[] | undefined | null): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => sanitizeInput(item))
    .filter((item) => item.length > 0)
    .slice(0, 8); // Enforce array length constraint
}

/**
 * Escapes characters for safe Markdown/HTML rendering
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

