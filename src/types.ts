export interface MiningStats {
  hashrate: number;
  activeWorkers: number;
  efficiency: number;
  powerUsage: number;
}

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  balance: number;
  minedToday: number;
}

export interface Worker {
  id: string;
  name: string;
  hashrate: number;
  status: 'online' | 'offline';
  lastSeen: string;
}

export interface Withdrawal {
  id: string;
  coin: string;
  amount: number;
  address: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  txHash?: string;
}
