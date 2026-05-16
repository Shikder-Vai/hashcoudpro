import React from 'react';
import { motion } from 'motion/react';
import { Server, Activity, Plus, Terminal, Copy, Check, Shield } from 'lucide-react';
import WorkerList from './WorkerList';

export default function WorkersView() {
  const [walletSymbol, setWalletSymbol] = React.useState(() => localStorage.getItem('wallet_symbol') || 'XMR');
  const [walletAddress, setWalletAddress] = React.useState(() => localStorage.getItem('wallet_address') || '');
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

          <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-orange-500" />
              {walletSymbol} Mining Config
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Pool Host & Port (SSL/TLS)</p>
                <code className="block bg-black/40 p-2 rounded-lg text-[10px] text-emerald-400 font-mono break-all border border-white/5">
                  gulf.moneroocean.stream:443
                </code>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Mining Command (XMRig - Recommended)</p>
                <code className="block bg-black p-3 rounded-lg text-[10px] text-emerald-400 font-mono break-all border border-white/10 leading-relaxed">
                  xmrig.exe -o gulf.moneroocean.stream:443 -u {walletAddress || `YOUR_${walletSymbol}_ADDRESS`} -p worker1 --tls
                </code>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Config.json Edit</p>
                <div className="bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-gray-400 space-y-1">
                  <p>"url": "gulf.moneroocean.stream:443",</p>
                  <p>"user": "{walletAddress || `YOUR_${walletSymbol}_ADDRESS`}",</p>
                  <p>"pass": "worker1",</p>
                  <p>"tls": true</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  {walletSymbol === 'XMR' 
                    ? "Mining directly to your Monero wallet." 
                    : `Mining RandomX. MoneroOcean will pay you in ${walletSymbol} (requires XMR ID).`}
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] text-yellow-200 font-bold uppercase">Performance Tip</p>
                    <p className="text-[10px] text-yellow-500/80 leading-tight">
                      Run XMRig as <span className="text-white font-bold underline">Administrator</span> to enable MSR Mods. This can increase your hashrate by up to 20-30%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl md:col-span-2">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              Fixing "Invalid payment address" Error
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs text-gray-300 font-medium">কেন এই সমস্যাটি হচ্ছে?</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  আপনি সম্ভবত একটি Ethereum (0x...) বা Bitcoin অ্যাড্রেস ব্যবহার করছেন। MoneroOcean পুলে মাইনিং করতে চাইলে ইউজারনেম হিসেবে অবশ্যই একটি <span className="text-orange-500 font-bold">Monero (XMR)</span> অ্যাড্রেস দিতে হবে। মোনেরো অ্যাড্রেস সাধারণত ৯৫ অক্ষরের হয়।
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-300 font-medium">সমাধান কী?</p>
                <ol className="text-[11px] text-gray-500 list-decimal ml-4 space-y-1">
                  <li>একটি Monero (XMR) ওয়ালেট তৈরি করুন (যেমন Cake Wallet বা GUI Wallet)।</li>
                  <li>আমাদের সফটওয়্যারের 'Connect Wallet' অপশনে গিয়ে সেই <span className="text-white">XMR অ্যাড্রেসটি</span> দিন।</li>
                  <li>তারপর XMRig আবার রান করুন, এররটি চলে যাবে।</li>
                </ol>
              </div>
            </div>
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
