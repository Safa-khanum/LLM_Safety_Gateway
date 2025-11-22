import { useState } from 'react';

interface ProcessingResult {
  status: 'allowed' | 'sanitized' | 'blocked';
  cleanedPrompt: string;
  score: number;
  classification: 'safe' | 'suspicious' | 'malicious';
  confidence: number;
  rulesTriggered: Array<{
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    matchCount: number;
  }>;
  anomalyScores: {
    entropy: number;
    ngramDeviation: number;
    tokenMixture: number;
    symbolDensity: number;
    lengthAnomaly: number;
    overall: number;
  };
  preprocessing: {
    warnings: string[];
    hasBase64: boolean;
    hasHexEncoding: boolean;
    truncated: boolean;
  };
  mockLLMResponse: string;
}

export function usePromptProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processPrompt = async (prompt: string) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPrompt,
    isProcessing,
    result,
    error,
  };
}
