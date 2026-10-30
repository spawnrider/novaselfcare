import type { RuntimeConfig } from '../app/core/runtime-config';

/** Remplace `browser.ts` dans la configuration `release` : aucun code MSW ni handler dans le bundle. */
export async function startMswWorker(_config: RuntimeConfig): Promise<never> {
  throw new Error('MSW est désactivé dans le build release.');
}
