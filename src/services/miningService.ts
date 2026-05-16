
export interface MinerStats {
  hashrate: number;
  balance: number;
  totalHashes: number;
  activeWorkers: number;
  lastShare: number;
  performance?: any;
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
      hashrate: finalData.payHashrate || finalData.hashrate || finalData.hashratePay || finalData.hashrateRaw || finalData.hashrate_1h || 0,
      balance: (finalData.amtDue || finalData.balance || finalData.amount_due || 0) / 1000000000000,
      totalHashes: finalData.hashes || finalData.totalHashes || finalData.total_hashes || 0,
      activeWorkers: finalData.performance ? Object.keys(finalData.performance).length : 0,
      lastShare: finalData.lastShare || finalData.last_share || 0,
      performance: finalData.performance // Pass through performance data
    };
  } catch (e) {
    console.error("Failed to fetch real miner stats:", e);
    return { hashrate: 0, balance: 0, totalHashes: 0, activeWorkers: 0, lastShare: 0 };
  }
}

export async function getRealWorkerList(address: string) {
  try {
    // 1. Fetch stats first because it contains richer info in 'performance'
    const statsRes = await fetch(`/api/pool/stats/${address}`);
    let performance: any = null;
    if (statsRes.ok) {
      const statsJson = await statsRes.json();
      performance = (statsJson.stats || statsJson).performance;
    }

    // 2. Fetch identifiers list
    const response = await fetch(`/api/pool/workers/${address}`);
    const identifiers = response.ok ? await response.json() : [];
    
    // 3. Map performance data if available
    if (performance && typeof performance === 'object') {
      const workers = Object.entries(performance).map(([id, stats]: [string, any]) => {
        const hashrate = stats.hashrate || stats.h || 0;
        const lastShare = stats.lastShare || stats.last_share || stats.ts || 0;
        
        return {
          id,
          name: id,
          hashrate: Number(hashrate),
          status: (lastShare && (Date.now() / 1000) - lastShare < 1800) ? 'online' : 'offline',
          lastSeen: (lastShare && lastShare > 0) ? new Date(lastShare * 1000).toISOString() : null
        };
      });

      // Add identifiers that might not be in the performance window
      if (Array.isArray(identifiers)) {
        identifiers.forEach((id: any) => {
          const name = typeof id === 'string' ? id : (id.identifier || id.id);
          if (name && !workers.find(w => w.id === name)) {
            workers.push({
              id: name,
              name: name,
              hashrate: 0,
              status: 'offline',
              lastSeen: null
            });
          }
        });
      }
      return workers;
    }

    // Fallback if no performance data
    if (!Array.isArray(identifiers)) return [];

    return identifiers.map((w: any) => {
      const identifier = typeof w === 'string' ? w : w.identifier || w.id || 'unknown';
      const hashrate = typeof w === 'string' ? 0 : w.hashrate || 0;
      let lastShare = typeof w === 'string' ? 0 : w.lastShare || w.last_share || 0;
      
      if (typeof lastShare !== 'number') {
        const parsed = parseInt(String(lastShare));
        lastShare = isNaN(parsed) ? 0 : parsed;
      }
      
      return {
        id: identifier,
        name: identifier,
        hashrate: hashrate,
        status: lastShare && (Date.now() / 1000) - lastShare < 1200 ? 'online' : 'offline',
        lastSeen: (lastShare && lastShare > 0) ? new Date(lastShare * 1000).toISOString() : null
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
