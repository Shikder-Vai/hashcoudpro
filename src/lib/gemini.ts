import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey 
  ? new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

export async function getMiningOptimization(data: any) {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `As a crypto mining expert AI, analyze the following mining statistics and provide 3 actionable optimization tips:
      ${JSON.stringify(data)}
      
      Response format: JSON with an "optimizations" array of objects {title, description}.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      return JSON.parse(text || "{}");
    } catch (e) {
      console.error("AI response error, using local fallback:", e);
    }
  }
  
  // Local Expert Fallback for Optimizations
  return {
    optimizations: [
      {
        title: "Large Pages Optimization",
        description: "Configure 'Lock Pages in Memory' in Windows Local Security Policy to boost RandomX hashrate by ~15%."
      },
      {
        title: "Memory Latency Tweak",
        description: "Ensure your RAM is running in dual-channel mode. Monero mining is heavily dependent on memory bandwidth and latency."
      },
      {
        title: "Undervolting CPU",
        description: "Reducing CPU core voltage can lower temperatures and prevent thermal throttling during long mining sessions."
      }
    ]
  };
}

export async function analyzeHardwareSuitability(specs: any) {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `As a mining hardware expert, analyze this PC configuration for cryptocurrency mining suitability:
      System: ${specs.systemModel}
      CPU: ${specs.processor}
      RAM: ${specs.ram}
      OS: ${specs.os}
      
      Provide a detailed JSON response with:
      1. "suitabilityScore": 0-100
      2. "recommendedCoin": (e.g. "Monero XMR", "None")
      3. "estimatedHashrate": string description
      4. "warnings": string array
      5. "setupCommand": a suggested CLI command for XMRig. Use a common pool like moneroocean.stream or nanopool. Use the user's wallet address if provided, otherwise using a placeholder "YOUR_WALLET_ADDRESS".
      
      IMPORTANT: In the "warnings" or a new field "setupSteps", explicitly mention that for Windows 10 Pro x64, they should download "xmrig-6.26.0-windows-x64.zip" from the official releases.
      
      Keep it professional and technical.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      return JSON.parse(text || "{}");
    } catch (e) {
      console.error("AI response error, using local fallback:", e);
    }
  }

  // Local Expert Fallback for Hardware Analysis
  const cpu = (specs.processor || "").toLowerCase();
  const isLaptop = (specs.systemModel || "").toLowerCase().includes("laptop") || (specs.processor || "").toLowerCase().includes("u") || (specs.processor || "").toLowerCase().includes("m");
  
  let score = 45;
  if (cpu.includes("i7") || cpu.includes("ryzen 7")) score += 25;
  if (cpu.includes("i9") || cpu.includes("ryzen 9")) score += 40;
  if (isLaptop) score -= 20;

  return {
    suitabilityScore: Math.min(Math.max(score, 5), 98),
    recommendedCoin: score > 30 ? "Monero (XMR)" : "None (Low ROI)",
    estimatedHashrate: score > 50 ? "2.5 KH/s" : "450 H/s",
    warnings: [
      isLaptop ? "Thermal Warning: Laptops are not designed for 100% sustained load." : "Ensure adequate cooling for sustained mining operations.",
      "Electricity cost may exceed hardware earnings in most regions.",
      "For Windows 10 Pro x64, download xmrig-6.26.0-windows-x64.zip from the official releases."
    ],
    setupCommand: `xmrig.exe -o gulf.moneroocean.stream:10128 -u YOUR_WALLET_ADDRESS -p local_miner --cpu-max-threads-hint 50`
  };
}
