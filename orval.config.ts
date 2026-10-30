import { defineConfig } from 'orval';

/**
 * Un contrat OpenAPI = une sortie Orval.
 * Chaque sortie produit, à partir du MÊME fichier YAML :
 *  - un service Angular injectable (HttpClient) par tag      → <tag>/<tag>.service.ts
 *  - les modèles TypeScript                                   → model/
 *  - les handlers MSW + factories de réponses (exemples OAS) → <tag>/<tag>.msw.ts
 *  - un token DI de base URL (override.angular.baseUrl)      → <api>-api.base-url.ts
 *
 * Le code généré n'est pas versionné : `npm run api:generate` est lancé en prestart/prebuild.
 */
const API_ROOT = './apps/selfcare-web/src/app/api';

const contract = (name: 'customer' | 'billing' | 'options' | 'cms') => ({
  input: { target: `./specs/${name}-api.yaml` },
  output: {
    mode: 'tags-split' as const,
    client: 'angular' as const,
    target: `${API_ROOT}/${name}/${name}-api.ts`,
    schemas: `${API_ROOT}/${name}/model`,
    clean: true,
    mock: {
      generators: [
        {
          type: 'msw' as const,
          // Les valeurs `example` du contrat alimentent les réponses par défaut
          useExamples: true,
          // La latence est pilotée par scénario (cf. src/mocks/scenarios), pas en dur
          delay: false as const,
        },
      ],
    },
    override: {
      angular: {
        retrievalClient: 'httpClient' as const,
        // Base URL injectable par API : indispensable en HYBRID (CMS ≠ API métier)
        baseUrl: { apiId: name },
      },
    },
  },
});

export default defineConfig({
  customer: contract('customer'),
  billing: contract('billing'),
  options: contract('options'),
  cms: contract('cms'),
});
