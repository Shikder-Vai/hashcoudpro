import React from 'react';
import { motion } from 'motion/react';
import { Database, Zap, Globe, Shield, Users, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

import { getNetworkStats } from '../services/miningService';

const INITIAL_POOL_DATA = [
  { id: 1, name: 'MoneroOcean', region: 'Global', fee: '0.9%', hashrate: '125.5 MH/s', miners: '42.1k' },
  { id: 2, name: 'SupportXMR', region: 'Europe/US', fee: '0.6%', hashrate: '82.2 MH/s', miners: '18.4k' },
  { id: 3, name: 'Nanopool', region: 'Global', fee: '1.0%', hashrate: '45.9 MH/s', miners: '12.9k' },
  { id: 4, name: 'MineXMR', region: 'Global', fee: '1.0%', hashrate: '18.1 MH/s', miners: '8.2k' },
];

export default function PoolsView() {
  const [connectedId, setConnectedId] = React.useState(1);
  const [switchingId, setSwitchingId] = React.useState<number | null>(null);
  const [poolData, setPoolData] = React.useState(INITIAL_POOL_DATA);

  React.useEffect(() => {
    const fetchNet = async () => {
      const stats = await getNetworkStats();
      if (stats) {
        // Just subtly update the first one if it's our primary
        setPoolData(prev => prev.map((p, i) => i === 0 ? { ...p, hashrate: `${((stats.hashrate || 0) / 1000000).toFixed(1)} MH/s` } : p));
      }
    };
    fetchNet();
  }, []);

  const handleSwitch = async (id: number) => {
    setSwitchingId(id);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectedId(id);
    setSwitchingId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Mining Pools</h2>
          <p className="text-gray-500 text-sm">Select and manage your mining pool connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poolData.map((pool) => (
          <div key={pool.id} className={cn(
            "bg-[#0D0E12] border p-6 rounded-2xl transition-all group relative",
            connectedId === pool.id ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-[#1E2128] hover:border-orange-500/30"
          )}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 bg-[#151619] rounded-xl flex items-center justify-center border transition-colors",
                  connectedId === pool.id ? "border-orange-500/50" : "border-[#2A2D35] group-hover:border-orange-500/50"
                )}>
                  <Database className={cn("w-6 h-6", connectedId === pool.id ? "text-orange-500" : "text-gray-500")} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{pool.name}</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-600" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{pool.region}</span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                connectedId === pool.id ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-gray-800 text-gray-500 border border-gray-700"
              )}>
                {switchingId === pool.id ? "Connecting..." : connectedId === pool.id ? "connected" : "available"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Fee</p>
                <p className="text-white font-mono text-xs">{pool.fee}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Hashrate</p>
                <p className="text-white font-mono text-xs">{pool.hashrate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase font-bold mb-1">Miners</p>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-orange-500" />
                  <p className="text-white font-mono text-xs">{pool.miners}</p>
                </div>
              </div>
            </div>

            <button 
              disabled={connectedId === pool.id || switchingId !== null}
              onClick={() => handleSwitch(pool.id)}
              className={cn(
                "w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                connectedId === pool.id 
                  ? "bg-green-600/10 text-green-500 border border-green-500/20 cursor-default" 
                  : switchingId === pool.id 
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse"
                    : "bg-[#151619] border border-[#2A2D35] text-white hover:bg-white hover:text-black active:scale-[0.98]"
              )}
            >
              {switchingId === pool.id ? "Authenticating..." : connectedId === pool.id ? "Current Active Pool" : "Switch Pool"}
              <ArrowUpRight className="w-4 h-4" />
            </button>

            {connectedId === pool.id && (
              <div className="mt-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">XMRig Connection Detail</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase">Pool Address</p>
                    <code className="text-xs text-orange-300 font-mono">gulf.moneroocean.stream:10128</code>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase">Your Config Flag</p>
                    <div className="bg-black/40 p-2 rounded border border-[#2A2D35] text-[10px] font-mono text-gray-400 break-all">
                      -o gulf.moneroocean.stream:10128 -u {localStorage.getItem('wallet_address') || 'YOUR_WALLET'} -p worker1
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-4">
        <Shield className="w-6 h-6 text-orange-500 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-orange-500 font-bold text-sm">Pool Safety Protocol</h4>
          <p className="text-gray-500 text-xs leading-relaxed">
            HashCloud Pro simplifies pool monitoring. When switching, ensure your local miner (XMRig) is updated with the new pool address.
          </p>
          <div className="pt-2 flex items-center gap-2 text-orange-500/80 text-[10px] font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            Normalization takes 5-10 minutes
          </div>
        </div>
      </div>
    </motion.div>
  );
}
