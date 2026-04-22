import { useState } from 'react';
import { OrchestrationResult } from '@/core/aloha/orchestrationLayer';

export function useEcosystemActions() {
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationError, setOrchestrationError] = useState<string | null>(null);

  const processQuery = async (query: string, intent: string, locale: string, tenantContext?: string): Promise<OrchestrationResult | null> => {
    setIsOrchestrating(true);
    setOrchestrationError(null);
    try {
      const response = await fetch('/api/brain/v1/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, intent, locale, tenantContext })
      });
      
      if (!response.ok) {
        throw new Error('Failed to orchestrate query');
      }

      const data = await response.json();
      return data.result as OrchestrationResult;
    } catch (error) {
      console.error('[useEcosystemActions] Error:', error);
      setOrchestrationError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    } finally {
      setIsOrchestrating(false);
    }
  };

  return { processQuery, isOrchestrating, orchestrationError };
}
