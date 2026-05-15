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
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd");
      const data = await response.json();
      res.json({
        BTC: data.bitcoin.usd,
        ETH: data.ethereum.usd,
        LTC: data.litecoin.usd,
      });
    } catch (error) {
      // Fallback
      res.json({
        BTC: 64000 + Math.random() * 500,
        ETH: 3400 + Math.random() * 50,
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
