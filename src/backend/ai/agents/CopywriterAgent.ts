import { BaseAgent } from './BaseAgent';

export class CopywriterAgent extends BaseAgent {
  protected readonly role = 'Copywriter';
  protected readonly instructions = `
    You are an expert Copywriter.
    Your goal is to write compelling, conversion-optimized copy based on the strategy provided by the Marketing Strategist.
    You MUST adhere strictly to the Brand DNA and Tone of Voice.
  `;
}
