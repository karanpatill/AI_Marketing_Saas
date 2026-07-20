import { agentManager } from '../agents/AgentManager';

export interface OrchestrationResult {
  status: 'completed' | 'failed';
  finalOutput: string;
  history: { agent: string; output: string }[];
}

export class TaskOrchestrator {
  
  /**
   * Executes a sequential DAG of agents.
   * Example: ['marketing_strategist', 'copywriter']
   * The output of the strategist is passed as context to the copywriter.
   */
  public static async executePipeline(
    workspaceId: string,
    projectId: string | undefined,
    initialPrompt: string,
    agentRoles: string[]
  ): Promise<OrchestrationResult> {
    
    let currentInput = initialPrompt;
    let previousOutput = '';
    const history: { agent: string; output: string }[] = [];

    try {
      for (const role of agentRoles) {
        const agent = agentManager.getAgent(role);
        
        console.log(`[TaskOrchestrator] Handing off to ${role}...`);
        
        const response = await agent.execute(
          workspaceId,
          projectId,
          currentInput, // We could pass the original prompt...
          previousOutput // ...and the previous agent's output as context
        );

        // Save history
        history.push({ agent: role, output: response.content });
        
        // Pass the output to the next agent in the chain
        previousOutput = response.content;
      }

      return {
        status: 'completed',
        finalOutput: previousOutput,
        history
      };

    } catch (error) {
      console.error("[TaskOrchestrator] Pipeline failed:", error);
      return {
        status: 'failed',
        finalOutput: previousOutput,
        history
      };
    }
  }
}
