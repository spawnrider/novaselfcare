# Selfcare Lab Angular MSW Orval (nova-selfcare)

Mini espace client Angular 21 en rendu hybride **SSR / CSR**, conçu pour démontrer l’intérêt d’une approche **contract-first** avec **Orval** et **MSW**.

L’objectif est de montrer comment développer, tester et prévisualiser un parcours self-care sans dépendre de la disponibilité des backends, tout en conservant des contrats API réalistes, typés et réutilisables.

## Pitch

> Un mini espace client Angular 21 en SSR/CSR qui démontre comment Orval et MSW permettent de développer un front contract-first, avec des APIs mockées de manière cohérente côté serveur et côté navigateur.

---

## Objectifs de la démo

Cette démo vise à illustrer plusieurs points clés :

* Générer un client Angular typé à partir de contrats OpenAPI avec Orval.
* Générer ou maintenir des handlers MSW alignés avec les contrats API.
* Bouchonner les APIs côté serveur pour le SSR.
* Bouchonner les APIs côté navigateur pour le CSR.
* Simuler des scénarios métier réalistes : succès, erreur, latence, données absentes.
* Développer un espace client sans dépendre d’un backend disponible.
* Prévisualiser des parcours client complets très tôt dans le cycle projet.
* Montrer l’intérêt d’une chaîne cohérente entre contrats API, client typé, mocks, tests et démonstrations métier.

---

## Concept fonctionnel

La démo représente un mini espace client nommé :

```text
Nova Selfcare
```

Le client peut :

* Consulter son tableau de bord personnalisé.
* Visualiser ses contrats, factures et consommations.
* Modifier une option ou simuler une action métier.
* Consulter du contenu éditorial provenant d’un CMS headless, par exemple Strapi.

---

## Architecture cible

La démo repose sur deux familles d’APIs :

1. Une API éditoriale CMS.
2. Une API business self-care.

---

## API éditoriale CMS

Cette API peut être fournie par Strapi, un autre CMS headless, ou être mockée via MSW.

Exemples d’endpoints :

```http
GET /api/pages/home
GET /api/banners
GET /api/help-articles
GET /api/faq
```

Utilisation principale :

```text
SSR / prerender
```

Objectif :

> Montrer qu’une page peut être générée côté serveur ou statiquement avec des données éditoriales, même si le CMS réel n’est pas disponible.

---

## API business self-care

Cette API représente les données client et les actions métier.

Exemples d’endpoints :

```http
GET /api/customer/me
GET /api/contracts
GET /api/invoices
GET /api/usage
GET /api/options
POST /api/options/{id}/subscribe
POST /api/support/cases
```

Utilisation principale :

```text
SSR pour la première vue personnalisée
CSR pour les interactions dynamiques
```

Objectif :

> Montrer qu’un parcours client complet peut être développé avec des données réalistes, des erreurs, de la latence et des variantes métier, sans backend réel.

---

## Chaîne contract-first

```text
OpenAPI
  ├── Orval → client Angular typé
  ├── Orval → modèles TypeScript
  └── Orval → handlers MSW

Angular SSR server
  └── MSW Node intercepte les appels backend

Browser
  └── MSW Service Worker intercepte les appels CSR

Strapi / CMS
  └── contenu éditorial réel ou mocké
```

Message clé :

> Le mock n’est pas écrit à la main dans chaque composant. Il est aligné avec le contrat API et partagé entre les usages SSR, CSR et tests.

---

# Pages de la démo

La démo tient volontairement sur deux ou trois pages afin de rester lisible en 15 minutes.

---

## Page 1 — Accueil self-care SSR

Route :

```text
/
```

Objectif :

> Démontrer le rendu serveur avec des données éditoriales et métier.

Contenu affiché :

```text
Bonjour Clara,
Votre contrat Électricité est actif.
Prochaine facture estimée : 84,20 €
Votre consommation est en hausse de 12 % ce mois-ci.
```

Données utilisées :

```text
CMS :
- titre
- bannière
- bloc d’aide
- wording marketing

Business API :
- client
- contrat
- prochaine facture
- consommation
```

Intérêt technique :

* La page arrive déjà rendue côté serveur.
* Les données CMS et business sont disponibles dès le premier chargement.
* MSW peut intercepter les appels côté serveur lorsque les APIs réelles ne sont pas disponibles.
* Le même contrat OpenAPI sert à générer le client Angular et les mocks.

Message clé :

> On peut travailler le rendu serveur et les pages statiques sans dépendre d’un environnement backend stable.

---

## Page 2 — Factures et consommation CSR

Route :

```text
/billing
```

Objectif :

> Démontrer les interactions dynamiques côté navigateur.

Contenu affiché :

```text
Liste des factures
Graphique simple de consommation
Bouton “Télécharger”
Filtre période : 3 mois / 6 mois / 12 mois
```

APIs utilisées :

```http
GET /api/invoices
GET /api/usage
```

Scénarios MSW possibles :

```text
nominal
empty-state
slow-network
server-error
late-payment
```

