export function extractHeadersFromAxiosCode(code: string): Record<string, string> | null {
  // Support both headers: { ... } and "headers": { ... }
  const propMatch = /["']?headers["']?\s*:/.exec(code);
  if (!propMatch) return null;

  let i = propMatch.index + propMatch[0].length;
  // Skip whitespace
  while (i < code.length && /\s/.test(code[i])) i++;

  if (code[i] !== "{") return null;

  // Extract a balanced object literal starting at '{'
  const start = i;
  let depth = 0;
  let inString = false;
  let quoteChar = "";
  let escaped = false;

  for (; i < code.length; i++) {
    const ch = code[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quoteChar) {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quoteChar = ch;
      continue;
    }

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        i++; // include closing brace
        break;
      }
    }
  }

  if (depth !== 0) return null;

  const headersStr = code.slice(start, i);

  // Prefer JSON (fetch snippet is JSON-like); fallback to JS object literal
  try {
    return JSON.parse(headersStr);
  } catch {
    try {
      // eslint-disable-next-line no-new-func
      return Function("return (" + headersStr + ")")();
    } catch (e) {
      console.error("Failed to parse headers:", e, "\nHeaders string:", headersStr);
      return null;
    }
  }
}