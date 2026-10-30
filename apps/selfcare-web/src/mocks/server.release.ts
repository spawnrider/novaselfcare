import type { RuntimeConfig } from '../app/core/runtime-config';

/** Remplace `server.ts` dans la configuration `release` : aucun code MSW ni handler dans le bundle serveur. */
export function startMswServer(_config: RuntimeConfig): never {
  throw new Error('MSW est désactivé dans le build release.');
}
