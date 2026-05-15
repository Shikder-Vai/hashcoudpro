import React from 'react';
import { motion } from 'motion/react';
import { Server, Activity, Clock, CircleDot, SignalHigh, SignalLow } from 'lucide-react';
import { cn } from '../lib/utils';
import { Worker } from '../types';

export default function WorkerList() {
  const [workers, setWorkers] = React.useState<Worker[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rebootingId, setRebootingId] = React.useState<string | null>(null);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      setWorkers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReboot = async (id: string) => {
    if (rebootingId) return;
    setRebootingId(id);
    // Simulate remote command execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    setRebootingId(null);
    fetchWorkers();
  };

  React.useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-[#1E2128] flex justify-between items-center bg-black/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Server className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Active Workers</h3>
            <p className="text-gray-500 text-xs">Real-time node performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <SignalHigh className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Syncing</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading && workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <Activity className="w-8 h-8 text-orange-500 animate-pulse mb-3" />
            <p className="text-xs text-gray-500 uppercase tracking-widest">Bridging nodes...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker) => (
              <motion.div
                key={worker.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleReboot(worker.id)}
                className={cn(
                  "p-4 bg-black/20 border rounded-xl flex items-center justify-between transition-all cursor-pointer relative group",
                  worker.status === 'online' ? "border-[#2A2D35] hover:border-orange-500/30" : "border-red-900/20 opacity-60",
                  rebootingId === worker.id && "animate-pulse border-orange-500"
                )}
              >
                {rebootingId === worker.id && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    Executing Maintenance...
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
                    worker.status === 'online' ? "bg-orange-500/5 border-orange-500/20 group-hover:bg-orange-500/10" : "bg-gray-800 border-gray-700"
                  )}>
                    {worker.status === 'online' ? (
                      <CircleDot className="w-5 h-5 text-orange-500 fill-current animate-pulse" />
                    ) : (
                      <CircleDot className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold tracking-tight">{worker.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(worker.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      worker.status === 'online' ? "bg-green-500" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      worker.status === 'online' ? "text-green-500" : "text-red-500"
                    )}>
                      {worker.status}
                    </span>
                  </div>
                  <div className={cn(
                    "text-xs font-mono font-bold",
                    worker.status === 'online' ? "text-orange-500" : "text-gray-600"
                  )}>
                    {worker.hashrate.toFixed(2)} MH/s
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#1E2128] bg-black/20 text-center">
        <p className="text-[10px] text-gray-600">Total active node connectivity: <span className="text-green-500 font-bold">100% stable</span></p>
      </div>
    </div>
  );
}
