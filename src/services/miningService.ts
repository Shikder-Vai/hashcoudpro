
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
    console.log("Pool Stats Data:", data);
    
    const finalData = data.stats || data;
    
    // Check if API returned an error message in a successful response
    if (finalData.error || (Object.keys(finalData).length === 0)) {
       return { hashrate: 0, balance: 0, totalHashes: 0, activeWorkers: 0, lastShare: 0 };
    }

    return {
      hashrate: finalData.hashrate || finalData.hashratePay || finalData.hashrateRaw || 0,
      balance: (finalData.amtDue || 0) / 1000000000000,
      totalHashes: finalData.hashes || finalData.totalHashes || 0,
      activeWorkers: 0,
      lastShare: finalData.lastShare || 0
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

    return data.map((w: any) => {
      const identifier = typeof w === 'string' ? w : w.identifier || 'unknown';
      const hashrate = typeof w === 'string' ? 0 : w.hashrate || 0;
      const lastShare = typeof w === 'string' ? 0 : w.lastShare || 0;
      
      return {
        id: identifier,
        name: identifier,
        hashrate: hashrate,
        status: (Date.now() / 1000) - lastShare < 600 ? 'online' : 'offline',
        lastSeen: lastShare ? new Date(lastShare * 1000).toISOString() : 'Waiting...'
      };
    });
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
