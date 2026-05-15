import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getMiningOptimization, analyzeHardwareSuitability } from "./src/lib/gemini.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory withdrawal history (persists while server is running)
  let withdrawalHistory: any[] = [];

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Withdrawal History endpoints
  app.get("/api/withdrawals", (req, res) => {
    res.json(withdrawalHistory);
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
      res.status(500).json({ error: error.message });
    }
  });

  // AI Optimization endpoint
  app.post("/api/ai/optimize", async (req, res) => {
    try {
      const result = await getMiningOptimization(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workers status endpoint
  app.get("/api/workers", (req, res) => {
    const workers = [
      {
        id: "w1",
        name: "MainRig-v3",
        hashrate: 42.5 + Math.random() * 5,
        status: "online",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "w2",
        name: "Laptop-G3",
        hashrate: 12.2 + Math.random() * 2,
        status: "online",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "w3",
        name: "ASIC-V4",
        hashrate: 0,
        status: "offline",
        lastSeen: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "w4",
        name: "Office-Rig",
        hashrate: 85.1 + Math.random() * 10,
        status: "online",
        lastSeen: new Date().toISOString(),
      }
    ];
    res.json(workers);
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
