import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Cpu, Server, TrendingUp, TrendingDown, RefreshCw, Wallet as WalletIcon, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import CoinCard from './CoinCard';
import AIOptimizer from './AIOptimizer';
import WithdrawModal from './WithdrawModal';
import HardwareAnalyzer from './HardwareAnalyzer';
import WorkerList from './WorkerList';
import WorkersView from './WorkersView';
import PoolsView from './PoolsView';
import SettingsView from './SettingsView';
import WithdrawalHistory from './WithdrawalHistory';

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
  });

  const [prices, setPrices] = React.useState<any>(null);
  const [selectedCoin, setSelectedCoin] = React.useState<{ symbol: string, balance: number } | null>(null);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  const connectWallet = async () => {
    // In a real environment, this would call window.ethereum.request
    // For now, we simulate a successful connection for the UI demonstration
    setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  };

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        setPrices(data);
      } catch (e) { console.error(e); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

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
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-mono text-orange-200">
                  {walletAddress.substring(0, 4)}...{walletAddress.substring(38)}
                </span>
              </div>
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
                value={`${stats.hashrate.toFixed(1)} MH/s`} 
                trend="0.0%" 
                isPositive={true}
              />
              <StatCard 
                icon={<Server className="text-blue-500" />} 
                label="Active Workers" 
                value={stats.activeWorkers.toString()} 
                subValue="Initialize mining..."
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
                value={`${stats.powerUsage}W`} 
                subValue="≈ $0.00/day"
              />
            </div>

            {/* Chart, AI & Hardware Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        Hashrate Performance
                        <TrendingUp className="text-green-500 w-4 h-4" />
                      </h3>
                      <p className="text-gray-500 text-xs">Live monitoring of pool performance</p>
                    </div>
                    <div className="flex gap-2">
                      {['1H', '1D', '1W'].map(t => (
                        <button key={t} className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border",
                          t === '1D' ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-[#151619] border-[#2A2D35] text-gray-500 hover:text-white"
                        )}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative h-[250px] sm:h-[300px] w-full min-w-0">
                    <div className="absolute inset-0">
                      <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_CHART_DATA}>
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
              </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {prices && (
                    <>
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
                      <CoinCard 
                        symbol="LTC" 
                        name="Litecoin" 
                        price={prices.LTC} 
                        balance={0} 
                        minedToday={0} 
                        onWithdraw={() => setSelectedCoin({ symbol: 'LTC', balance: 0 })}
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
          </>
        ) : currentView === 'workers' ? (
          <WorkersView />
        ) : currentView === 'pools' ? (
          <PoolsView />
        ) : (
          <SettingsView />
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
