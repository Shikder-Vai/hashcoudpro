import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Wallet, ArrowUpRight, CheckCircle2, Shield, AlertCircle, X } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: string;
  balance: number;
}

export default function WithdrawModal({ isOpen, onClose, coin, balance }: WithdrawModalProps) {
  const [address, setAddress] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount) return;
    
    setStatus('processing');
    
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin,
          amount: parseFloat(amount),
          address
        })
      });
      
      if (response.ok) {
        // Wait a bit to simulate "broadcasting"
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#151619] border border-[#2A2D35] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-bottom border-[#2A2D35] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Wallet className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-white font-semibold">Withdraw {coin}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {status === 'idle' || status === 'processing' ? (
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                        Smart Contract / Wallet Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-black/30 border border-[#2A2D35] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm"
                        />
                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
                          Amount
                        </label>
                        <span className="text-xs text-gray-500">Available: {balance} {coin}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.001"
                          max={balance}
                          className="w-full bg-black/30 border border-[#2A2D35] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors font-mono text-sm"
                        />
                        <button 
                          type="button"
                          onClick={() => setAmount(balance.toString())}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-orange-500 font-semibold hover:text-orange-400 transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <button
                      disabled={status === 'processing' || !address || !amount}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                    >
                      {status === 'processing' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          Verify & Withdraw
                          <ArrowUpRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-[10px] text-gray-500 text-center leading-relaxed px-4">
                      By proceeding, you confirm all withdrawal details are correct. 
                      Smart contract transactions are irreversible.
                    </p>
                  </form>
                ) : status === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Transfer Initiated</h3>
                    <p className="text-gray-500 text-sm mb-6 px-4 leading-relaxed">
                      Your withdrawal for <span className="text-white">{amount} {coin}</span> is being broadcasted to the network.
                    </p>
                    
                    <button 
                      onClick={() => window.open('https://etherscan.io', '_blank')}
                      className="w-full py-4 bg-[#1E2128] border border-[#2A2D35] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all mb-4"
                    >
                      View on Block Explorer
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={onClose}
                      className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      Close Transaction Record
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Invalid Address</h4>
                    <p className="text-gray-400 text-sm mb-6">
                      The provided smart contract address format is invalid. Ensure it is a valid hex address.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
