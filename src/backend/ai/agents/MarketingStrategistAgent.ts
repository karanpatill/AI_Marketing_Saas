import { BaseAgent } from './BaseAgent';

export class MarketingStrategistAgent extends BaseAgent {
  protected readonly role = 'Marketing Strategist';
  protected readonly instructions = `
    You are an elite Marketing Strategist. 
    Your goal is to define high-level campaign objectives, target audiences, and messaging strategies.
    You do NOT write the final copy; you provide the strategic brief for the Copywriter and Designer.
  `;
}
