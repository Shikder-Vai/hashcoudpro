import React from 'react';
import { ArrowUpRight, Coins, Timer } from 'lucide-react';

interface CoinCardProps {
  symbol: string;
  name: string;
  price: number;
  balance: number;
  minedToday: number;
  onWithdraw: () => void;
}

export default function CoinCard({ symbol, name, price, balance, minedToday, onWithdraw }: CoinCardProps) {
  return (
    <div className="bg-[#0D0E12] border border-[#1E2128] rounded-2xl p-5 hover:border-[#2A2D35] transition-all group relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-orange-500/10 transition-all" />
      
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black/40 rounded-lg border border-[#2A2D35] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white uppercase">{symbol[0]}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate">{name}</h3>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{symbol} / USD</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-mono font-bold text-sm">${(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-green-500 text-[9px] font-bold">+0.00%</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 flex items-center gap-2">
              <Coins className="w-3 h-3" />
              Balance
            </span>
            <span className="text-white font-mono font-bold">{balance.toFixed(4)} {symbol}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 flex items-center gap-2">
              <Timer className="w-3 h-3" />
              24h Yield
            </span>
            <span className="text-gray-400 font-mono text-[10px]">+{minedToday.toFixed(6)} {symbol}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onWithdraw}
        className="w-full bg-[#151619] hover:bg-white hover:text-black border border-[#2A2D35] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-auto"
      >
        Withdraw
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}
