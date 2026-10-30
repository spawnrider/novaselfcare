# Démo « Nova Selfcare » — déroulé détaillé minute par minute

Complément de [`DEMO-trame.md`](DEMO-trame.md) (préparation, vigilance, dépannage) : ici, **quoi montrer, où cliquer, quoi dire, ce qu'on doit voir à l'écran**.

**Mode de démo : HYBRID** (Strapi réel + API métier mockées par MSW). Durée : 15 min (13 min de contenu + 2 min de marge).

> **Message à retenir** : un seul contrat OpenAPI génère le client Angular **et** les mocks, utilisés à l'identique en SSR, en CSR et en tests. *Contract-first. Mock-first. Backend-ready.*

## Avant de commencer (écran prêt)

Terminal 1 : `docker compose ps` → `strapi` en `healthy`. Terminal 2 : `npm run start:hybrid` (http://localhost:4200). Terminal 3 : libre pour les `curl`.

Onglets navigateur, dans cet ordre :

1. `http://localhost:4200/` (accueil)
2. `http://localhost:4200/billing`
3. `http://localhost:4200/options`
4. `http://localhost:4200/aide`
5. `http://localhost:1337/admin` (déjà connecté)

Onglets éditeur : `specs/billing-api.yaml`, `apps/selfcare-web/src/mocks/handlers.ts`, `orval.config.ts`.

Vérifier sur l'accueil, juste après un chargement complet de la page : badge de mode **HYBRID** en haut à droite, barre MSW présente avec le scénario **Nominal**, texte « (contenu Strapi) » sous le titre, pied de page « Document rendu côté serveur (SSR/prerender) … · API métier : mock · CMS : real ». Si le pied de page indique « navigation client », vous avez navigué par le menu : rechargez la page.

---

## Séquence 1 — Pitch (0:00 → 1:00)

**Écran** : accueil `/`, rien d'autre. Ne pas toucher à la barre MSW.

**À dire**
- « Nova Selfcare est un mini espace client : tableau de bord, factures, options, aide. »
- « Le sujet n'est pas l'écran, c'est la manière de le construire : développer le front **sans attendre les backends**, avec un comportement réaliste en SSR, en CSR et en tests. »
- « Le SSR rend le sujet plus dur : si le serveur Angular appelle des APIs, il faut aussi les mocker **côté serveur**, pas seulement dans le navigateur. »

**À montrer** : pointer le titre, la carte contrat, la facture estimée, la tendance de consommation (+12 %), puis le pied de page.

---

## Séquence 2 — Architecture et contrat (1:00 → 3:00)

**Écran** : schéma de la chaîne (celui du [README](../README.md#chaîne-contract-first)), puis l'éditeur.

**Gestes**
1. Afficher le schéma : `specs/*.yaml → Orval → client / modèles / handlers MSW`.
2. Ouvrir `specs/billing-api.yaml` : montrer une opération (`listInvoices`) avec son `operationId`, son tag et un exemple de réponse.
3. Ouvrir `orval.config.ts` : montrer que les mêmes contrats produisent les services Angular et les fichiers `*.msw.ts`.
4. Ouvrir `apps/selfcare-web/src/app/api/billing/` : `billing/billing.service.ts`, `billing/billing.msw.ts`, `model/`. Préciser que ce code est **généré, non versionné** (`npm run api:generate` au `prestart`).
5. Ouvrir `apps/selfcare-web/src/mocks/handlers.ts` : montrer `getListInvoicesMockHandler(...)` et l'override `if (s === 'server-error') throw technicalError()`.

**À dire**
- « Je n'écris aucune route de mock à la main. Les handlers viennent du contrat ; je ne fournis que la **donnée** et le **comportement** (latence, erreurs). »
- « Les mêmes handlers servent trois fois : MSW Node pour le SSR, Service Worker pour le CSR, Vitest pour les tests. »
- « Si le contrat change, la compilation casse : c'est voulu, le mock ne peut pas dériver du contrat. »

**Message clé** : le mock est aligné sur le contrat, pas écrit dans les composants.

---

## Séquence 3 — Accueil en SSR + contenu Strapi (3:00 → 6:00)

**Écran** : onglet accueil, puis terminal 3.

**Gestes**
1. Dans le terminal 3 : `curl -s localhost:4200 | grep -o 'Clara[^<]*'` → le prénom est **dans le HTML renvoyé par le serveur**. Ajouter `| grep -o 'contenu Strapi'` pour le CMS.
2. Retour navigateur : **recharger `/` en entier (Cmd+R)** ou ouvrir l'URL dans un nouvel onglet, sans passer par le menu. Pied de page : « Document rendu côté **serveur (SSR/prerender)** ». Le pied de page ne parle que du document initial : après un clic dans le menu, même vers `/`, il affiche « Page rendue côté navigateur (navigation client) ».
3. **Strapi** (optionnel, coupable) : onglet `:1337/admin` → Content Manager → *Home page* → modifier `marketingText` (ajouter « — démo ») → Save + **Publish**. Recharger l'accueil : le texte change. Afficher la source de la page (Cmd+Opt+U) pour confirmer que c'est rendu serveur.
4. Barre MSW → scénario **Retard de paiement** : le bandeau « Paiement en attente » apparaît, avec le lien « Voir mes factures ». Revenir en **Nominal**.

**À dire**
- « Ce que vous voyez au premier octet vient du serveur : contrat, client, facture estimée, tendance. C'est MSW Node qui répond aux appels métier, **sans backend**. »
- « Le contenu éditorial, lui, vient du vrai Strapi. Les deux mondes cohabitent : c'est le mode HYBRID. »
- « Le contenu mocké dit "(contenu mocké MSW)", celui de Strapi dit "(contenu Strapi)" : on voit tout de suite quelle source est active. »

**Rendre l'hybride visible : qui fournit quoi sur l'accueil**

| Zone | Source en HYBRID |
|---|---|
| Accroche « … (contenu Strapi) », bannières, carte « Centre d'aide » | **Strapi réel** |
| « Bonjour Clara », contrat, facture estimée, consommation, bandeau de retard | **MSW** |

Trois preuves, à enchaîner :
1. **Scénario** : barre MSW → *Retard de paiement* ou *Erreur serveur*. Seuls les blocs métier changent ; accroche, bannières et aide restent identiques (le CMS ne dépend pas du scénario).
2. **Édition Strapi** : modifier l'accroche de la *Home page* dans l'admin, **Publish**, recharger `/`. Seule l'accroche change.
3. **Coupure du CMS** : `docker compose stop strapi`, recharger `/`. Accroche, bannières et aide disparaissent (« Contenu éditorial indisponible (CMS injoignable) »), mais Clara, le contrat et la facture restent. Puis `docker compose start strapi`.

Ligne de commande : `curl -s localhost:1337/api/home-page` (« contenu Strapi ») face à `curl -s localhost:4200 | grep -o 'Clara'` (mock). Le terminal du serveur affiche `[MSW] serveur Node actif – API métier: mock, CMS: real`.

**Si Strapi est en panne** : ne pas insister. Relancer `npm run start:mock` et dire « même parcours, contenu mocké ».

---

## Séquence 4 — Factures et consommation en CSR (6:00 → 9:00)

**Écran** : onglet `/billing`. La navigation depuis l'accueil se fait côté navigateur : le pied de page indique « Page rendue côté **navigateur** (navigation client) ».

**Gestes**
1. Cliquer sur **3 / 6 / 12 mois** : le graphique de consommation se recharge à chaque période.
2. Dans le tableau, cliquer **Télécharger** sur `INV-2026-09` : un PDF est téléchargé (handler `downloadInvoice`).
3. Barre MSW → **Aucune facture** : message « Aucune facture disponible pour le moment » et état vide du graphique. Recharger si besoin.
4. Barre MSW → **Réseau lent** : changer de période, montrer les **skeletons** pendant 2,5 s.
5. Barre MSW → **Erreur serveur** : bandeau d'erreur avec code `TECHNICAL_ERROR` et bouton **Réessayer**. Repasser en **Nominal**, cliquer **Réessayer** : les données reviennent.

**À dire**
- « Les états vides, de chargement et d'erreur sont habituellement les derniers testés, souvent en recette. Ici je les rejoue en un clic, dès le premier sprint. »
- « L'erreur suit le format `application/problem+json` défini dans le contrat : le front n'a pas à deviner. »
- « Côté navigateur, c'est le Service Worker MSW qui intercepte. Regardez la console : une ligne `[MSW] GET /api/invoices (200 OK)` par appel. Dans l'onglet Network, la colonne Size indique (ServiceWorker). »
- **Avant la démo** : ouvrir DevTools (F12) sur `/billing`, cocher *Disable cache*, activer la colonne **Size** (clic droit sur l'en-tête) et filtrer la console sur « MSW ». Ces appels ne sont visibles que sur `/billing` et `/options` ; sur `/` (SSR), c'est MSW Node qui répond côté serveur.

**À éviter** : montrer **Réseau lent** sur l'accueil. Le serveur attend 2,5 s et l'écran reste blanc (voir la trame, § C).

---

## Séquence 5 — Options et parcours transactionnel (9:00 → 12:00)

**Écran** : onglet `/options`. Trois options : Facture électronique (inactive), Alerte consommation (active), Assistance premium (inactive, 3,99 € / mois).

**Gestes**
1. **Succès** — scénario **Nominal** : cliquer **Activer** sur *Facture électronique*. Le bouton passe à « Traitement… », puis le badge devient **Active** et le bouton devient **Désactiver**.
2. **Désactivation** : cliquer **Désactiver** sur *Alerte consommation* → badge **Inactive**.
3. **Client non éligible** : scénario **Client non éligible**, cliquer **Activer** sur *Assistance premium* → message « Option non disponible » + code `OPTION_NOT_ELIGIBLE` (HTTP 422).
4. **Support** : dans ce message, cliquer **Contacter le support** → « Demande **CASE-31337** enregistrée. Un conseiller vous recontacte. »
5. **Erreur serveur** : scénario **Erreur serveur**, cliquer **Activer** → erreur technique, avec lien vers le support.
6. **Droits insuffisants** : scénario **Droits insuffisants** → « Droits insuffisants » (HTTP 403).

**À dire**
- « Le front développe le parcours transactionnel complet (succès, refus métier, erreur technique, droits) alors que **l'API d'écriture n'existe pas encore**. »
- « 422, 403 et 500 ne sont pas bricolés dans le composant : ils sont décrits dans le contrat et servis par le handler selon le scénario. »
- « L'état est gardé en mémoire : je peux activer, puis désactiver, et voir la liste suivre. Il est réinitialisé au rechargement. »

**Note** : le cas « option déjà active » (HTTP 409 `OPTION_ALREADY_ACTIVE`) existe dans le handler mais l'interface ne le déclenche pas (le bouton d'une option active est « Désactiver »). Ne pas le promettre ; si on vous le demande, le montrer par `curl` ou dans `handlers.ts`.

---

## Séquence 6 — Conclusion (12:00 → 15:00)

**Écran** : tableau des modes du [README](../README.md#modes-dexécution), puis onglet `/aide`.

**Gestes**
1. Afficher le tableau **MOCK_FULL / HYBRID / REAL** : même code, trois configurations, lues **à l'exécution** (`process.env` côté serveur, `/runtime-config.json` côté navigateur).
2. Montrer `/aide` : page **prérendue** au build à partir du CMS.
3. Lister les bénéfices : front autonome, contrat stable, états UI rejouables, tests contre les mêmes handlers, démos métier précoces.
4. Mentionner `npm run build:release` : build sans MSW ni `mockServiceWorker.js`.

**À dire**
- « L'intérêt n'est pas de bouchonner une API. C'est une chaîne cohérente entre contrat, client typé, mocks, tests et scénarios de démonstration. »
- « Quand le backend arrive, on passe en REAL sans toucher au code des écrans. »
- Clôture : « **Contract-first. Mock-first. Backend-ready.** »

**Points à ne pas affirmer** : que les mocks reproduisent fidèlement le backend (il faudrait des tests de conformité du type Schemathesis ou Dredd, non inclus), ni que l'authentification est couverte (hors périmètre).

---

## Version courte (10 min)

Couper la modification dans l'admin Strapi (séquence 3, étape 3), les scénarios **Réseau lent** et **Droits insuffisants**, et ramener la conclusion à 1 min.

## Après la démo

- Les données sont fictives (Clara Martin). Si un projet réutilise ce socle avec des extraits de données réelles, consulter le **Data Privacy Officer** avant.
- Relire ce déroulé avant tout partage externe : il s'agit d'un support interne de présentation.
