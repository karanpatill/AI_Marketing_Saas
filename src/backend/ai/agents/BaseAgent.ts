import { ContextEngine } from '../core/ContextEngine';
import { GenerationContext } from '../interfaces/IGenerationModule';

export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
}

export abstract class BaseAgent {
  protected abstract readonly role: string;
  protected abstract readonly instructions: string;

  /**
   * Executes the agent's primary task.
   * By default, it gathers context from the centralized ContextEngine.
   */
  public async execute(
    workspaceId: string,
    projectId: string | undefined,
    inputPrompt: string,
    previousOutput?: string
  ): Promise<AgentResponse> {
    
    // 1. Centralized Context Gathering (No Duplication)
    const context: GenerationContext = await ContextEngine.gatherComprehensiveContext(
      workspaceId,
      projectId,
      inputPrompt
    );

    // 2. Build the specialized system prompt for this agent
    const systemPrompt = this.buildSystemPrompt(context);

    // 3. Construct the actual prompt payload
    const payload = `
      ${inputPrompt}
      
      ${previousOutput ? `--- PREVIOUS OUTPUT ---\n${previousOutput}` : ''}
    `;

    // 4. Send to Provider Router (simulated here for architecture scaffolding)
    // In production: await ProviderRouter.routeTextRequest(systemPrompt, payload);
    const simulatedResponse = `[${this.role}] executed task successfully. (Simulated Output)`;

    return {
      content: simulatedResponse,
      metadata: { role: this.role }
    };
  }

  private buildSystemPrompt(context: GenerationContext): string {
    return `
      You are the ${this.role}.
      ${this.instructions}

      --- BRAND DNA ---
      ${context.brandContext?.brand_dna || 'None provided'}

      --- KNOWLEDGE BASE ---
      ${context.knowledgeContext || 'None provided'}
    `;
  }
}
