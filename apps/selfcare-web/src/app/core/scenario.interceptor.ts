import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RUNTIME_CONFIG } from './runtime-config';
import { SCENARIO_HEADER } from './scenario.model';
import { ScenarioService } from './scenario.service';

/**
 * Propage le scénario courant aux handlers MSW via un en-tête HTTP.
 * Avantage : le scénario est porté PAR REQUÊTE. Côté SSR, le serveur MSW Node est
 * global au process – un état global mélangerait les scénarios de visiteurs concurrents.
 *
 * L'en-tête n'est jamais envoyé vers un CMS réel (évite un preflight CORS inutile).
 */
export const scenarioInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(RUNTIME_CONFIG);
  if (config.apiMode !== 'mock') return next(req);
  if (config.cmsMode === 'real' && config.cmsUrl && req.url.startsWith(config.cmsUrl)) return next(req);

  const scenario = inject(ScenarioService).current();
  return next(req.clone({ setHeaders: { [SCENARIO_HEADER]: scenario } }));
};
