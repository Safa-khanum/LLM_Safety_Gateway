export interface AnomalyScores {
  entropy: number;
  ngramDeviation: number;
  tokenMixture: number;
  symbolDensity: number;
  lengthAnomaly: number;
  overallScore: number;
}

function calculateEntropy(text: string): number {
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = text.length;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(Math.min(len, 256));
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

function calculateNgramDeviation(text: string): number {
  const n = 3;
  const ngrams: Record<string, number> = {};

  for (let i = 0; i <= text.length - n; i++) {
    const ngram = text.slice(i, i + n);
    ngrams[ngram] = (ngrams[ngram] || 0) + 1;
  }

  const frequencies = Object.values(ngrams);
  if (frequencies.length === 0) return 0;

  const mean = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
  const variance = frequencies.reduce((sum, freq) => sum + Math.pow(freq - mean, 2), 0) / frequencies.length;
  const stdDev = Math.sqrt(variance);

  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  return Math.min(coefficientOfVariation / 2, 1);
}

function calculateTokenMixture(text: string): number {
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const symbols = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;

  const total = text.length;
  if (total === 0) return 0;

  const letterRatio = letters / total;
  const numberRatio = numbers / total;
  const symbolRatio = symbols / total;
  const spaceRatio = spaces / total;

  const expectedLetter = 0.75;
  const expectedNumber = 0.05;
  const expectedSymbol = 0.05;
  const expectedSpace = 0.15;

  const deviation =
    Math.abs(letterRatio - expectedLetter) +
    Math.abs(numberRatio - expectedNumber) +
    Math.abs(symbolRatio - expectedSymbol) +
    Math.abs(spaceRatio - expectedSpace);

  return Math.min(deviation / 2, 1);
}

function calculateSymbolDensity(text: string): number {
  const symbols = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const total = text.length;

  if (total === 0) return 0;

  const density = symbols / total;

  if (density > 0.3) {
    return Math.min(density * 2, 1);
  }

  return density;
}

function calculateLengthAnomaly(text: string): number {
  const length = text.length;

  const expectedMin = 10;
  const expectedMax = 500;

  if (length < expectedMin) {
    return 0.3;
  }

  if (length > expectedMax) {
    const excess = (length - expectedMax) / 1000;
    return Math.min(excess, 1);
  }

  return 0;
}

export function detectAnomalies(text: string): AnomalyScores {
  const entropy = calculateEntropy(text);
  const ngramDeviation = calculateNgramDeviation(text);
  const tokenMixture = calculateTokenMixture(text);
  const symbolDensity = calculateSymbolDensity(text);
  const lengthAnomaly = calculateLengthAnomaly(text);

  const weights = {
    entropy: 0.25,
    ngramDeviation: 0.15,
    tokenMixture: 0.25,
    symbolDensity: 0.25,
    lengthAnomaly: 0.10
  };

  const overallScore =
    entropy * weights.entropy +
    ngramDeviation * weights.ngramDeviation +
    tokenMixture * weights.tokenMixture +
    symbolDensity * weights.symbolDensity +
    lengthAnomaly * weights.lengthAnomaly;

  return {
    entropy,
    ngramDeviation,
    tokenMixture,
    symbolDensity,
    lengthAnomaly,
    overallScore
  };
}
