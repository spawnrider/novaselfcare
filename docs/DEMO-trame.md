# Démo « Nova Selfcare » — trame et actions (15 min)

Message à faire passer : **un seul contrat OpenAPI** génère le client Angular et les mocks, utilisés à l'identique en SSR, en CSR et en tests. *Contract-first. Mock-first. Backend-ready.*

## A. Préparation (J-1 puis 30 min avant)

| # | Action | Vérification |
|---|---|---|
| 1 | `npm install` | `public/mockServiceWorker.js` présent |
| 2 | Docker Desktop démarré, puis `docker compose up -d --build strapi` | `docker compose ps` : `healthy` |
| 3 | Ouvrir http://localhost:1337/admin, créer le compte admin (1er lancement seulement) | Connexion OK |
| 4 | `curl http://localhost:1337/api/home-page` | JSON avec `data` (contenu et droits publics créés automatiquement au démarrage de Strapi) |
| 5 | `npm run start:hybrid` | http://localhost:4200 affiche « contenu Strapi » |
| 6 | Plan B prêt dans un second terminal : `npm run start:mock` (port à libérer ou autre session) | « contenu mocké MSW » |
| 7 | Répétition complète, chrono en main | Fin ≤ 13 min (2 min de marge) |
| 8 | Onglets ouverts : accueil, `/billing`, `/options`, `/aide`, admin Strapi, `specs/billing-api.yaml`, `handlers.ts`, un terminal `curl` | |

Données : uniquement fictives (Clara Martin). Pas de données réelles dans les mocks.

## B. Déroulé (aligné sur `docs/brief.md`)

| Durée | Séquence | Ce que vous montrez | Ce que vous dites |
|---|---|---|---|
| 1 min | **1. Pitch** | Accueil `/` ouvert, sans rien d'autre | « Développer un espace client Angular en contract-first sans attendre les APIs, avec un comportement réaliste en SSR, CSR et tests. Les backends ne sont pas toujours disponibles ; le SSR est plus exigeant car il faut aussi mocker côté serveur. » |
| 2 min | **2. Architecture** | Schéma de la chaîne (OpenAPI → Orval → client / modèles / handlers ; MSW Node en SSR ; Service Worker en CSR ; Strapi réel ou mocké). Puis `specs/billing-api.yaml` et les dossiers `app/api/*` générés | « Le mock n'est pas écrit dans les composants : il est aligné sur le contrat et partagé entre SSR, CSR et tests. » |
| 3 min | **3. Accueil SSR** | `curl -s localhost:4200 \| grep Clara` (données dans le HTML), pied de page « rendu serveur », contenu éditorial. En HYBRID : modifier une bannière dans l'admin Strapi, recharger, page source. Option : `late-payment` (bandeau) | « On travaille le rendu serveur et les pages statiques sans dépendre d'un backend stable. » |
| 3 min | **4. Factures et conso (CSR)** | `/billing` : filtre 3 / 6 / 12 mois, téléchargement PDF. Scénarios : `empty-state`, `slow-network` (skeletons), `server-error` (message + réessayer) | « Les états UI ne sont plus théoriques : on les rejoue à volonté. » |
| 3 min | **5. Options (transactionnel)** | `/options` : activer « Facture électronique » (succès), réactiver (déjà active), `functional-error` (422 non éligible), `server-error`, `forbidden` ; ouverture d'un dossier support | « Le front développe les parcours transactionnels avant que le backend soit finalisé, avec des contrats stables. » |
| 3 min | **6. Conclusion** | Tableau des modes (MOCK_FULL / HYBRID / REAL) et liste des bénéfices du brief | « L'intérêt n'est pas seulement de bouchonner une API : c'est une chaîne cohérente entre contrat, client typé, mocks, tests et scénarios de démonstration. *Contract-first. Mock-first. Backend-ready.* » |

Total : 15 min, sans marge. **Compressible** : couper la partie Strapi de l'étape 3 (1 min) et l'étape 6 à 2 min.

## C. Points de vigilance pendant la démo

- **`slow-network` : à montrer sur `/billing` (CSR)**, pas sur l'accueil. Sur l'accueil SSR, le serveur attend 2,5 s et l'écran reste blanc (utile uniquement pour illustrer l'impact d'un backend lent sur le TTFB).
- Changer de scénario recharge les données : passer par la barre MSW ou `?scenario=…`.
- Si Strapi ne répond pas : basculer sur `start:mock` (même démo, contenu « mocké MSW »).
- `/aide` est prérendue : une modification Strapi n'y apparaît qu'après un nouveau build. La montrer sur l'accueil (SSR).
- Questions probables : (1) fidélité des mocks au backend réel → tests de conformité (Schemathesis, Dredd), non inclus ; (2) mocks en production → `npm run build:release` les exclut ; (3) authentification → hors périmètre.

## D. Après la démo

- Partager le dépôt ; rappeler que `src/mocks` et `mockServiceWorker.js` sont exclus par `build:release`.
- Si un projet réutilise ce socle avec des extraits de données réelles (nom, e-mail, consommation) : consulter le **Data Privacy Officer** avant.
- Relire le rapport (`docs/REVUE-cahier-de-demo.md`) avant tout partage externe.

## E. Dépannage rapide

| Symptôme | Cause probable | Action |
|---|---|---|
| Erreurs « Could not resolve ../api/… » | Client Orval non généré | `npm run api:generate` |
| `localhost:1337` ne répond pas | Docker arrêté ou image périmée | `docker compose up -d --build strapi`, `docker compose logs strapi` |
| Accueil sans données dans le HTML | `allowedHosts` ne contient pas l'hôte | `angular.json` → `build.options.security.allowedHosts` |
| `/aide` vide après build | `msw` ≥ 2.13 | Garder `msw ~2.12` |
