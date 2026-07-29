export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (Fast)', provider: 'google' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite (Fastest)', provider: 'google' },
  { id: 'gemini-3.5-pro', name: 'Gemini 3.5 Pro (Advanced)', provider: 'google' },
];

export type ModelStatus = 'online' | 'high_demand';

interface ModelStatusRecord {
  status: ModelStatus;
  lastFailedAt?: number;
}

// In-memory cache for model statuses
// Note: In a Serverless/Vercel environment this resets per function execution,
// but for a Node.js long-running server (like local dev or standalone Next.js server), this works well.
const modelStatusCache: Record<string, ModelStatusRecord> = {};

// 10 minutes timeout before automatically unblocking a model
const HIGH_DEMAND_TIMEOUT_MS = 10 * 60 * 1000;

export class ModelRegistry {
  static getModelsWithStatus() {
    return AVAILABLE_MODELS.map(model => {
      const record = modelStatusCache[model.id];
      let status: ModelStatus = 'online';

      if (record?.status === 'high_demand' && record.lastFailedAt) {
        // Check if the timeout has expired
        if (Date.now() - record.lastFailedAt < HIGH_DEMAND_TIMEOUT_MS) {
          status = 'high_demand';
        } else {
          // Unblock if enough time has passed
          modelStatusCache[model.id] = { status: 'online' };
        }
      }

      return {
        ...model,
        status,
      };
    });
  }

  static reportFailure(modelId: string, errorDetails?: string) {
    // Check if error is related to 503 or High Demand
    const isHighDemand = errorDetails?.includes('503') || errorDetails?.toLowerCase().includes('high demand') || errorDetails?.toLowerCase().includes('overloaded');
    
    if (isHighDemand || !errorDetails) {
      console.warn(`[ModelRegistry] Model ${modelId} reported as high demand.`);
      modelStatusCache[modelId] = {
        status: 'high_demand',
        lastFailedAt: Date.now(),
      };
    }
  }

  static clearStatus(modelId: string) {
    modelStatusCache[modelId] = { status: 'online' };
  }
}
