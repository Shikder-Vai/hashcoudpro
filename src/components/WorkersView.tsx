import React from 'react';
import { motion } from 'motion/react';
import { Server, Activity, Plus } from 'lucide-react';
import WorkerList from './WorkerList';

export default function WorkersView() {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newWorkerName, setNewWorkerName] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleAddWorker = async () => {
    if (!newWorkerName.trim()) return;
    
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkerName })
      });
      
      if (res.ok) {
        setNewWorkerName("");
        setIsAdding(false);
        setRefreshKey(prev => prev + 1);
      }
    } catch (e) {
      console.error("Failed to add worker:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Cloud & Local Workers</h2>
          <p className="text-gray-500 text-sm">Monitor and manage all your mining nodes in real-time</p>
        </div>
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-[#1A1C21] p-1 rounded-xl border border-[#2A2D35] animate-in fade-in slide-in-from-right-4 duration-300">
            <input 
              autoFocus
              type="text" 
              placeholder="Rig Name (e.g. RTX 4090)"
              value={newWorkerName}
              onChange={(e) => setNewWorkerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWorker()}
              className="bg-transparent border-none outline-none px-3 py-1.5 text-xs text-white w-48 placeholder:text-gray-600"
            />
            <button 
              onClick={handleAddWorker}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              Add
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-white px-2 py-1.5 text-xs transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkerList key={refreshKey} />
        </div>
        <div className="space-y-6">
          <div className="bg-[#0D0E12] border border-[#1E2128] p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-orange-500" />
              Network Vitality
            </h3>
            <div className="space-y-4">
              <VitalItem label="Global Rank" value="#12,402" />
              <VitalItem label="Avg Uptime" value="99.98%" />
              <VitalItem label="Connection" value="SSL/TLS Secured" />
              <VitalItem label="Latency" value="24ms" />
            </div>
          </div>

          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Technical Note</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Workers are identified by their unique hardware signatures. If a worker goes offline for more than 10 minutes, an automated failover protocol will redirect regional pool traffic.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VitalItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  );
}
