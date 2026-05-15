import React from 'react';
import { motion } from 'motion/react';
import { Settings, Cpu, Zap, Shield, Bell, Network, Save } from 'lucide-react';

export default function SettingsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">Engine Settings</h2>
        <p className="text-gray-500 text-sm">Configure your mining hardware and local engine parameters</p>
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
                <span className="text-orange-500 font-mono font-bold">85%</span>
              </div>
              <input type="range" className="w-full h-1.5 bg-[#1A1C21] rounded-lg appearance-none cursor-pointer accent-orange-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-[#1E2128]">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <h4 className="text-sm font-bold text-white">Low Power Mode</h4>
                  <p className="text-[10px] text-gray-500">Reduce electricity consumption at cost of hashrate</p>
                </div>
              </div>
              <button className="w-10 h-6 bg-[#1A1C21] border border-[#2A2D35] rounded-full relative transition-colors">
                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
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
                defaultValue="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                className="w-full bg-[#151619] border border-[#2A2D35] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-orange-500" 
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 italic px-1">
              <Shield className="w-3 h-3" />
              Address is verified against the connected smart contract protocol.
            </div>
          </div>
        </section>

        <button className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xl">
          <Save className="w-5 h-5" />
          Save Configuration
        </button>
      </div>
    </motion.div>
  );
}
