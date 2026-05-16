
export interface MinerStats {
  hashrate: number;
  balance: number;
  totalHashes: number;
  activeWorkers: number;
  lastShare: number;
}

export async function getRealMinerStats(address: string): Promise<MinerStats> {
  try {
    const response = await fetch(`/api/pool/stats/${address}`);
    if (!response.ok) {
      // If pool doesn't know address, it's not necessarily a fatal error
      return {
        hashrate: 0,
        balance: 0,
        totalHashes: 0,
        activeWorkers: 0,
        lastShare: 0
      };
    }
    const data = await response.json();
    
    // Check if API returned an error message in a successful response
    if (data.error || (Object.keys(data).length === 0)) {
       return { hashrate: 0, balance: 0, totalHashes: 0, activeWorkers: 0, lastShare: 0 };
    }

    return {
      hashrate: data.hashrate || 0,
      balance: (data.amtDue || 0) / 1000000000000,
      totalHashes: data.hashes || 0,
      activeWorkers: 0,
      lastShare: data.lastShare || 0
    };
  } catch (e) {
    console.error("Failed to fetch real miner stats:", e);
    return { hashrate: 0, balance: 0, totalHashes: 0, activeWorkers: 0, lastShare: 0 };
  }
}

export async function getRealWorkerList(address: string) {
  try {
    const response = await fetch(`/api/pool/workers/${address}`);
    if (!response.ok) return [];
    const data = await response.json();
    
    if (!Array.isArray(data)) return [];

    return data.map((w: any) => ({
      id: w.identifier || 'unknown',
      name: w.identifier || 'unknown',
      hashrate: w.hashrate || 0,
      status: (Date.now() / 1000) - (w.lastShare || 0) < 600 ? 'online' : 'offline',
      lastSeen: w.lastShare ? new Date(w.lastShare * 1000).toISOString() : 'Never'
    }));
  } catch (e) {
    console.error("Failed to fetch real workers:", e);
    return [];
  }
}

export async function getNetworkStats() {
  try {
    const response = await fetch('https://api.moneroocean.stream/network/stats');
    return await response.json();
  } catch (e) {
    return null;
  }
}
