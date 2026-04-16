# Warignan API (backend)

API REST pour la boutique Warignan — environ **70 %** des fonctionnalités prévues.

> **Note :** le dossier `src/modules/` (NestJS / TypeORM) est un ancien squelette **non utilisé** par cette API. Seuls les fichiers listés dans `tsconfig.json` sont compilés (Express + Prisma). Tu peux supprimer `src/modules/`, `src/server.ts`, `src/main.ts`, etc. quand tu veux nettoyer le repo.

---

## À faire (collaborateur) — lire en priorité

Cette section est **dupliquée à la racine** dans `../README.md` pour que toute l’équipe la voie. Détail et pistes : `docs/EXERCICE_JUNIOR_BACKEND.md`.

### 1. Livraisons

- Aujourd’hui : `GET /api/deliveries` répond **501** (non implémenté).
- Le modèle Prisma **`Delivery`** existe et est seedé, mais **aucune vraie API** complète.
- **À faire :** liste + filtres (statut, date), `PATCH` pour `courierId` / `status`, routes protégées (**vendeuse** / **admin**, éventuellement **livreur** « mes livraisons »).

### 2. Réservations

- Aujourd’hui : **`GET /api/reservations`** seulement.
- **À faire :** `PATCH /api/reservations/:id` pour `workflow` et/ou `depositStatus`, avec **règles métier** sur les transitions (ex. pas de passage incohérent `cancelled` → `validated`).

### 3. Webhooks paiement (Wave / Orange Money)

- Les routes enregistrent un JSON simplifié **sans vérifier la signature**.
- **À faire :** lire la doc du fournisseur, valider la signature avec `WAVE_WEBHOOK_SECRET` / `ORANGE_MONEY_WEBHOOK_SECRET`, refuser en prod si invalide ; éventuellement **body brut** (`express.raw`) si exigé.

### 4. Pagination et perf

- Listes (produits, commandes, etc.) sans **`page` / `limit`** (ni curseur).
- **À faire :** pagination + éventuellement `select` Prisma pour alléger les réponses.

### 5. Médias

- Upload **disque local** uniquement.
- **À faire :** suppression du fichier si suppression en base, resize (ex. **sharp**), stockage **S3** / Cloudinary, etc.

### 6. Qualité / prod

- **Tests** automatisés (auth, `trackingService`, …).
- **Env** strict en prod (`JWT_SECRET` fort, secrets webhooks obligatoires).
- **PostgreSQL** au lieu de SQLite pour la prod.

### Critères de validation suggérés

- [ ] Au moins une route **livraisons** utile + **auth**.
- [ ] Au moins une **transition** de réservation gérée côté API.
- [ ] Une **tentative de vérif webhook** documentée (même en mock).
- [ ] **README** (racine et/ou ce fichier) mis à jour avec ce qui a été ajouté.

---

## Git : pousser le site sur le dépôt

À lancer depuis la **racine du monorepo** (`warignan-shop/`), pas depuis `backend/` seul si le repo contient frontend + backend.

```bash
cd ..   # si tu es dans backend/
git status
git add .
git commit -m "docs: roadmap backend + instructions Git dans README"
git push -u origin main
```

Configurer le remote si besoin : `git remote add origin <URL_DU_REPO>`.  
Ne pas committer `.env`, `dev.db`, ni les fichiers dans `uploads/` (voir `.gitignore`).

---

## Prérequis

- Node.js 20+
- npm

## Installation

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- API : <http://localhost:3000>
- Santé : <http://localhost:3000/api/health>

## Variables `.env`

Voir `.env.example`. Pour le frontend en local : `CORS_ORIGIN=http://localhost:5173`.

## Endpoints principaux

| Méthode | Route | Auth | Description |
|--------|--------|------|-------------|
| GET | `/api/health` | Non | Santé |
| POST | `/api/auth/register` | Non | Inscription client |
| POST | `/api/auth/login` | Non | Connexion |
| GET | `/api/auth/me` | Oui | Profil |
| GET | `/api/products` | Non | Catalogue (`category`, `maxPrice`, `sortBy`, `q`) |
| GET | `/api/products/:id` | Non | Détail |
| POST | `/api/products` | Vendeuse/admin | Créer |
| PATCH | `/api/products/:id` | Vendeuse/admin | Modifier |
| GET | `/api/promotions/active` | Non | Codes promo actifs (public) |
| POST | `/api/promotions/quote` | Non | Simulation/remise (public) |
| GET | `/api/orders` | Vendeuse/admin | Commandes |
| POST | `/api/orders/checkout` | Non | Checkout commande (accepte `subtotalFcfa` + `promoCode?`) |
| PATCH | `/api/orders/:id/step` | Vendeuse/admin | Étape commande |
| GET | `/api/reservations` | Vendeuse/admin | Réservations |
| POST | `/api/reservations/checkout` | Non | Checkout réservation (accepte `subtotalFcfa` + `promoCode?`) |
| GET | `/api/tracking/:reference` | Non | Suivi unifié |
| POST | `/api/webhooks/wave` | Non | Webhook (signature : TODO) |
| POST | `/api/webhooks/orange-money` | Non | Idem |
| POST | `/api/payments` | Vendeuse/admin | Paiement manuel (démo) |
| POST | `/api/media` | Vendeuse/admin | Upload image (multipart `file`) |
| GET | `/api/media` | Vendeuse/admin | Liste médias |
| GET | `/api/deliveries` | — | **501** — exercice junior |

## Frontend

Dans le frontend, définir `VITE_API_BASE_URL=http://localhost:3000/api` puis remplacer progressivement les mocks par des appels `api` (Axios).

## Build production

```bash
npm run build
npm start
```

Utiliser une base PostgreSQL en prod et des secrets forts pour `JWT_SECRET` et les webhooks.
