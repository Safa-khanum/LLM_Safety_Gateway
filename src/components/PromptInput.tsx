import { Send } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function PromptInput({ prompt, onPromptChange, onSubmit, isProcessing }: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative z-10 mb-8">
      <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your prompt here..."
          className="relative w-full h-48 px-6 py-4 bg-transparent text-gray-100 placeholder-gray-500 outline-none resize-none font-mono text-sm"
          disabled={isProcessing}
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isProcessing || !prompt.trim()}
        className="mt-6 w-full py-4 px-8 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 flex items-center gap-3">
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Prompt
            </>
          )}
        </span>
      </button>
    </div>
  );
}
