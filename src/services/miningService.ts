
export interface MinerStats {
  hashrate: number;
  balance: number;
  totalHashes: number;
  activeWorkers: number;
  lastShare: number;
}

export async function getRealMinerStats(address: string): Promise<MinerStats | null> {
  try {
    const response = await fetch(`/api/pool/stats/${address}`);
    if (!response.ok) return null;
    const data = await response.json();
    
    // MoneroOcean API returns weights and hashrates
    return {
      hashrate: data.hashrate || 0,
      balance: (data.amtDue || 0) / 1000000000000, // Convert piconero to XMR
      totalHashes: data.hashes || 0,
      activeWorkers: 0, // Need workers endpoint for count
      lastShare: data.lastShare || 0
    };
  } catch (e) {
    console.error("Failed to fetch real miner stats:", e);
    return null;
  }
}

export async function getRealWorkerList(address: string) {
  try {
    const response = await fetch(`/api/pool/workers/${address}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((w: any) => ({
      id: w.identifier,
      name: w.identifier,
      hashrate: w.hashrate,
      status: (Date.now() / 1000) - w.lastShare < 600 ? 'online' : 'offline',
      lastSeen: new Date(w.lastShare * 1000).toISOString()
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
