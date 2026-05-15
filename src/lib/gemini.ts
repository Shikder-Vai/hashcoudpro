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
  if (!ai) throw new Error("Gemini API key not configured");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As a crypto mining expert AI, analyze the following mining statistics and provide 3 actionable optimization tips:
    ${JSON.stringify(data)}
    
    Response format: JSON with an "optimizations" array of objects {title, description}.`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeHardwareSuitability(specs: any) {
  if (!ai) throw new Error("Gemini API key not configured");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  return JSON.parse(response.text);
}
