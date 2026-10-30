import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { DEFAULT_RUNTIME_CONFIG, RUNTIME_CONFIG, RuntimeConfig } from './app/core/runtime-config';

async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const res = await fetch('/runtime-config.json', { cache: 'no-store' });
    if (res.ok) return { ...DEFAULT_RUNTIME_CONFIG, ...(await res.json()) };
  } catch {
    /* serveur absent : valeurs par défaut (MOCK_FULL) */
  }
  return DEFAULT_RUNTIME_CONFIG;
}

async function main() {
  const config = await loadRuntimeConfig();

  // Le Service Worker MSW doit être prêt AVANT le bootstrap, sinon les premiers appels CSR fuient.
  if (config.mswBrowser) {
    const { startMswWorker } = await import('./mocks/browser');
    await startMswWorker(config);
  }

  await bootstrapApplication(App, {
    ...appConfig,
    providers: [...appConfig.providers, { provide: RUNTIME_CONFIG, useValue: config }],
  });
}

main().catch((err) => console.error(err));