Exemples de pilotage des scénarios :

```text
?scenario=nominal
?scenario=empty
?scenario=slow
?scenario=error
```

Ou via le stockage navigateur :

```ts
localStorage.setItem('mswScenario', 'late-payment');
localStorage.setItem('mswScenario', 'no-invoice');
localStorage.setItem('mswScenario', 'server-error');
```

Intérêt technique :

* Les états UI peuvent être rejoués à volonté.
* Les erreurs et latences sont testables sans environnement spécifique.
* Le développement front n’est pas bloqué par la disponibilité du backend.
* Les comportements CSR restent cohérents avec les contrats OpenAPI.

Message clé :

> Les états UI ne sont plus théoriques. On peut les rejouer à volonté.

---

## Page 3 — Options et actions métier

Route :

```text
/options
```

Objectif :

> Démontrer un parcours transactionnel mocké.

Contenu affiché :

```text
Option “Facture électronique”
Option “Alerte consommation”
Option “Assistance premium”
Bouton Activer / Désactiver
```

APIs utilisées :

```http
GET /api/options
POST /api/options/{id}/subscribe
POST /api/support/cases
```

Scénarios MSW possibles :

```text
success
functional-error
technical-error
slow-network
forbidden
```

Exemples de cas simulés :

```text
Activation réussie d’une option
Option déjà active
Client non éligible
Erreur serveur
Délai réseau important
Droit insuffisant
```

Intérêt technique :

* Le parcours transactionnel peut être développé sans backend réel.
* Les cas d’erreur peuvent être testés tôt.
* Les retours métier sont simulables de manière contrôlée.
* Les composants Angular consomment un client généré et typé.

Message clé :

> Le front peut développer les parcours transactionnels avant que le backend soit finalisé, avec des contrats stables.

---

# Déroulé de démo 15 minutes

## 1. Pitch — 1 minute

Objectif :

> Présenter le problème adressé par la démo.

Message proposé :

```text
On veut développer un espace client Angular en contract-first, sans attendre que toutes les APIs soient disponibles, tout en gardant un comportement réaliste en SSR, CSR et tests.
```

Points à couvrir :

* Les backends ne sont pas toujours disponibles.
* Les contrats API peuvent être définis avant l’implémentation complète.
* Le front doit pouvoir avancer sur les parcours et les états UI.
* Le SSR rend le sujet plus exigeant, car il faut aussi mocker côté serveur.

---

## 2. Vue architecture — 2 minutes

Objectif :

> Montrer la chaîne contract-first de bout en bout.

À présenter :

```text
OpenAPI
  ├── Orval → client Angular typé
  ├── Orval → modèles TypeScript
  └── Orval → handlers MSW

Angular SSR server
  └── MSW Node intercepte les appels backend

Browser
  └── MSW Service Worker intercepte les appels CSR

Strapi / CMS
  └── contenu éditorial réel ou mocké
```

Message proposé :

```text
Le mock n’est pas écrit à la main dans tous les composants.
Il est aligné sur le contrat API et partagé entre SSR, CSR et tests.
```

---

## 3. Accueil SSR — 3 minutes

Objectif :

> Montrer une page rendue côté serveur avec des données client et éditoriales.

À démontrer :

* Ouverture de la page d’accueil.
* Présence de données client dès le premier rendu.
* Présence de données éditoriales issues du CMS ou du mock CMS.
* Possibilité de rendre la page même si le backend réel n’est pas disponible.

Message proposé :

```text
On peut travailler le rendu serveur et les pages statiques sans dépendre d’un environnement backend stable.
```

---

## 4. Factures et consommation CSR — 3 minutes

Objectif :

> Montrer des interactions dynamiques côté navigateur.

À démontrer :

* Changement de période de consommation.
* Chargement dynamique des factures.
* Simulation d’un état vide.
* Simulation d’une latence.
* Simulation d’une erreur serveur.

Scénarios possibles :

```text
nominal
empty-state
slow-network
server-error
```

Message proposé :

```text
Les états UI ne sont plus théoriques. On peut les rejouer à volonté.
```

---

## 5. Options et action métier — 3 minutes

Objectif :

> Montrer un parcours transactionnel sans backend réel.

À démontrer :

* Activation d’une option.
* Réponse de succès.
* Réponse d’erreur fonctionnelle.
* Réponse d’erreur technique.
* Simulation d’un client non éligible.

Message proposé :

```text
Le front peut développer les parcours transactionnels avant que le backend soit finalisé, avec des contrats stables.
```

---

## 6. Conclusion — 3 minutes

Objectif :

> Résumer la valeur de la démarche.

Bénéfices à rappeler :

* Approche contract-first.
* Client Angular typé généré.
* Mocks alignés avec les contrats API.
* Fonctionnement côté serveur et côté navigateur.
* Développement parallèle front/back.
* Tests plus réalistes.
* Démo métier possible très tôt.
* Moins de dépendance aux environnements d’intégration.

Phrase de conclusion :

