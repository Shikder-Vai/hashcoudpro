import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Shield, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { BrowserProvider } from 'ethers';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, symbol: string) => void;
}

export default function ConnectModal({ isOpen, onClose, onConnect }: ConnectModalProps) {
  const [address, setAddress] = React.useState('');
  const [selectedSymbol, setSelectedSymbol] = React.useState('XMR');
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onConnect(address.trim(), selectedSymbol);
      onClose();
    }
  };

  const handleWeb3Connect = async () => {
    if (!window.ethereum) {
      alert("Please install Trust Wallet or MetaMask to use this feature.");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        // Default to ETH or BNB if it looks like an EVM address
        if (accounts[0].startsWith('0x')) {
          setSelectedSymbol('ETH');
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
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
                  Connect Method
                </label>
                <button
                  onClick={handleWeb3Connect}
                  disabled={isConnecting}
                  className="w-full bg-[#1C1E23] hover:bg-[#252830] border border-[#2A2D35] text-white p-4 rounded-xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Direct Wallet Link</p>
                      <p className="text-[9px] text-gray-500">Trust Wallet, MetaMask, Rabby</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </button>

                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-[#2A2D35]"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-gray-700 uppercase font-bold">Or Manual Entry</span>
                  <div className="flex-grow border-t border-[#2A2D35]"></div>
                </div>

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

              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p className="text-[10px] text-red-400 leading-tight">
                  <span className="font-bold">Important:</span> MoneroOcean pool requires a <span className="underline">Monero (XMR) address</span> as your username, even if you want to be paid in {selectedSymbol}.
                </p>
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
