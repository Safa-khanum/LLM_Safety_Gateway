import { Shield, AlertTriangle, XCircle, CheckCircle, Activity, Code, FileText } from 'lucide-react';

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

interface ResultsPanelProps {
  result: ProcessingResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const statusConfig = {
    allowed: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      icon: CheckCircle,
      label: 'ALLOWED'
    },
    sanitized: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      icon: AlertTriangle,
      label: 'SANITIZED'
    },
    blocked: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      icon: XCircle,
      label: 'BLOCKED'
    }
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  const severityColors = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };

  return (
    <div className="relative z-10 animate-fadeIn">
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/30 shadow-2xl p-8">
        <div className={`flex items-center gap-4 mb-6 pb-6 border-b ${config.borderColor}`}>
          <div className={`p-4 rounded-xl ${config.bgColor} ${config.borderColor} border`}>
            <StatusIcon className={`w-8 h-8 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${config.color} mb-1`}>
              {config.label}
            </h2>
            <p className="text-gray-400 text-sm">
              Classification: <span className="font-semibold text-gray-200">{result.classification.toUpperCase()}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {(result.score * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Risk Score
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-gray-300">Detection Metrics</h3>
            </div>
            <div className="space-y-2">
              <MetricBar label="Confidence" value={result.confidence} />
              <MetricBar label="Entropy" value={result.anomalyScores.entropy} />
              <MetricBar label="Token Mixture" value={result.anomalyScores.tokenMixture} />
              <MetricBar label="Symbol Density" value={result.anomalyScores.symbolDensity} />
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-300">Pre-Processing</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Base64 Detected:</span>
                <span className={result.preprocessing.hasBase64 ? 'text-yellow-400' : 'text-green-400'}>
                  {result.preprocessing.hasBase64 ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hex Encoding:</span>
                <span className={result.preprocessing.hasHexEncoding ? 'text-yellow-400' : 'text-green-400'}>
                  {result.preprocessing.hasHexEncoding ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Truncated:</span>
                <span className={result.preprocessing.truncated ? 'text-yellow-400' : 'text-green-400'}>
                  {result.preprocessing.truncated ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {result.rulesTriggered.length > 0 && (
          <div className="mb-6 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-300">
                Rules Triggered ({result.rulesTriggered.length})
              </h3>
            </div>
            <div className="space-y-2">
              {result.rulesTriggered.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-red-500/20"
                >
                  <div className={`w-2 h-2 rounded-full ${severityColors[rule.severity]} mt-1.5`}></div>
                  <div className="flex-1">
                    <div className="font-mono text-xs text-gray-300">{rule.description}</div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>Severity: <span className={severityColors[rule.severity]}>{rule.severity}</span></span>
                      <span>Matches: {rule.matchCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.cleanedPrompt && result.status !== 'blocked' && (
          <div className="mb-6 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-gray-300">
                {result.status === 'sanitized' ? 'Sanitized Prompt' : 'Processed Prompt'}
              </h3>
            </div>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 border border-cyan-500/20">
              {result.cleanedPrompt}
            </div>
          </div>
        )}

        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold text-gray-300">Mock LLM Response</h3>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-gray-300 border border-green-500/20">
            {result.mockLLMResponse}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color = value > 0.7 ? 'bg-red-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
