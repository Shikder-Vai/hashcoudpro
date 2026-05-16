import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import { getMiningOptimization, analyzeHardwareSuitability } from "./src/lib/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory withdrawal history
  let withdrawalHistory: any[] = [];
  
  // In-memory workers list
  let workers: any[] = [
    { id: "w1", name: "Main Rig - RTX 3090", hashrate: 124.5, status: "online", lastSeen: new Date().toISOString() },
    { id: "w2", name: "Secondary - RX 6800", hashrate: 62.1, status: "online", lastSeen: new Date().toISOString() }
  ];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Workers status endpoint
  app.get("/api/workers", (req, res) => {
    res.json(workers);
  });

  // Withdrawal History endpoint (missing in previous edit)
  app.get("/api/withdrawals", (req, res) => {
    res.json(withdrawalHistory);
  });

  app.post("/api/workers", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const newWorker = {
      id: "w_" + Math.random().toString(36).substring(7),
      name,
      hashrate: 0, // Initially 0 until it starts mining
      status: "online",
      lastSeen: new Date().toISOString(),
    };
    
    workers = [...workers, newWorker];
    res.json(newWorker);
  });

  app.post("/api/withdrawals", (req, res) => {
    const { coin, amount, address } = req.body;
    const newTx = {
      id: "tx_" + Math.random().toString(36).substring(7),
      coin,
      amount,
      address,
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    withdrawalHistory = [newTx, ...withdrawalHistory];
    
    // Simulate transaction processing
    setTimeout(() => {
      const txIndex = withdrawalHistory.findIndex(tx => tx.id === newTx.id);
      if (txIndex !== -1) {
        withdrawalHistory[txIndex].status = Math.random() > 0.05 ? "completed" : "failed";
        if (withdrawalHistory[txIndex].status === "completed") {
          withdrawalHistory[txIndex].txHash = "0x" + Math.random().toString(16).substring(2, 10) + "..." + Math.random().toString(16).substring(2, 6);
        }
      }
    }, 10000); // 10 seconds simulation

    res.json(newTx);
  });

// Real crypto prices from public API (fallback to simulation if API fails)
  app.get("/api/prices", async (req, res) => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,monero,litecoin&vs_currencies=usd&include_24hr_change=true");
      if (!response.ok) throw new Error("Gecko API error");
      const data = await response.json();
      res.json({
        monero: data.monero?.usd || 150.25,
        monero_24h_change: data.monero?.usd_24h_change || 0,
        bitcoin: data.bitcoin?.usd || 64000,
        bitcoin_24h_change: data.bitcoin?.usd_24h_change || 0,
        ethereum: data.ethereum?.usd || 3400,
        ethereum_24h_change: data.ethereum?.usd_24h_change || 0,
        litecoin: data.litecoin?.usd || 85,
        litecoin_24h_change: data.litecoin?.usd_24h_change || 0,
        XMR: data.monero?.usd || 150.25,
        BTC: data.bitcoin?.usd || 64000,
        ETH: data.ethereum?.usd || 3400,
        LTC: data.litecoin?.usd || 85,
      });
    } catch (error) {
      // Fallback
      res.json({
        monero: 152.40 + Math.random() * 2,
        bitcoin: 64100 + Math.random() * 500,
        ethereum: 3420 + Math.random() * 50,
        XMR: 152.40 + Math.random() * 2,
        BTC: 64100 + Math.random() * 500,
        ETH: 3420 + Math.random() * 50,
        LTC: 85 + Math.random() * 5,
      });
    }
  });

  // Hardware Analysis endpoint
  app.post("/api/hardware/analyze", async (req, res) => {
    try {
      const result = await analyzeHardwareSuitability(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Hardware analysis error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // AI Optimization endpoint
  app.post("/api/ai/optimize", async (req, res) => {
    try {
      const result = await getMiningOptimization(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("AI optimization error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // MoneroOcean Proxy for stats
  app.get("/api/pool/stats/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const response = await fetch(`https://api.moneroocean.stream/miner/${address}/stats`);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Pool API error", status: response.status });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Pool stats proxy error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // MoneroOcean Proxy for workers
  app.get("/api/pool/workers/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const response = await fetch(`https://api.moneroocean.stream/miner/${address}/identifiers`);
      
      if (!response.ok) {
        if (response.status === 404) return res.json([]); // No workers yet
        return res.status(response.status).json({ error: "Pool API error", status: response.status });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Pool workers proxy error:", error);
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  // Catch-all for API routes to prevent landing on SPA index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
