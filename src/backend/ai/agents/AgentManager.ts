import { BaseAgent } from './BaseAgent';
import { MarketingStrategistAgent } from './MarketingStrategistAgent';
import { CopywriterAgent } from './CopywriterAgent';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerAgents();
  }

  private registerAgents() {
    this.agents.set('marketing_strategist', new MarketingStrategistAgent());
    this.agents.set('copywriter', new CopywriterAgent());
    // In the future: Designer, Video Creative Director, etc.
  }

  public getAgent(role: string): BaseAgent {
    const agent = this.agents.get(role);
    if (!agent) {
      throw new Error(`Agent with role ${role} not found.`);
    }
    return agent;
  }
}

export const agentManager = new AgentManager();
