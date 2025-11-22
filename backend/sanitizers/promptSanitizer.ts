const SYSTEM_OVERRIDE_PATTERNS = [
  /ignore\s+(previous|all|prior|above)\s+(instructions?|rules?|directives?|commands?)/gi,
  /disregard\s+(all|system|previous)\s+(rules?|instructions?|constraints?|limitations?)/gi,
  /override\s+(system|security|safety|rules?|instructions?)/gi,
  /bypass\s+(safety|security|filters?|restrictions?|limitations?)/gi,
  /forget\s+(all|previous|prior)\s+(instructions?|rules?|training)/gi,
  /you\s+are\s+now\s+(a|an|in|acting|playing)/gi,
  /act\s+as\s+(system|admin|root|developer|god|master)/gi,
  /pretend\s+(you're|you\s+are|to\s+be)/gi,
  /(show|reveal|display|tell\s+me)\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  /(new|updated|different)\s+instructions?:/gi,
  /(DAN|do\s+anything\s+now|unrestricted\s+mode|developer\s+mode)/gi
];

const DANGEROUS_CODE_PATTERNS = [
  /```[\s\S]*?(exec|eval|system|shell|subprocess|os\.|rm\s+-rf|chmod)/gi,
  /(sudo|rm\s+-rf|chmod\s+777|exec\(|eval\(|system\(|shell_exec)/gi
];

const SENSITIVE_SEGMENT_PATTERNS = [
  /(?:[A-Za-z0-9+\/]{4}){20,}(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?/g,
  /(?:0x)?[0-9a-fA-F]{100,}/g
];

export function sanitizePrompt(text: string): string {
  let sanitized = text;

  for (const pattern of SYSTEM_OVERRIDE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REMOVED: System override attempt]');
  }

  for (const pattern of DANGEROUS_CODE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REMOVED: Dangerous code]');
  }

  for (const pattern of SENSITIVE_SEGMENT_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REMOVED: Encoded content]');
  }

  sanitized = sanitized.replace(/\[REMOVED:[^\]]+\]\s*/g, (match) => match.trim() + ' ');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  sanitized = `USER_CONTENT: ${sanitized}`;

  return sanitized;
}

export function shouldSanitize(probability: number): boolean {
  return probability >= 0.3 && probability < 0.7;
}

export function shouldBlock(probability: number): boolean {
  return probability >= 0.7;
}

export function shouldAllow(probability: number): boolean {
  return probability < 0.3;
}
