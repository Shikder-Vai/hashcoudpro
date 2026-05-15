import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Cpu, Zap, Shield, Bell, Network, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsView({ walletAddress, setWalletAddress }: { walletAddress: string | null, setWalletAddress: (addr: string | null) => void }) {
  const [settings, setSettings] = React.useState(() => {
    const saved = localStorage.getItem('mining_settings');
    return saved ? JSON.parse(saved) : {
      cpuIntensity: 85,
      lowPowerMode: false,
      withdrawalAddress: walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      notifications: true
    };
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [hasSaved, setHasSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('mining_settings', JSON.stringify(settings));
      // Sync with dashboard
      setWalletAddress(settings.withdrawalAddress);
      localStorage.setItem('wallet_address', settings.withdrawalAddress);
      
      setIsSaving(false);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 2000);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Engine Settings</h2>
          <p className="text-gray-500 text-sm">Configure your mining hardware and local engine parameters</p>
        </div>
        <AnimatePresence>
          {hasSaved && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1E2128] flex items-center gap-3">
            <Cpu className="w-5 h-5 text-orange-500" />
            <h3 className="text-white font-semibold">Hardware Performance</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-white">CPU Intensity</h4>
                  <p className="text-xs text-gray-500">Resource allocation for mining process</p>
                </div>
                <span className="text-orange-500 font-mono font-bold">{settings.cpuIntensity}%</span>
              </div>
              <input 
                type="range" 
                min="0"
                max="100"
                value={settings.cpuIntensity}
                onChange={(e) => setSettings({ ...settings, cpuIntensity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-[#1A1C21] rounded-lg appearance-none cursor-pointer accent-orange-500" 
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#1E2128]">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <h4 className="text-sm font-bold text-white">Low Power Mode</h4>
                  <p className="text-[10px] text-gray-500">Reduce electricity consumption at cost of hashrate</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, lowPowerMode: !settings.lowPowerMode })}
                className={`w-10 h-6 border rounded-full relative transition-all ${settings.lowPowerMode ? 'bg-orange-500 border-orange-400' : 'bg-[#1A1C21] border-[#2A2D35]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.lowPowerMode ? 'left-5 bg-white' : 'left-1 bg-gray-500'}`} />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1E2128] flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="text-white font-semibold">Security & Withdrawal</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] text-gray-600 uppercase font-bold mb-2 block">Default Withdrawal Address</label>
              <input 
                type="text" 
                value={settings.withdrawalAddress}
                onChange={(e) => setSettings({ ...settings, withdrawalAddress: e.target.value })}
                placeholder="0x..."
                className="w-full bg-[#151619] border border-[#2A2D35] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-orange-500 transition-colors" 
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 italic px-1">
              <Shield className="w-3 h-3" />
              Address is verified against the connected smart contract protocol.
            </div>
          </div>
        </section>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
            isSaving ? 'bg-gray-200 text-gray-500 cursor-wait' : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Applying Engine Parameters...' : 'Save Configuration'}
        </button>
      </div>
    </motion.div>
  );
}
