import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Shield, X, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, symbol: string) => void;
}

export default function ConnectModal({ isOpen, onClose, onConnect }: ConnectModalProps) {
  const [address, setAddress] = React.useState('');
  const [selectedSymbol, setSelectedSymbol] = React.useState('XMR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onConnect(address.trim(), selectedSymbol);
      onClose();
    }
  };

  const coins = [
    { symbol: 'XMR', name: 'Monero', color: 'bg-orange-500' },
    { symbol: 'BTC', name: 'Bitcoin', color: 'bg-yellow-500' },
    { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#151619] border border-[#2A2D35] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-6 border-b border-[#2A2D35] flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Connect Wallet</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-1">Select Network & Sync</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Select Mining Asset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {coins.map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() => setSelectedSymbol(coin.symbol)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        selectedSymbol === coin.symbol 
                          ? "bg-white/5 border-orange-500/50 text-white" 
                          : "bg-black/20 border-[#2A2D35] text-gray-500 hover:border-gray-700"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", selectedSymbol === coin.symbol ? coin.color : "bg-gray-700")} />
                      <span className="text-[10px] font-bold uppercase">{coin.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    {selectedSymbol} Wallet Address
                  </label>
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={`Enter ${selectedSymbol} Address...`}
                      className="w-full bg-black/40 border border-[#2A2D35] rounded-xl px-4 py-4 text-white text-xs font-mono focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-700"
                    />
                    <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!address.trim()}
                  className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]"
                >
                  Synchronize Data
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
            
            <div className="p-4 bg-[#0D0E12] border-t border-[#1E2128]">
              <p className="text-[9px] text-gray-600 text-center uppercase tracking-widest leading-relaxed">
                Your primary mining rewards will be tracked via the {selectedSymbol} network.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
