import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="relative z-10 mb-12">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          LLM Safety Gateway
        </h1>
      </div>
      <div className="relative">
        <p className="text-center text-xl text-gray-400 italic">
          Real-Time Prompt Security Firewall
        </p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      </div>
    </header>
  );
}
