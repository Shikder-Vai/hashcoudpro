
export interface MoneroOceanStats {
  hashrate: number;
  hashrate_24h: number;
  total_hashes: number;
  balance: number;
  paid: number;
  lastShare: number;
  workers: Array<{
    name: string;
    hashrate: number;
    lastShare: number;
  }>;
}

export async function fetchPoolStats(address: string): Promise<MoneroOceanStats | null> {
  if (!address) return null;

  try {
    // MoneroOcean API Endpoints
    const statsRes = await fetch(`https://api.moneroocean.stream/miner/${address}/stats`);
    const workersRes = await fetch(`https://api.moneroocean.stream/miner/${address}/identifiers`);
    
    if (!statsRes.ok) return null;

    const stats = await statsRes.json();
    const workersInfo = await workersRes.json();

    const workers = Array.isArray(workersInfo) ? workersInfo.map((w: any) => ({
      name: w.identifier || 'unknown',
      hashrate: parseFloat(w.hashrate) || 0,
      lastShare: w.lastShare || 0
    })) : [];

    return {
      hashrate: parseFloat(stats.hashrate) || 0,
      hashrate_24h: parseFloat(stats.hashrate_24h) || 0,
      total_hashes: stats.hashes || 0,
      balance: (stats.amtDue || 0) / 1000000000000, // Convert atomic units to XMR
      paid: (stats.amtPaid || 0) / 1000000000000,
      lastShare: stats.lastShare || 0,
      workers
    };
  } catch (error) {
    console.error("Failed to fetch MoneroOcean stats:", error);
    return null;
  }
}
