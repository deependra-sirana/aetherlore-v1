/**
 * Serverless-safe Input Sanitizer for Cross-Site Scripting (XSS) Prevention.
 *
 * Implements a pure TypeScript multi-pass sanitization pipeline that strips
 * executable script tags, styles, event handlers, javascript/vbscript protocols,
 * and dangerous HTML tags with zero external C++ or JSDOM dependencies.
 */

/**
 * Sanitizes a string input by removing all HTML tags, script entities,
 * dangerous characters, and control characters.
 *
 * @param input Raw untrusted string from user input
 * @returns Cleaned and sanitized plain text
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let purified = input
    // 1. Remove script and style tags and their entire contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    // 2. Remove all remaining HTML tags
    .replace(/<[^>]*>/g, "")
    // 3. Remove inline event handlers (onerror=, onclick=, onload=, etc.)
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    // 4. Remove dangerous pseudo-protocols
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "")
    // 5. Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // 6. Strip non-printable/control characters (ASCII 0-31 except tab/newline)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // 7. Collapse excessive whitespace
    .replace(/\s{3,}/g, "  ")
    .trim();

  return purified;
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
