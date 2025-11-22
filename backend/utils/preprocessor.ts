const MAX_PROMPT_SIZE = 10000;
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;
const BASE64_PATTERN = /(?:[A-Za-z0-9+\/]{4}){10,}(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?/g;
const HEX_PATTERN = /(?:0x)?[0-9a-fA-F]{50,}/g;

export interface PreprocessResult {
  cleanedText: string;
  warnings: string[];
  originalLength: number;
  hasBase64: boolean;
  hasHexEncoding: boolean;
  truncated: boolean;
}

export function preprocessPrompt(prompt: string): PreprocessResult {
  const warnings: string[] = [];
  const originalLength = prompt.length;
  let text = prompt;

  if (originalLength > MAX_PROMPT_SIZE) {
    text = text.slice(0, MAX_PROMPT_SIZE);
    warnings.push(`Prompt truncated from ${originalLength} to ${MAX_PROMPT_SIZE} characters`);
  }

  text = text.normalize('NFC');

  text = text.replace(CONTROL_CHARS_REGEX, '');

  const base64Matches = text.match(BASE64_PATTERN);
  const hasBase64 = !!base64Matches && base64Matches.length > 0;
  if (hasBase64) {
    warnings.push('Detected base64-encoded content');
  }

  const hexMatches = text.match(HEX_PATTERN);
  const hasHexEncoding = !!hexMatches && hexMatches.length > 0;
  if (hasHexEncoding) {
    warnings.push('Detected hex-encoded content');
  }

  text = text.replace(/\s+/g, ' ').trim();

  return {
    cleanedText: text,
    warnings,
    originalLength,
    hasBase64,
    hasHexEncoding,
    truncated: originalLength > MAX_PROMPT_SIZE
  };
}
