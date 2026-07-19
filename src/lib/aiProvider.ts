interface LLMRequestOptions {
  maxTokens?: number;
  responseMimeType?: string;
  responseSchema?: object;
}

/**
 * Centralized LLM Provider Router.
 * Route to Claude (if CLAUDE_API_KEY/ANTHROPIC_API_KEY is defined) or fall back to Gemini
 * with automatic retries and model iteration (gemini-2.5-flash -> gemini-1.5-flash).
 */
export async function callLLM(prompt: string, options: LLMRequestOptions = {}): Promise<string> {
  const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (claudeKey) {
    console.log("Routing LLM request to Claude API...");
    const maxTokens = options.maxTokens || 2500;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt + "\n\nProvide ONLY the raw JSON output (no markdown wrappers, no backticks, no explanations)." }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API failure in callLLM:", errText);
      throw new Error(`Claude API failed with status ${response.status}`);
    }

    const resJson = await response.json();
    return resJson.content?.[0]?.text || "";
  } else if (geminiKey) {
    console.log("Routing LLM request to Gemini API...");
    let lastResponse: Response | null = null;

    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {}
    };
    if (options.responseMimeType) {
      payload.generationConfig.responseMimeType = options.responseMimeType;
    }
    if (options.responseSchema) {
      payload.generationConfig.responseSchema = options.responseSchema;
    }

    // Try models in order: gemini-2.5-flash first, then gemini-1.5-flash
    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      lastResponse = await callGeminiWithRetry(geminiUrl, payload);
      if (lastResponse && lastResponse.ok) {
        break;
      }
      console.warn(`${model} failed or rate limited in callLLM. Trying next model...`);
    }

    if (!lastResponse || !lastResponse.ok) {
      const errText = await lastResponse?.text();
      console.error("Gemini API failure in callLLM:", errText);
      throw new Error(`Gemini API failed with status ${lastResponse?.status}`);
    }

    const resJson = await lastResponse.json();
    const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No candidates text returned from Gemini API in callLLM");
    }
    return text;
  } else {
    throw new Error("Neither CLAUDE_API_KEY nor GEMINI_API_KEY is configured in your environment variables.");
  }
}

/**
 * Robust retry wrapper for Gemini requests on 429 status codes.
 */
export async function callGeminiWithRetry(
  url: string,
  payload: object,
  maxRetries = 3,
  delayMs = 4000
): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.warn(`Gemini 429 rate limit. Waiting ${delayMs}ms before retry ${attempt}/${maxRetries}...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status !== 429) return res;
    lastResponse = res;
  }
  return lastResponse!;
}

/**
 * Dynamic fallback image downloader using free Unsplash photo search API.
 */
export async function getUnsplashFallbackImage(query: string, orientation: "landscape" | "portrait" | "squarish" = "squarish"): Promise<string> {
  try {
    const cleanQuery = encodeURIComponent(query.substring(0, 80));
    const searchUrl = `https://unsplash.com/napi/search/photos?query=${cleanQuery}&per_page=15&orientation=${orientation}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const limit = Math.min(data.results.length, 8);
        const randomIndex = Math.floor(Math.random() * limit);
        const photo = data.results[randomIndex];
        const rawUrl = photo.urls?.raw || photo.urls?.regular;
        if (rawUrl) {
          return `${rawUrl.split('?')[0]}?q=80&w=1080&auto=format&fit=crop`;
        }
      }
    }
  } catch (err: any) {
    console.error("Unsplash fallback search failed:", err.message);
  }
  return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop"; // Premium abstract wallpaper
}
