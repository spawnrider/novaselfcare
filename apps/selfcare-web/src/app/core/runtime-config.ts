import { InjectionToken } from '@angular/core';

export type Mode = 'mock' | 'real';

/**
 * Configuration lue à l'exécution (pas au build) :
 *  - côté serveur  : depuis process.env (runtime-config.server.ts)
 *  - côté navigateur : depuis GET /runtime-config.json servi par Express
 * Les URLs sont celles du runtime courant (serveur ou navigateur).
 */
export interface RuntimeConfig {
  apiMode: Mode;
  cmsMode: Mode;
  mswServer: boolean;
  mswBrowser: boolean;
  defaultScenario: string;
  /** '' = même origine (relatif) */
  businessApiUrl: string;
  cmsUrl: string;
  /** Côté serveur uniquement : URL publique, pour aligner le cache de transfert SSR → CSR */
  cmsPublicUrl?: string;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  apiMode: 'mock',
  cmsMode: 'mock',
  mswServer: true,
  mswBrowser: true,
  defaultScenario: 'nominal',
  businessApiUrl: '',
  cmsUrl: '',
};

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_RUNTIME_CONFIG,
});

export type ExecutionMode = 'MOCK_FULL' | 'HYBRID' | 'REAL';

export function executionMode(c: RuntimeConfig): ExecutionMode {
  if (c.apiMode === 'mock' && c.cmsMode === 'mock') return 'MOCK_FULL';
  if (c.apiMode === 'mock') return 'HYBRID';
  return 'REAL';
}
