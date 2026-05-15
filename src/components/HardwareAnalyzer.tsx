import React from 'react';
import { motion } from 'motion/react';
import { Cpu, RotateCcw, AlertTriangle, Terminal, Play, Download, ShieldCheck, Info, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisResult {
  suitabilityScore: number;
  recommendedCoin: string;
  estimatedHashrate: string;
  warnings: string[];
  setupCommand: string;
}

export default function HardwareAnalyzer() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);

  // User input based on their provided data
  const userSpecs = {
    systemModel: "HP EliteBook 840 G3",
    processor: "Intel(R) Core(TM) i5-6300U CPU @ 2.40GHz",
    ram: "8.00 GB",
    os: "Windows 10 Pro"
  };

  const [errorStatus, setErrorStatus] = React.useState<number | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch('/api/hardware/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userSpecs),
      });
      if (!response.ok) {
        setErrorStatus(response.status);
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rawScore = result?.suitabilityScore;
  const score = typeof rawScore === 'number' && !isNaN(rawScore) ? rawScore : 0;
  
  return (
    <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-[#1E2128] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Local Engine Profiler</h3>
            <p className="text-gray-500 text-xs">Analyze PC for Real-time Mining</p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="p-2 hover:bg-[#1E2128] rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <RotateCcw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {errorStatus === 429 && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-orange-200 font-bold mb-1">API Quota Exceeded</p>
              <p className="text-gray-500 leading-relaxed">
                You've hit the Gemini API rate limit. Please wait about a minute before trying again, or check your API key settings.
              </p>
            </div>
          </div>
        )}
        {!result ? (
          <div className="space-y-4">
            <div className="p-4 bg-black/20 rounded-xl border border-dashed border-[#2A2D35]">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-tighter">Detected Local Engine</h4>
              <div className="space-y-3">
                <SpecItem label="Model" value={userSpecs.systemModel} />
                <SpecItem label="CPU" value={userSpecs.processor} />
                <SpecItem label="RAM" value={userSpecs.ram} />
                <SpecItem label="OS" value={userSpecs.os} />
              </div>
            </div>
            
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? "Profiling Hardware..." : "Initialize Engine Audit"}
              {!loading && <Play className="w-4 h-4 fill-current" />}
            </button>

            <div className="flex gap-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-300 leading-relaxed italic">
                This tool performs a high-fidelity audit of your local hardware to generate the optimal configuration for real crypto mining.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Ring */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40" cy="40" r="34"
                    fill="transparent"
                    stroke="#1E2128"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="transparent"
                    stroke={score > 50 ? "#22c55e" : "#eab308"}
                    strokeWidth="8"
                    strokeDasharray={213}
                    strokeDashoffset={213 - (213 * score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{Math.round(score)}%</span>
                </div>
              </div>
              <div>
                <h4 className="text-white font-bold">Readiness Score</h4>
                <p className="text-gray-500 text-xs">Hardware compatibility for {result.recommendedCoin}</p>
              </div>
            </div>

            {/* Warnings */}
            <div className="space-y-2">
              {Array.isArray(result.warnings) && result.warnings.length > 0 && result.warnings.map((w, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-200 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>

            {/* Config Box */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Real Mining Engine Config</h4>
                <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded uppercase">Optimized</span>
              </div>
              <div className="relative group">
                <div className="absolute top-2 right-2 flex gap-2">
                   <button className="p-1.5 bg-[#1E2128] hover:bg-zinc-700 rounded transition-colors text-gray-400">
                    <Download className="w-3.5 h-3.5" />
                   </button>
                </div>
                <div className="bg-black/40 border border-[#2A2D35] p-4 rounded-xl font-mono text-[10px] text-gray-400 leading-relaxed break-all">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#2A2D35] text-gray-500 uppercase tracking-widest font-sans">
                    <Terminal className="w-3 h-3" />
                    CLI Command
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(result.setupCommand);
                      }}
                      className="ml-auto p-1 hover:text-white transition-colors cursor-pointer active:scale-95"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {result.setupCommand || "Generating... Click 'Initialize Engine Audit' to begin."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <div className="text-[10px]">
                <p className="text-green-400 font-bold">Setup Guide</p>
                <p className="text-gray-500">1. Download XMRig. 2. Run the command above. 3. Watch real stats update.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-400 font-mono truncate ml-4 text-right max-w-[150px]">{value}</span>
    </div>
  );
}
