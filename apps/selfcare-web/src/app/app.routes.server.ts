import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Stratégie de rendu par route (le cœur de la démo hybride) :
 *  /        SSR       – première vue personnalisée (CMS + métier), MSW Node si mock
 *  /aide    Prerender – 100 % éditorial, généré au build (Strapi réel ou mock CMS)
 *  /billing CSR       – interactions (filtres, téléchargement), MSW Service Worker
 *  /options CSR       – parcours transactionnel, état mock local au navigateur
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'aide', renderMode: RenderMode.Prerender },
  { path: 'billing', renderMode: RenderMode.Client },
  { path: 'options', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
