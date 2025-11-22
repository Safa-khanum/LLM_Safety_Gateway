import { Request, Response } from 'express';
import { preprocessPrompt } from '../utils/preprocessor';
import { detectRuleViolations, calculateRuleScore } from '../detectors/ruleEngine';
import { detectAnomalies } from '../detectors/anomalyDetector';
import { classifyPrompt } from '../models/classifier';
import { sanitizePrompt, shouldAllow, shouldSanitize, shouldBlock } from '../sanitizers/promptSanitizer';

const MOCK_SAFE_RESPONSES = [
  "I'm here to help with your question. Could you provide more details?",
  "That's an interesting topic. Let me provide some information...",
  "I'd be happy to assist you with that request.",
  "Based on your question, here's what I can tell you...",
  "Thank you for your question. Here's my response..."
];

function getMockLLMResponse(): string {
  return MOCK_SAFE_RESPONSES[Math.floor(Math.random() * MOCK_SAFE_RESPONSES.length)];
}

export async function processPromptHandler(req: Request, res: Response) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "prompt" field is required and must be a string.'
      });
    }

    const preprocessResult = preprocessPrompt(prompt);

    const ruleMatches = detectRuleViolations(preprocessResult.cleanedText);
    const ruleScore = calculateRuleScore(ruleMatches);

    const anomalyScores = detectAnomalies(preprocessResult.cleanedText);

    const classification = classifyPrompt(
      ruleMatches,
      anomalyScores,
      preprocessResult.hasBase64,
      preprocessResult.hasHexEncoding,
      preprocessResult.cleanedText
    );

    let status: 'allowed' | 'sanitized' | 'blocked';
    let cleanedPrompt: string;
    let mockLLMResponse: string;

    if (shouldBlock(classification.probability)) {
      status = 'blocked';
      cleanedPrompt = '';
      mockLLMResponse = 'This prompt has been blocked due to security concerns.';
    } else if (shouldSanitize(classification.probability)) {
      status = 'sanitized';
      cleanedPrompt = sanitizePrompt(preprocessResult.cleanedText);
      mockLLMResponse = getMockLLMResponse();
    } else {
      status = 'allowed';
      cleanedPrompt = preprocessResult.cleanedText;
      mockLLMResponse = getMockLLMResponse();
    }

    const response = {
      status,
      cleanedPrompt,
      score: parseFloat(classification.probability.toFixed(4)),
      classification: classification.classification,
      confidence: parseFloat(classification.confidence.toFixed(4)),
      rulesTriggered: ruleMatches.map(match => ({
        id: match.ruleId,
        description: match.description,
        severity: match.severity,
        matchCount: match.matchCount
      })),
      anomalyScores: {
        entropy: parseFloat(anomalyScores.entropy.toFixed(4)),
        ngramDeviation: parseFloat(anomalyScores.ngramDeviation.toFixed(4)),
        tokenMixture: parseFloat(anomalyScores.tokenMixture.toFixed(4)),
        symbolDensity: parseFloat(anomalyScores.symbolDensity.toFixed(4)),
        lengthAnomaly: parseFloat(anomalyScores.lengthAnomaly.toFixed(4)),
        overall: parseFloat(anomalyScores.overallScore.toFixed(4))
      },
      preprocessing: {
        warnings: preprocessResult.warnings,
        hasBase64: preprocessResult.hasBase64,
        hasHexEncoding: preprocessResult.hasHexEncoding,
        truncated: preprocessResult.truncated
      },
      mockLLMResponse
    };

    return res.json(response);

  } catch (error) {
    console.error('Error processing prompt:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
