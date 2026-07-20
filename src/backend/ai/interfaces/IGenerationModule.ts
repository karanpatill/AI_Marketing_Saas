export interface GenerationContext {
  userId: string;
  orgId: string;
  workspaceId: string;
  brandDnaId?: string;
  inputParams: Record<string, any>;
  brandContext?: any; 
  knowledgeContext?: string;
}

export interface GenerationResult {
  status: 'completed' | 'failed';
  outputReference?: Record<string, any>;
  error?: string;
  metadata?: {
    provider: string;
    duration: number;
    estimatedCost?: number;
    tokens?: number;
  };
}

export interface IGenerationModule {
  jobType: string;
  
  /** Gather necessary background context like brand DNA */
  buildContext(input: Record<string, any>, workspaceId: string): Promise<GenerationContext>;
  
  /** Construct provider-agnostic prompt */
  buildPrompt(context: GenerationContext): Promise<string>;
  
  /** Optimize prompt specifically for the target model */
  optimizePrompt(prompt: string, targetModel: string): string;
  
  /** Select optimal AI provider based on request */
  routeProvider(context: GenerationContext): string;
  
  /** Execute the generation using the selected provider */
  execute(prompt: string, provider: string, context: GenerationContext, updateProgress: (progress: number, step: string) => Promise<void>): Promise<GenerationResult>;
  
  /** Verify output format and safety */
  validateOutput(rawResponse: any): Promise<boolean>;
}
