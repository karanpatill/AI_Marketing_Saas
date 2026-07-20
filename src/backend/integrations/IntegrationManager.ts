import { IIntegrationProvider } from './IIntegrationProvider';

/**
 * Universal Integration Manager
 * A factory that registers and retrieves all external integration providers.
 */
export class IntegrationManager {
  private providers: Map<string, IIntegrationProvider> = new Map();

  /**
   * Register a new integration adapter (e.g., LinkedInProvider, TwitterProvider).
   */
  public registerProvider(provider: IIntegrationProvider) {
    this.providers.set(provider.providerName, provider);
  }

  /**
   * Retrieve a specific provider by its name (e.g., 'linkedin').
   */
  public getProvider(providerName: string): IIntegrationProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Integration provider '${providerName}' is not registered.`);
    }
    return provider;
  }

  /**
   * Get all registered providers.
   */
  public getAllProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const integrationManager = new IntegrationManager();
