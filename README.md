# Nova Selfcare — Angular 21 · SSR/CSR · Orval · MSW · Strapi

Mini espace client qui démontre une chaîne **contract-first** de bout en bout :
un seul contrat OpenAPI génère le client Angular typé **et** les handlers MSW, utilisés
à l'identique en **SSR** (MSW Node), en **CSR** (MSW Service Worker) et en **tests** (Vitest).

> Contract-first. Mock-first. Backend-ready.

## Démarrage rapide

```bash
npm install                 # installe aussi public/mockServiceWorker.js (postinstall msw init)
npm run start:mock          # MOCK_FULL – tout est mocké      → http://localhost:4200
```

Mode **HYBRID** (cible de la démo) — CMS Strapi réel, API métier mockées :

```bash
npm run cms:up              # Strapi 5 sur http://localhost:1337 (1er lancement : créer l'admin)
npm run start:hybrid        # → http://localhost:4200
```

Production SSR locale :

```bash
API_MODE=mock CMS_MODE=real npm run build    # le prerender de /aide lit Strapi au build
API_MODE=mock CMS_MODE=real node dist/selfcare-web/server/server.mjs   # → :4000
```

## Modes d'exécution

| Mode       | `API_MODE` | `CMS_MODE` | MSW Node | MSW navigateur | Usage |
|------------|-----------|-----------|----------|----------------|-------|
| MOCK_FULL  | mock      | mock      | ✔        | ✔              | Dév local sans aucune dépendance |
| HYBRID     | mock      | real      | ✔ (métier) | ✔ (métier)   | Contenu éditorial réel + parcours métier mockés |
| REAL       | real      | real      | ✖        | ✖              | Intégration |

Variables : voir `.env.example`. La configuration est lue **à l'exécution** (pas au build) :
`process.env` côté serveur, `GET /runtime-config.json` côté navigateur.

## Rendu par route (`app.routes.server.ts`)

| Route      | Rendu      | Données | Mock actif |
|------------|-----------|---------|------------|
| `/`        | SSR       | CMS + client, contrat, prochaine facture, tendance conso | MSW Node |
| `/aide`    | Prerender | CMS (articles, FAQ) | MSW Node au build (MOCK_FULL) |
| `/billing` | CSR       | factures, consommation (filtre 3/6/12 mois), PDF | MSW Service Worker |
| `/options` | CSR       | options, activation/désactivation, support | MSW Service Worker |

Le pied de page indique si le document a été rendu côté serveur ou navigateur.

## Scénarios

Pilotage par barre MSW (en haut de page), `?scenario=…`, `localStorage.setItem('mswScenario', …)`
ou `MSW_SCENARIO`. Le scénario est transmis **par requête** via l'en-tête `x-nova-scenario`
(intercepteur Angular) : indispensable en SSR, où le serveur MSW Node est partagé par tous les visiteurs.

| Scénario | Alias | Effet |
|----------|-------|-------|
| `nominal` | `success` | Clara Martin, contrat actif, 84,20 €, +12 % |
| `empty-state` | `empty`, `no-invoice` | Aucune facture / conso |
| `slow-network` | `slow` | +2,5 s sur chaque appel métier (skeletons) |
| `server-error` | `error`, `technical-error` | 500 `application/problem+json` sur billing et actions |
| `late-payment` | | Dernière facture `overdue` + bandeau d'alerte |
| `functional-error` | | 422 `OPTION_NOT_ELIGIBLE` à l'activation |
| `forbidden` | | 403 sur activation/désactivation |

## Chaîne contract-first

```
specs/*.yaml ──orval──► app/api/<api>/<tag>/<tag>.service.ts   client Angular (HttpClient)
                    ├─► app/api/<api>/model/                    modèles TS
                    ├─► app/api/<api>/<tag>/<tag>.msw.ts        handlers MSW (exemples OAS)
                    └─► app/api/<api>/<api>-api.base-url.ts     token DI de base URL
mocks/handlers.ts  = handlers générés + fixtures typées + comportements de scénario
mocks/server.ts    → setupServer  (SSR + prerender, démarré via provideAppInitializer)
mocks/browser.ts   → setupWorker  (CSR, démarré avant bootstrapApplication)
mocks/*.test.ts    → setupServer  (tests contrat ↔ mocks)
```

Le code généré n'est pas versionné ; `npm run api:generate` s'exécute en `prestart:*` / `prebuild` / `prebuild:release` / `pretest`.

## Scripts

| Script | Rôle |
|--------|------|
| `api:generate` | Orval : client, modèles, handlers MSW |
| `api:lint` | Lint des contrats (Redocly) |
| `start:mock` / `start:hybrid` / `start:real` | Dev server SSR dans chaque mode |
| `build:release` | Build sans MSW ni `mockServiceWorker.js` (remplacements de fichiers) |
| `test` | Tests unitaires Angular (Vitest) |
| `test:mocks` | Tests des handlers MSW en Node |
| `cms:up` / `cms:down` | Strapi via Docker Compose |

## Points d'attention

- **Prérequis** : Node 22+, Docker (pour HYBRID). Versions ciblées : Angular 21, Orval ≥ 8.9, MSW 2, Strapi 5.
- `override.angular.baseUrl` (tokens DI par API) est une fonctionnalité récente d'Orval :
  si votre version ne la propose pas, remplacez `core/api-base-urls.ts` par un intercepteur.
- Les noms générés (`CustomerService`, `getListInvoicesMockHandler`…) dérivent des **tags** et
  **operationId** des contrats : les renommer casse la compilation — c'est voulu.
- Le contenu du CMS Strapi diffère volontairement du mock (« contenu Strapi » vs « contenu mocké MSW »)
  pour rendre visible le basculement MOCK_FULL → HYBRID en démo.
- Secrets Strapi de démonstration uniquement (`cms/config/admin.js`) — ne pas réutiliser.
- En production réelle, exclure `src/mocks` du bundle (import dynamique déjà conditionné ; prévoir
  un `fileReplacements` ou un build flag pour garantir l'absence de MSW).

> **Déploiement SSR** : ajouter le nom d'hôte public dans `angular.json` → `build.options.security.allowedHosts` (sinon Angular retombe en rendu client). `msw` est volontairement limité à `~2.12` : à partir de 2.13, le prerender de `/aide` échoue.
