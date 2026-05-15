import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, ArrowUpRight, Clock, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Withdrawal } from '../types';

export default function WithdrawalHistory() {
  const [history, setHistory] = React.useState<Withdrawal[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-[#1E2128] flex justify-between items-center bg-black/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <History className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Withdrawal History</h3>
            <p className="text-gray-500 text-xs">Real-time status of your payouts</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading && history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-xs text-gray-500 uppercase tracking-widest">Loading transactions...</p>
          </div>
        ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50 text-center">
                <History className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-sm text-gray-500">No withdrawal history found.</p>
            </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {history.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-black/20 border border-[#2A2D35] rounded-xl group hover:border-[#3A3D45] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        tx.status === 'completed' ? "bg-green-500/10" : tx.status === 'failed' ? "bg-red-500/10" : "bg-orange-500/10"
                      )}>
                        {tx.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : tx.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-bold">{tx.amount} {tx.coin}</h4>
                        <p className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{tx.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1",
                        tx.status === 'completed' ? "bg-green-500/10 text-green-500" : tx.status === 'failed' ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                      )}>
                        {tx.status}
                      </span>
                      <div className="flex items-center gap-1 justify-end text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px]">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {tx.txHash && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2128]">
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                        <span className="text-gray-600">TXID:</span> {tx.txHash}
                      </div>
                      <button 
                        onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                        className="text-[9px] text-orange-500 font-bold hover:text-orange-400 flex items-center gap-1 transition-colors"
                      >
                        Scanner <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
