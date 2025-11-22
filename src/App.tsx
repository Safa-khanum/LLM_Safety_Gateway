import { useState } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ResultsPanel } from './components/ResultsPanel';
import { usePromptProcessor } from './hooks/usePromptProcessor';
import { AlertCircle } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const { processPrompt, isProcessing, result, error } = usePromptProcessor();

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    processPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <ParticleBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        <Header />

        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />

        {error && (
          <div className="mb-8 backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/50 shadow-2xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && <ResultsPanel result={result} />}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
