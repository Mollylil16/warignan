# Warignan API (backend)

API REST pour la boutique Warignan — environ **70 %** des fonctionnalités prévues.

> **Note :** le dossier `src/modules/` (NestJS / TypeORM) est un ancien squelette **non utilisé** par cette API. Seuls les fichiers listés dans `tsconfig.json` sont compilés (Express + Prisma). Tu peux supprimer `src/modules/`, `src/server.ts`, `src/main.ts`, etc. quand tu veux nettoyer le repo.

## Fonctionnalités principales

L'API est aujourd'hui fonctionnelle et couvre la majorité des besoins e-commerce :

1. **Livraisons**
   - API complète (`GET`, `POST`, `PATCH`) avec filtres par statut et date.
   - Les rôles sont protégés (vendeuse, admin, livreur assigné).

2. **Réservations**
   - Gestion stricte des transitions de workflow.
   - L'acompte (souvent 30%) est vérifié avant toute validation.

3. **Webhooks paiement**
   - Les endpoints Wave et Orange Money vérifient rigoureusement les signatures HMAC.

4. **Pagination**
   - Implémentée sur les listes (produits, commandes) pour des meilleures performances.

5. **Médias**
   - Upload de fichiers, redimensionnement via Sharp, et intégration Cloudinary.

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

- API : <http://localhost:4000> (port par défaut dans `src/config/env.ts`, aligné avec le proxy Vite du frontend)
- Santé : <http://localhost:4000/api/health>

## Variables `.env`

Voir `.env.example`. En local avec Vite sur le port 3000 : `CORS_ORIGIN=http://localhost:3000`.

- **`JWT_SECRET`** : en dev, une valeur quelconque peut suffire ; **en production**, utilise une chaîne **longue et imprévisible** (par ex. 32 octets aléatoires en hex : `openssl rand -hex 32` sous Git Bash ou WSL). Ne la partage jamais et ne la commite pas.

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

- **`VITE_API_BASE_URL`** : en local, **laisser vide** : le frontend appelle `/api` et Vite proxy vers cette API (`vite.config.ts`).
- **Production** : si le site est servi sur un autre domaine que l’API, définir l’URL complète au moment du build, par ex. `VITE_API_BASE_URL=https://api.tondomaine.com/api`.

## Build production

```bash
npm run build
npm start
```

Utiliser une base PostgreSQL en prod et des secrets forts pour `JWT_SECRET` et les webhooks.
