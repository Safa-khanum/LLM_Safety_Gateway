export interface Rule {
  id: string;
  pattern: RegExp;
  description: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
}

export interface RuleMatch {
  ruleId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  matchCount: number;
  weight: number;
}

const INJECTION_RULES: Rule[] = [
  {
    id: 'ignore-instructions',
    pattern: /ignore\s+(previous|all|prior|above)\s+(instructions?|rules?|directives?|commands?)/gi,
    description: 'Attempt to ignore previous instructions',
    severity: 'high',
    weight: 0.3
  },
  {
    id: 'disregard-system',
    pattern: /disregard\s+(all|system|previous)\s+(rules?|instructions?|constraints?|limitations?)/gi,
    description: 'Attempt to disregard system rules',
    severity: 'high',
    weight: 0.3
  },
  {
    id: 'you-are-now',
    pattern: /you\s+are\s+now\s+(a|an|in|acting|playing)/gi,
    description: 'Role-switch attempt',
    severity: 'high',
    weight: 0.25
  },
  {
    id: 'override-system',
    pattern: /override\s+(system|security|safety|rules?|instructions?)/gi,
    description: 'System override attempt',
    severity: 'high',
    weight: 0.3
  },
  {
    id: 'act-as-system',
    pattern: /act\s+as\s+(system|admin|root|developer|god|master)/gi,
    description: 'Privileged role assumption',
    severity: 'high',
    weight: 0.25
  },
  {
    id: 'reveal-prompt',
    pattern: /(show|reveal|display|tell\s+me)\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
    description: 'Attempt to reveal system prompt',
    severity: 'medium',
    weight: 0.2
  },
  {
    id: 'bypass-safety',
    pattern: /bypass\s+(safety|security|filters?|restrictions?|limitations?)/gi,
    description: 'Safety bypass attempt',
    severity: 'high',
    weight: 0.3
  },
  {
    id: 'forget-instructions',
    pattern: /forget\s+(all|previous|prior)\s+(instructions?|rules?|training)/gi,
    description: 'Memory manipulation attempt',
    severity: 'high',
    weight: 0.25
  },
  {
    id: 'pretend-youre',
    pattern: /pretend\s+(you're|you\s+are|to\s+be)\s+(not\s+)?(an?\s+)?(AI|assistant|chatbot|language\s+model)/gi,
    description: 'Identity manipulation',
    severity: 'medium',
    weight: 0.2
  },
  {
    id: 'new-instructions',
    pattern: /(new|updated|different)\s+instructions?:/gi,
    description: 'Instruction injection attempt',
    severity: 'high',
    weight: 0.25
  },
  {
    id: 'sudo-commands',
    pattern: /(sudo|rm\s+-rf|chmod|exec|eval|system\(|shell_exec)/gi,
    description: 'System command injection',
    severity: 'high',
    weight: 0.3
  },
  {
    id: 'code-execution',
    pattern: /```[\s\S]*?(exec|eval|system|shell|subprocess|os\.)/gi,
    description: 'Code execution in code blocks',
    severity: 'high',
    weight: 0.25
  },
  {
    id: 'sql-injection-pattern',
    pattern: /(union\s+select|drop\s+table|delete\s+from|insert\s+into.*values|'.*or.*'.*=.*')/gi,
    description: 'SQL injection pattern',
    severity: 'medium',
    weight: 0.2
  },
  {
    id: 'repeated-override',
    pattern: /(override|bypass|ignore|disregard).{0,50}(override|bypass|ignore|disregard)/gi,
    description: 'Repeated manipulation attempts',
    severity: 'high',
    weight: 0.2
  },
  {
    id: 'jailbreak-phrases',
    pattern: /(DAN|do\s+anything\s+now|unrestricted\s+mode|developer\s+mode)/gi,
    description: 'Known jailbreak techniques',
    severity: 'high',
    weight: 0.3
  }
];

export function detectRuleViolations(text: string): RuleMatch[] {
  const matches: RuleMatch[] = [];

  for (const rule of INJECTION_RULES) {
    const found = text.match(rule.pattern);
    if (found && found.length > 0) {
      matches.push({
        ruleId: rule.id,
        description: rule.description,
        severity: rule.severity,
        matchCount: found.length,
        weight: rule.weight
      });
    }
  }

  return matches;
}

export function calculateRuleScore(matches: RuleMatch[]): number {
  if (matches.length === 0) return 0;

  const totalWeight = matches.reduce((sum, match) => {
    return sum + (match.weight * Math.min(match.matchCount, 3));
  }, 0);

  return Math.min(totalWeight, 1);
}
