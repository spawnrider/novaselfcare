import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { ApplicationConfig, inject, mergeApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { RUNTIME_CONFIG, RuntimeConfig } from './core/runtime-config';
import { readRuntimeConfigFromEnv } from './core/runtime-config.server';

/** Si le SSR et le navigateur n'appellent pas le CMS via la même origine (ex. Docker). */
function originMap(c: RuntimeConfig): Record<string, string> {
  if (c.cmsMode !== 'real' || !c.cmsUrl || !c.cmsPublicUrl) return {};
  const server = new URL(c.cmsUrl).origin;
  const browser = new URL(c.cmsPublicUrl).origin;
  return server === browser ? {} : { [server]: browser };
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: RUNTIME_CONFIG, useFactory: () => readRuntimeConfigFromEnv() },
    { provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP, useFactory: () => originMap(inject(RUNTIME_CONFIG)) },
    // MSW Node démarré avant le premier rendu (SSR à la requête ET prerender au build)
    provideAppInitializer(async () => {
      const config = inject(RUNTIME_CONFIG);
      if (!config.mswServer) return;
      const { startMswServer } = await import('../mocks/server');
      startMswServer(config);
    }),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
