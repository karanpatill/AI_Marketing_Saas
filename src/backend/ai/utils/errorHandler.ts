export function formatAiError(error: any): string {
  const msg = error?.message || String(error) || "";
  
  if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("exhausted")) {
    return "Our AI engines are currently experiencing high demand. Please wait a moment and try again.";
  }
  
  if (msg.includes("503") || msg.toLowerCase().includes("overloaded")) {
    return "The AI generation service is temporarily overloaded. Please try again in a few seconds.";
  }

  if (msg.toLowerCase().includes("api key not valid") || msg.includes("API key")) {
    return "The AI system is not properly configured. Please contact support.";
  }

  return "Error: " + msg;
}
