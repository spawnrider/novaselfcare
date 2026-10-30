# Revue critique — cahier de démo « Nova Selfcare »

## Synthèse

Le cahier est solide sur le message (contract-first, mocks partagés SSR/CSR/tests) et sur le découpage en 15 minutes. La revue relève **4 points bloquants pour le mode HYBRID / SSR**, **7 points importants** de cohérence fonctionnelle et quelques améliorations. Tous les points sont **traités dans le projet livré** (colonne « Statut »), sauf mention contraire.

Les quatre points bloquants :

1. Les endpoints CMS proposés ne sont pas ceux que Strapi expose réellement.
2. CMS et API métier partagent le préfixe `/api` : il faut une base URL par API.
3. Un scénario « global » (variable d'env., `localStorage`) ne fonctionne pas en SSR multi-visiteurs.
4. MSW démarré dans `server.ts` ne couvre pas le prerender exécuté au build.

| Légende | |
|---|---|
| 🔴 Bloquant | Empêche la démo de fonctionner dans le mode visé |
| 🟠 Important | Incohérence visible en démo ou dette rapide |
| 🔵 Amélioration | Renforce le propos |

---

## 1. Architecture et SSR

| # | Constat | Risque | Recommandation | Statut |
|---|---|---|---|---|
| 1.1 🔴 | `GET /api/pages/home`, `/api/faq` ne correspondent pas aux routes Strapi. Strapi 5 expose `/api/<pluralName>` (collection) ou `/api/<singularName>` (single type), avec une réponse aplatie `{ data, meta }` et un `documentId`. | En HYBRID, le client généré appelle des routes inexistantes ; le mock CMS ne ressemble pas au vrai CMS. | Aligner `cms-api.yaml` sur Strapi 5 : `/api/home-page` (single type), `/api/banners`, `/api/help-articles`, `/api/faqs`. | ✅ `specs/cms-api.yaml` + projet `cms/` |
| 1.2 🔴 | CMS (Strapi) et API métier sont toutes deux sous `/api`. | Un intercepteur « base URL » global ne sait pas à quel backend envoyer une requête. | Une base URL **par contrat**, injectée en DI (`override.angular.baseUrl` d'Orval). | ✅ `core/api-base-urls.ts` |
| 1.3 🔴 | Scénario piloté par `MSW_SCENARIO` ou `localStorage`. | Le serveur MSW Node est **un singleton par process** : en SSR, un état global mélange les visiteurs. `localStorage` est illisible côté serveur, ce qui produit un écart de rendu à l'hydratation. | Scénario porté **par requête** (en-tête `x-nova-scenario` posé par un intercepteur) ; cookie synchronisé pour le SSR ; env. = valeur par défaut seulement. | ✅ `core/scenario.*`, `mocks/scenarios` Vérifié en exécution : 8 requêtes SSR concurrentes (nominal / server-error) rendent chacune leur propre scénario, sans fuite. |
| 1.4 🔴 | « MSW Node intercepte les appels backend » dans `server.ts`. | Le prerender (build) n'exécute pas `server.ts` : les pages prérendues appellent des API non mockées. | Démarrer MSW Node via `provideAppInitializer` dans `app.config.server.ts`, en singleton (`globalThis`). | ✅ Vérifié : `/aide` est prérendue avec ses articles et sa FAQ. **Condition : `msw` ≤ 2.12.x** (voir §5). |
| 1.5 🟠 | Le cahier parle de prerender sans page dédiée ; l'accueil est personnalisé. | Prérendre l'accueil figerait les données d'un client. | Accueil en **SSR**, prerender réservé à une page 100 % éditoriale (`/aide`). | ✅ `app.routes.server.ts` Vérifié : le HTML de `/` contient le contenu personnalisé (prénom, contrat). Condition : `security.allowedHosts` dans `angular.json` (voir §5). |
| 1.6 🟠 | `/options` : état transactionnel mocké. | En SSR, l'état en mémoire Node diverge de celui du navigateur. | `/options` et `/billing` en **CSR** (`RenderMode.Client`). | ✅ |
| 1.7 🔵 | Hydratation non évoquée. | Double appel API au démarrage CSR ; en Docker, origines CMS différentes entre serveur et navigateur. | `HttpTransferCache` (par défaut) + `HTTP_TRANSFER_CACHE_ORIGIN_MAP` ; Service Worker démarré **avant** `bootstrapApplication`. | ✅ |

## 2. Contrats et cohérence fonctionnelle

| # | Constat | Recommandation | Statut |
|---|---|---|---|
| 2.1 🟠 | Bouton « Activer / Désactiver » mais seul `POST /subscribe` existe. | Ajouter `POST /api/options/{id}/unsubscribe`. | ✅ |
| 2.2 🟠 | L'accueil affiche « prochaine facture estimée » et « +12 % », sans endpoint correspondant. | `GET /api/billing/next-invoice`, `GET /api/usage/summary`. | ✅ |
| 2.3 🟠 | « Télécharger » sans endpoint. | `GET /api/invoices/{id}/document` (`application/pdf`). | ✅ (PDF de démo généré) |
| 2.4 🟠 | Modèle d'erreur non défini ; erreurs fonctionnelles et techniques indistinctes. | `Problem` (RFC 9457) + `code` métier stable (`OPTION_NOT_ELIGIBLE`, `OPTION_ALREADY_ACTIVE`, `FORBIDDEN`, `TECHNICAL_ERROR`), statuts 403 / 409 / 422 / 500 déclarés au contrat. | ✅ |
| 2.5 🟠 | Noms de scénarios incohérents : `empty-state` / `empty` / `no-invoice`, `server-error` / `error` / `technical-error`, `success` / `nominal`. | Liste canonique + alias acceptés. | ✅ `scenario.model.ts` |
| 2.6 🔵 | « Générer **ou maintenir** des handlers MSW » laisse la porte ouverte aux routes écrites à la main. | Règle : **aucune route à la main**. On utilise les `get<Op>MockHandler` générés et on ne fournit que la donnée et le comportement. Fixtures typées par les modèles générés (un écart avec le contrat casse la compilation). | ✅ `mocks/handlers.ts` (vérifié ; le typage de `params` a dû être corrigé : helper `idParam`) |
| 2.7 🔵 | Les données Faker aléatoires nuisent à la reproductibilité de la démo. | `useExamples: true` + fixtures déterministes. | ✅ Les handlers renvoient les fixtures ; Faker n'est plus utilisé que par les factories générées par Orval (dépendance à conserver). |

## 3. Déroulé de démo (15 min)

- **Timing serré** : 1 + 2 + 3 + 3 + 3 + 3 = 15 min, sans marge. Prévoir une conclusion compressible à 2 min.
- **`slow-network` sur l'accueil SSR** : le serveur attend 2,5 s avant d'envoyer le HTML, et l'écran reste blanc. À montrer sur `/billing` (CSR, skeletons visibles). Ou alors l'assumer comme démonstration de l'impact d'un backend lent sur le TTFB.
- **HYBRID** : démarrer Strapi *avant* la session (`npm run cms:up`, 1er lancement = création admin). Plan B : `start:mock`. La différence de contenu Strapi / mock est volontaire (« contenu Strapi » / « contenu mocké MSW ») pour rendre le basculement visible.
- **Effet « waouh » suggéré** : modifier une bannière dans l'admin Strapi, recharger l'accueil (SSR) et montrer le *page source* : le contenu est dans le HTML initial.
- **Preuve SSR / CSR** : le pied de page indique comment le document a été rendu, et `curl` sur `/` montre que les données sont dans le HTML.

## 4. Points d'attention hors démo

- **Fidélité des mocks au backend réel** : contract-first garantit l'alignement *front ↔ contrat*, pas *backend ↔ contrat*. Pour fermer la boucle côté backend, ajouter des tests de conformité (ex. Schemathesis, Dredd ou validation de réponses en CI). C'est la question la plus probable du public.
- **Mocks en production** : `mockServiceWorker.js` et `src/mocks` ne doivent pas partir en prod. L'import dynamique est conditionnel ; ✅ traité : `npm run build:release` (configuration `release` d'`angular.json`) remplace `mocks/browser.ts` et `mocks/server.ts` par des stubs (`*.release.ts`) et exclut `mockServiceWorker.js` des assets. Vérifié : aucun code MSW ni Service Worker dans `dist/`. La configuration `production` reste utilisable en mode mock (build de démo).
- **Authentification** : absente (le « client connecté » est implicite). Le scénario `forbidden` suppose une autorisation : à mentionner comme hors périmètre.
- **Données personnelles** : nom, e-mail et **courbes de consommation** sont des données personnelles au sens du RGPD. La démo n'utilise que des données **fictives**. Si un projet client réutilise ce socle avec des extraits de données réelles pour les mocks ou fixtures, il faut consulter le **Data Privacy Officer** au préalable.
- **Maturité des API** : Angular 21 (zoneless par défaut, `REQUEST`, `rxResource`) et `override.angular.baseUrl` d'Orval (fonctionnalité récente) sont à vérifier sur les versions installées. Le README indique l'alternative (intercepteur).

## 5. Vérifications réalisées

Le projet a été installé, généré (Orval) et vérifié après la préparation initiale. Cette passe a corrigé six défauts que les contrôles statiques n'avaient pas détectés :

- **Contrats YAML** : deux `example:` non quotés contenant une virgule (`options-api.yaml`, `cms-api.yaml`) faisaient échouer la validation Orval ; corrigés.
- **Handlers MSW** : `params.id` (type `string | readonly string[] | undefined`) ne compilait pas en mode strict ; corrigé via `idParam`.
- **Strapi (Docker)** : le dossier `public/uploads` n'existait pas dans l'image, le conteneur redémarrait en boucle ; `RUN mkdir -p public/uploads` ajouté au `cms/Dockerfile`.
- **SSR désactivé en pratique (bloquant)** : en production, Angular 21 refuse l'en-tête `Host: localhost:4000` (protection SSRF) et retombe en rendu client. `/` ne contenait alors aucune donnée dans le HTML, contrairement à ce que promet 1.5. Corrigé par `security.allowedHosts` (`localhost`, `127.0.0.1`) dans `angular.json` ; **à étendre avec le nom d'hôte réel de la cible de déploiement**.
- **Prerender de `/aide` vide (bloquant)** : avec `msw` ≥ 2.13, l'interception Node échoue pendant le prerender (`TypedEvent` de `rettime` incompatible avec le `Event` de domino installé par Angular). Les requêtes restaient sans réponse et la page était générée sans contenu. Corrigé en fixant `msw` à `~2.12.14` ; à réévaluer lors d'une montée de version (tester `/aide` après build).
- **Scripts npm** : `start:mock`, `start:hybrid` et `start:real` ne régénéraient pas le client Orval ; des `prestart:*` ont été ajoutés (et `prestart` retiré pour éviter une double génération avec `npm start`).

Contrôles effectués : génération Orval des 4 contrats, build mock puis serveur SSR (`curl` : `/` rendu côté serveur, scénarios par requête sous concurrence, `/aide` prérendue avec contenu), `ngc --noEmit` sans erreur, `npm run test:mocks` (11/11), `ng build --configuration release` (aucun code MSW dans le bundle, prerender de `/aide` réussi).

**Non vérifié** : `ng serve`, hydratation et Service Worker dans un navigateur (1.7), intégration avec un Strapi réel (contenu publié, permissions publiques), et `ng test`. Note : dans l'environnement de contrôle (sandbox), `ng build` s'interrompt (code 134) ; il passe hors sandbox, y compris sous Node 25.

À faire au premier lancement : `npm install && npm start` (génère le client, lance les mocks). En HYBRID : `npm run cms:up`, créer l'admin Strapi, publier le contenu et autoriser la lecture publique, puis `npm run start:hybrid`.
