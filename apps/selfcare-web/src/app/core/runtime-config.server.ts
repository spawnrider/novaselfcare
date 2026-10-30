import { DEFAULT_RUNTIME_CONFIG, Mode, RuntimeConfig } from './runtime-config';

const mode = (v: string | undefined, fallback: Mode): Mode =>
  v === 'real' ? 'real' : v === 'mock' ? 'mock' : fallback;
const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === '' ? fallback : v === 'true' || v === '1';

/** Configuration vue par le serveur SSR (et par le prerender au build). */
export function readRuntimeConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const apiMode = mode(env['API_MODE'], DEFAULT_RUNTIME_CONFIG.apiMode);
  const cmsMode = mode(env['CMS_MODE'], DEFAULT_RUNTIME_CONFIG.cmsMode);
  const anyMock = apiMode === 'mock' || cmsMode === 'mock';
  const cmsUrl = env['CMS_URL'] ?? (cmsMode === 'real' ? 'http://localhost:1337' : '');
  return {
    apiMode,
    cmsMode,
    mswServer: anyMock && bool(env['MSW_SERVER'], true),
    mswBrowser: anyMock && bool(env['MSW_BROWSER'], true),
    defaultScenario: env['MSW_SCENARIO'] ?? 'nominal',
    businessApiUrl: env['BUSINESS_API_URL'] ?? '',
    cmsUrl,
    cmsPublicUrl: env['CMS_PUBLIC_URL'] || cmsUrl,
  };
}

/** Sous-ensemble exposé au navigateur via /runtime-config.json (aucun secret ici). */
export function toPublicRuntimeConfig(c: RuntimeConfig, env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return {
    apiMode: c.apiMode,
    cmsMode: c.cmsMode,
    mswServer: c.mswServer,
    mswBrowser: c.mswBrowser,
    defaultScenario: c.defaultScenario,
    businessApiUrl: env['BUSINESS_API_PUBLIC_URL'] || c.businessApiUrl,
    cmsUrl: c.cmsPublicUrl ?? c.cmsUrl,
  };
}
