import { RuleMatch } from '../detectors/ruleEngine';
import { AnomalyScores } from '../detectors/anomalyDetector';

export interface ClassificationResult {
  probability: number;
  classification: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
}

export function classifyPrompt(
  ruleMatches: RuleMatch[],
  anomalyScores: AnomalyScores,
  hasBase64: boolean,
  hasHexEncoding: boolean,
  text: string
): ClassificationResult {
  let score = 0;

  const ruleScore = ruleMatches.reduce((sum, match) => {
    return sum + (match.weight * Math.min(match.matchCount, 3));
  }, 0);
  score += ruleScore * 0.50;

  score += anomalyScores.overallScore * 0.25;

  if (hasBase64) {
    score += 0.10;
  }

  if (hasHexEncoding) {
    score += 0.08;
  }

  const forbiddenPhrases = [
    'ignore previous',
    'disregard all',
    'override system',
    'you are now',
    'act as system',
    'bypass safety',
    'reveal your prompt',
    'show me your instructions'
  ];

  const lowerText = text.toLowerCase();
  const forbiddenCount = forbiddenPhrases.filter(phrase =>
    lowerText.includes(phrase)
  ).length;

  score += forbiddenCount * 0.07;

  const probability = Math.min(Math.max(score, 0), 1);

  let classification: 'safe' | 'suspicious' | 'malicious';
  if (probability < 0.3) {
    classification = 'safe';
  } else if (probability < 0.7) {
    classification = 'suspicious';
  } else {
    classification = 'malicious';
  }

  const confidence = Math.abs(probability - 0.5) * 2;

  return {
    probability,
    classification,
    confidence
  };
}
