import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { readRuntimeConfigFromEnv, toPublicRuntimeConfig } from './app/core/runtime-config.server';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/** Configuration d'exécution exposée au navigateur (mode, flags MSW, URLs publiques). */
app.get('/runtime-config.json', (_req, res) => {
  res.set('Cache-Control', 'no-store').json(toPublicRuntimeConfig(readRuntimeConfigFromEnv()));
});

app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));

/**
 * Rendu Angular. NB : MSW Node n'est PAS démarré ici mais dans app.config.server.ts
 * (provideAppInitializer), pour couvrir aussi le prerender exécuté au build.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Nova Selfcare SSR sur http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
