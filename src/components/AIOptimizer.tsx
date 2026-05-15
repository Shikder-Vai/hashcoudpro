import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, ShieldCheck, Cpu } from 'lucide-react';

interface Optimization {
  title: string;
  description: string;
}

export default function AIOptimizer({ stats }: { stats: any }) {
  const [loading, setLoading] = React.useState(false);
  const [optimizations, setOptimizations] = React.useState<Optimization[]>([]);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      if (response.ok) {
        const data = await response.json();
        setOptimizations(data.optimizations || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#151619] border border-[#2A2D35] rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Gemini AI Optimizer</h3>
            <p className="text-gray-500 text-xs">AI-Powered Mining Insights</p>
          </div>
        </div>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Explore Insights
              <Zap className="w-4 h-4 fill-current" />
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {optimizations.length > 0 ? (
          optimizations.map((opt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-black/20 border border-[#2A2D35] rounded-xl hover:border-purple-500/50 transition-colors"
            >
              <h4 className="text-purple-400 text-sm font-bold mb-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                {opt.title}
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                {opt.description}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-[#2A2D35] rounded-xl">
            <Cpu className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Run analyzer to see hash-rate optimization tips</p>
          </div>
        )}
      </div>
    </div>
  );
}