```text
L’intérêt n’est pas seulement de bouchonner une API.
L’intérêt est d’avoir une chaîne cohérente entre le contrat, le client typé, les mocks, les tests et les scénarios de démonstration.
```

---

# Modes d’exécution

La démo peut être structurée autour de trois modes.

## MOCK_FULL

Toutes les APIs sont bouchonnées.

```text
CMS mocké
APIs business mockées
MSW serveur activé
MSW navigateur activé
```

Usage :

> Développement local complet sans dépendance externe.

---

## HYBRID

Le CMS est réel, les APIs business sont mockées.

```text
CMS réel, par exemple Strapi
APIs business mockées
MSW serveur activé
MSW navigateur activé
```

Usage :

> Prévisualisation réaliste avec contenu éditorial réel, mais sans backend métier finalisé.

---

## REAL

Toutes les APIs pointent vers les vrais backends.

```text
CMS réel
APIs business réelles
MSW désactivé
```

Usage :

> Intégration avec les environnements réels.

---

# Exemple de configuration

```env
API_MODE=mock
CMS_MODE=real
MSW_SERVER=true
MSW_BROWSER=true
```

Exemples de scénarios :

```env
MSW_SCENARIO=nominal
MSW_SCENARIO=empty-state
MSW_SCENARIO=slow-network
MSW_SCENARIO=server-error
MSW_SCENARIO=late-payment
```

---

# Structure technique proposée

```text
selfcare-lab-angular-msw-orval/
├── apps/
│   └── selfcare-web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── pages/
│       │   │   │   ├── home/
│       │   │   │   ├── billing/
│       │   │   │   └── options/
│       │   │   ├── core/
│       │   │   ├── shared/
│       │   │   └── api/
│       │   ├── mocks/
│       │   │   ├── browser.ts
│       │   │   ├── server.ts
│       │   │   ├── handlers.ts
│       │   │   └── scenarios/
│       │   └── server.ts
├── specs/
│   ├── customer-api.yaml
│   ├── billing-api.yaml
│   ├── options-api.yaml
│   └── cms-api.yaml
├── orval.config.ts
├── package.json
└── README.md
```

---

# Rôle des principaux répertoires

## `apps/selfcare-web/src/app/pages`

Contient les pages principales de la démo :

```text
home
billing
options
```

## `apps/selfcare-web/src/app/api`

Contient le client API généré par Orval.

Objectif :

> Centraliser les appels API typés et éviter l’écriture manuelle des clients HTTP.

## `apps/selfcare-web/src/mocks`

Contient la configuration MSW.

Exemples :

```text
browser.ts
server.ts
handlers.ts
scenarios/
```

Objectif :

> Fournir des handlers MSW utilisables à la fois côté navigateur et côté serveur.

## `specs`

Contient les contrats OpenAPI.

Exemples :

```text
customer-api.yaml
billing-api.yaml
options-api.yaml
cms-api.yaml
```

Objectif :

> Faire des contrats API la source de vérité de la démo.

---

# Scénarios de démonstration

## Scénario nominal

Le client a un contrat actif, des factures disponibles et une consommation normale.

```text
Client : Clara Martin
Contrat : Électricité
Statut : actif
Prochaine facture : 84,20 €
Consommation : +12 % ce mois-ci
```

## Scénario empty-state

Le client n’a pas encore de facture disponible.

```text
Aucune facture disponible pour le moment.
Votre première facture sera générée à la fin du mois.
```

## Scénario slow-network

Les APIs répondent avec une latence volontaire.

Objectif :

> Tester les loaders, skeletons et états intermédiaires.

## Scénario server-error

Une API retourne une erreur technique.

Objectif :

> Tester les messages d’erreur, les retry et les fallbacks.

## Scénario functional-error

Une action métier retourne une erreur fonctionnelle.

Exemple :

```text
Cette option n’est pas disponible pour votre contrat actuel.
```

## Scénario forbidden

Le client n’a pas les droits pour réaliser une action.

Exemple :

```text
Vous n’avez pas les droits nécessaires pour modifier cette option.
```

---

# Valeur démontrée

Cette démo permet de montrer que MSW et Orval ne servent pas uniquement à “faire des mocks”.

Ils permettent de structurer une chaîne complète :

```text
Contrat API
  → génération du client typé
  → génération ou alignement des mocks
  → développement front autonome
  → tests réalistes
  → démonstrations métier anticipées
  → intégration progressive avec les vrais backends
```

---

# Conclusion

Cette démo illustre une approche front moderne et robuste pour les projets Angular hybrides SSR/CSR.

Elle permet de développer un espace client en avance de phase, avec des données réalistes, des contrats stables et des scénarios métier contrôlables.

Le point clé n’est pas seulement de bouchonner des APIs, mais de mettre en place une chaîne cohérente entre :

* les contrats OpenAPI ;
* le client Angular généré ;
* les mocks MSW ;
* les scénarios de test ;
* les parcours métier ;
* les environnements réels.

```text
Contract-first.
Mock-first.
Backend-ready.
```