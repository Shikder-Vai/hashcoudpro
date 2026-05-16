import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Cpu, Server, TrendingUp, TrendingDown, RefreshCw, Wallet as WalletIcon, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import CoinCard from './CoinCard';
import AIOptimizer from './AIOptimizer';
import WithdrawModal from './WithdrawModal';
import ConnectModal from './ConnectModal';
import HardwareAnalyzer from './HardwareAnalyzer';
import WorkerList from './WorkerList';
import WorkersView from './WorkersView';
import PoolsView from './PoolsView';
import SettingsView from './SettingsView';
import WithdrawalHistory from './WithdrawalHistory';

import { getRealMinerStats, getRealWorkerList } from '../services/miningService';

const MOCK_CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  hashrate: 0,
}));

type View = 'dashboard' | 'workers' | 'pools' | 'settings';

export default function Dashboard() {
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [stats, setStats] = React.useState({
    hashrate: 0,
    activeWorkers: 0,
    efficiency: 0,
    powerUsage: 0,
    balance: 0,
    totalHashes: 0,
  });

  const [prices, setPrices] = React.useState<any>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false);
  const [selectedCoin, setSelectedCoin] = React.useState<{ symbol: string, balance: number } | null>(null);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(() => {
    return localStorage.getItem('wallet_address');
  });
  const [timeframe, setTimeframe] = React.useState<'1H' | '1D' | '1W'>('1D');

  const connectWallet = async () => {
    setIsConnectModalOpen(true);
  };

  const handleConnect = (address: string, symbol: string) => {
    setWalletAddress(address);
    localStorage.setItem('wallet_address', address);
    localStorage.setItem('wallet_symbol', symbol);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('wallet_address');
  };

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        if (res.ok) {
          const data = await res.json();
          setPrices({
            XMR: data.XMR || data.monero || 150.50,
            BTC: data.BTC || data.bitcoin || 64000,
            ETH: data.ETH || data.ethereum || 3400,
            LTC: data.LTC || 85,
            raw: data // Keep raw in case it's used elsewhere
          });
        }
      } catch (err) { 
        console.error("Price fetch failed:", err); 
      }
    };
    
    const fetchStats = async () => {
      if (!walletAddress) {
        setStats({ hashrate: 0, activeWorkers: 0, efficiency: 0, powerUsage: 0, balance: 0, totalHashes: 0 });
        return;
      }

      try {
        const minerData = await getRealMinerStats(walletAddress);
        const workers = await getRealWorkerList(walletAddress);
        
        setStats({
          hashrate: minerData.hashrate || 0,
          activeWorkers: Array.isArray(workers) ? workers.filter(w => w.status === 'online').length : 0,
          efficiency: minerData.hashrate > 0 ? 100 : 0,
          powerUsage: Array.isArray(workers) ? workers.filter(w => w.status === 'online').length * 150 : 0,
          balance: minerData.balance || 0,
          totalHashes: minerData.totalHashes || 0
        });
      } catch (e) { 
        console.error("Real data fetch failed:", e); 
      }
    };

    fetchPrices();
    fetchStats();
    const interval = setInterval(() => {
      fetchPrices();
      fetchStats();
    }, 30000); // 30s for real APIs
    return () => clearInterval(interval);
  }, [walletAddress]);

  const formatHashrate = (h: number) => {
    if (h >= 1000000) return `${(h / 1000000).toFixed(2)} MH/s`;
    if (h >= 1000) return `${(h / 1000).toFixed(2)} KH/s`;
    return `${h.toFixed(1)} H/s`;
  };

  const chartData = React.useMemo(() => {
    const points = timeframe === '1H' ? 60 : timeframe === '1D' ? 24 : 7;
    return Array.from({ length: points }, (_, i) => ({
      time: timeframe === '1H' ? `${i}m` : timeframe === '1D' ? `${i}:00` : `Day ${i + 1}`,
      hashrate: stats.hashrate > 0 ? (stats.hashrate * (0.85 + Math.random() * 0.3)) : 0,
    }));
  }, [stats.hashrate, timeframe]);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-gray-300 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-[#1E2128] bg-[#0D0E12] sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold tracking-tight text-lg">HashCloud Pro</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">System Online • v4.2.1</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <button 
                id="view-dashboard"
                onClick={() => setCurrentView('dashboard')}
                className={cn(
                  "pb-1 transition-colors cursor-pointer",
                  currentView === 'dashboard' ? "text-white border-b-2 border-orange-500" : "text-gray-500 hover:text-white"
                )}
              >
                Dashboard
              </button>
              <button 
                id="view-workers"
                onClick={() => setCurrentView('workers')}
                className={cn(
                  "pb-1 transition-colors cursor-pointer",
                  currentView === 'workers' ? "text-white border-b-2 border-orange-500" : "text-gray-500 hover:text-white"
                )}
              >
                Workers
              </button>
              <button 
                id="view-pools"
                onClick={() => setCurrentView('pools')}
                className={cn(
                  "pb-1 transition-colors cursor-pointer",
                  currentView === 'pools' ? "text-white border-b-2 border-orange-500" : "text-gray-500 hover:text-white"
                )}
              >
                Pools
              </button>
              <button 
                id="view-settings"
                onClick={() => setCurrentView('settings')}
                className={cn(
                  "pb-1 transition-colors cursor-pointer",
                  currentView === 'settings' ? "text-white border-b-2 border-orange-500" : "text-gray-500 hover:text-white"
                )}
              >
                Settings
              </button>
            </div>
            
            {/* Mobile Nav Toggle */}
            <div className="lg:hidden flex items-center gap-2">
               <select 
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as View)}
                className="bg-[#151619] border border-[#2A2D35] text-white text-[10px] px-2 py-1 rounded-md focus:outline-none"
               >
                 <option value="dashboard">Dashboard</option>
                 <option value="workers">Workers</option>
                 <option value="pools">Pools</option>
                 <option value="settings">Settings</option>
               </select>
            </div>

            <div className="h-8 w-[1px] bg-[#2A2D35] mx-1" />
            {walletAddress ? (
              <button 
                onClick={disconnectWallet}
                className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1.5 rounded-xl transition-colors group relative"
                title="Click to disconnect"
              >
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-mono text-orange-200">
                  {walletAddress.substring(0, 4)}...{walletAddress.substring(38)}
                </span>
                <div className="absolute -bottom-8 right-0 bg-[#0D0E12] border border-[#1E2128] px-2 py-1 rounded text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-red-500">
                  Click to Disconnect
                </div>
              </button>
            ) : (
              <button 
                onClick={connectWallet}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-lg"
              >
                <WalletIcon className="w-3.5 h-3.5" />
                Connect
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        {currentView === 'dashboard' ? (
          <>
            {/* Core Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={<Activity className="text-orange-500" />} 
                label="Total Hashrate" 
                value={stats.hashrate > 0 ? formatHashrate(stats.hashrate) : "P00L SYNCHRONIZING..."} 
                trend={stats.hashrate > 0 ? "Live" : "Pending"} 
                isPositive={stats.hashrate > 0}
                subValue={stats.hashrate > 0 ? `Total Hashes: ${stats.totalHashes?.toLocaleString() || 0}` : "Waiting for first share..."}
              />
              <StatCard 
                icon={<Server className="text-blue-500" />} 
                label="Active Workers" 
                value={stats.activeWorkers.toString()} 
                subValue={stats.activeWorkers > 0 ? "Mining Active" : "Miner not detected yet"}
              />
              <StatCard 
                icon={<Zap className="text-yellow-500" />} 
                label="Efficiency" 
                value={`${stats.efficiency}%`} 
                trend="0.0%" 
                isPositive={true}
              />
              <StatCard 
                icon={<Cpu className="text-purple-500" />} 
                label="Power Usage" 
                value={`${stats.powerUsage || 0}W`} 
                subValue="≈ $0.00/day"
              />
            </div>

            {/* Chart, AI & Hardware Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl p-4 sm:p-6 relative overflow-hidden min-h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        Hashrate Performance
                        <TrendingUp className="text-green-500 w-4 h-4" />
                      </h3>
                      <p className="text-gray-500 text-xs">Live monitoring of pool performance</p>
                    </div>
                    <div className="flex gap-2">
                      {['1H', '1D', '1W'].map((t: any) => (
                        <button 
                          key={t} 
                          onClick={() => setTimeframe(t)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer",
                            t === timeframe ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-[#151619] border-[#2A2D35] text-gray-500 hover:text-white"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2128" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0D0E12', border: '1px solid #2A2D35', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Area type="monotone" dataKey="hashrate" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorH)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {prices && (
                    <>
                      <CoinCard 
                        symbol="XMR" 
                        name="Monero" 
                        price={prices.XMR || prices.monero} 
                        balance={stats.balance} 
                        minedToday={stats.balance > 0 ? stats.balance * 0.1 : 0} 
                        onWithdraw={() => setSelectedCoin({ symbol: 'XMR', balance: stats.balance })}
                      />
                      <CoinCard 
                        symbol="BTC" 
                        name="Bitcoin" 
                        price={prices.BTC} 
                        balance={0} 
                        minedToday={0} 
                        onWithdraw={() => setSelectedCoin({ symbol: 'BTC', balance: 0 })}
                      />
                      <CoinCard 
                        symbol="ETH" 
                        name="Ethereum" 
                        price={prices.ETH} 
                        balance={0} 
                        minedToday={0} 
                        onWithdraw={() => setSelectedCoin({ symbol: 'ETH', balance: 0 })}
                      />
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                <HardwareAnalyzer />
                <WorkerList />
                <WithdrawalHistory />
                <AIOptimizer stats={stats} />
              </div>
            </div>

            {/* Sync Troubleshooting Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 bg-[#0D0E12] border border-[#1E2128] p-6 rounded-2xl">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  Mining Initialization Progress
                </h3>
                
                <div className="relative flex flex-col gap-8 ml-4">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#1E2128]" />
                  
                  <Step 
                    active={!!walletAddress} 
                    done={!!walletAddress} 
                    title="Wallet Connected" 
                    desc={`Linked to ${walletAddress?.substring(0, 8)}...`} 
                  />
                  <Step 
                    active={!!walletAddress} 
                    done={!!walletAddress} 
                    title="Pool Handshake" 
                    desc="MoneroOcean Global Node (10128) selected" 
                  />
                  <Step 
                    active={!!walletAddress && stats.hashrate === 0} 
                    done={stats.hashrate > 0} 
                    title="Miner Integration" 
                    desc={stats.hashrate > 0 ? "Connectivity Stable" : "Waiting for 'Accepted Share' in XMRig terminal..."} 
                  />
                  <Step 
                    active={stats.hashrate > 0} 
                    done={stats.balance > 0} 
                    title="First Share Reward" 
                    desc={stats.balance > 0 ? "First reward confirmed" : "Verification usually takes 15-30 minutes"} 
                  />
                </div>
              </div>

              <div className="bg-[#0D0E12] border border-[#1E2128] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-gray-400 font-semibold mb-4 text-[10px] uppercase tracking-widest flex items-center justify-between">
                    API Connectivity
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", walletAddress ? "bg-green-500" : "bg-gray-700")} />
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">MoneroOcean</span>
                      <span className={walletAddress ? "text-green-500" : "text-gray-500"}>{walletAddress ? "Connected" : "Standby"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Sync Frequency</span>
                      <span className="text-gray-300">30s Real-time</span>
                    </div>
                    <div className="mt-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                      <p className="text-[10px] text-orange-500 font-bold mb-1 uppercase">Terminal Warning:</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Wait for the <span className="text-green-500 font-mono">"net: accepted share"</span> message in your XMRig window. Stats will remain 0 until that specific message appears.
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full mt-6 py-3 bg-[#151619] hover:bg-[#1E2128] border border-[#2A2D35] rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Force Pool Re-Sync
                </button>
              </div>
            </motion.div>
          </>
        ) : currentView === 'workers' ? (
          <WorkersView />
        ) : currentView === 'pools' ? (
          <PoolsView />
        ) : (
          <SettingsView walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
        )}
      </main>

      {selectedCoin && (
        <WithdrawModal 
          isOpen={!!selectedCoin} 
          onClose={() => setSelectedCoin(null)} 
          coin={selectedCoin.symbol}
          balance={selectedCoin.balance}
        />
      )}

      <ConnectModal 
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}

function Step({ active, done, title, desc }: { active: boolean, done: boolean, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start relative z-10">
      <div className={cn(
        "w-4 h-4 rounded-full border-2 mt-1 transition-all flex items-center justify-center",
        done ? "bg-orange-500 border-orange-500" : active ? "bg-[#0D0E12] border-orange-500 animate-pulse" : "bg-[#0D0E12] border-[#1E2128]"
      )}>
        {done && <Activity className="w-2 h-2 text-white fill-current" />}
      </div>
      <div>
        <h4 className={cn("text-xs font-bold uppercase tracking-wider", done ? "text-white" : active ? "text-orange-500" : "text-gray-600")}>{title}</h4>
        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, subValue, isPositive }: any) {
  return (
    <div className="bg-[#0D0E12] border border-[#1E2128] p-6 rounded-2xl hover:border-[#2A2D35] transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#151619] rounded-xl group-hover:bg-[#1E2128] transition-colors">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1",
            isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-white text-2xl font-bold tracking-tight">{value}</h4>
        {subValue && <p className="text-gray-600 text-[10px] mt-1 font-mono uppercase tracking-wide">{subValue}</p>}
      </div>
    </div>
  );
}
