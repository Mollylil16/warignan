# Warignan Shop — Guide Claude Code

Boutique e-commerce de vêtements féminins (robes, crops). Stack Node.js + React, paiements via GeniusPay/Wave/Orange Money, public cible : marché ivoirien.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind + Zustand + TanStack Query |
| Backend | Express.js + TypeScript + Prisma |
| DB (dev) | SQLite (`backend/prisma/dev.db`) |
| DB (prod) | PostgreSQL via Docker Compose |
| Paiements | GeniusPay (principal), Wave, Orange Money |
| Logger | pino + pino-pretty (dev) |
| Tests | vitest (`npm test` dans `backend/`) |

## Démarrage local

```bash
# Backend (port 4001)
cd backend
cp .env.example .env          # remplir les secrets si besoin
npm install
npx prisma generate
npm run dev

# Frontend (port 3000)
cd frontend
npm install
npm run dev
```

Le proxy Vite redirige `/api` et `/uploads` vers `http://localhost:4001`.

## Comptes seed (développement)

```bash
cd backend && npm run db:seed
```

| Email | Mot de passe court | Rôle |
|-------|--------------------|------|
| `warignan@warignan.shop` | `warignan` | vendeuse |
| `admin@warignan.shop` | `admin` | admin |
| `livreur@warignan.shop` | `livreur` | livreur |

## Schéma DB & Migrations

- `backend/prisma/schema.prisma` — source de vérité (9 modèles)
- **Ne pas utiliser `prisma db push` en prod.** Toujours passer par des migrations :

```bash
npx prisma migrate dev --name <description>
```

## Variables d'environnement requises

Voir `backend/.env.example`. En production, ces variables **bloquent le démarrage** si absentes :
- `JWT_SECRET` — doit être fort (≠ valeur par défaut)
- `GENIUSPAY_WEBHOOK_SECRET`, `WAVE_WEBHOOK_SECRET`, `ORANGE_MONEY_WEBHOOK_SECRET` — sans eux, les webhooks retournent HTTP 503

## Architecture des routes

```
/api/auth         — inscription, connexion, profil
/api/products     — catalogue (public GET, auth POST/PATCH/DELETE)
/api/orders       — commandes (POST public, reste vendeuse/admin)
/api/reservations — réservations (POST public, reste vendeuse/admin)
/api/payments     — événements paiement + GeniusPay checkout
/api/webhooks     — webhooks Wave, Orange Money, GeniusPay (HMAC validé)
/api/promotions   — codes promo (GET /active public, reste auth)
/api/tracking     — suivi unifié par référence (public)
/api/deliveries   — livraisons (vendeuse/admin/livreur)
/api/dashboard    — stats agrégées (vendeuse/admin)
/api/media        — upload images (vendeuse/admin)
/uploads/*        — images servies statiquement
```

## Règles métier importantes

### Commandes — Transitions d'étape
`preparation → emballage → expediee → livree`

L'étape `emballage`, `expediee` et `livree` requièrent que **la totalité du montant soit encaissée** (vérification via `paymentTotals.ts`). Modifier cette contrainte impacte directement la gestion financière.

### Réservations — Workflow
`awaiting_deposit → awaiting_validation → validated`  
ou `awaiting_deposit → cancelled`

- L'acompte est **30% du total**, calculé à la création.
- La validation requiert `depositStatus = 'paid'`.
- Impossible d'annuler après validation.

### Paiements
- Les `PaymentEvent` sont **idempotents** via `externalId` (unique en base).
- GeniusPay : webhook avec HMAC-SHA256 + timestamp ±5 min + rotation de secrets (current + old).
- Wave/Orange : HMAC-SHA256 via `assertWebhookSignature()` — secret requis en production.
- Réconciliation cron GeniusPay optionnelle (`GENIUSPAY_RECONCILE_CRON_ENABLED=true`).

## Tests

```bash
cd backend
npm test                # 24 tests, ~1s
npm run test:coverage   # rapport de couverture
```

Tests couverts : `webhookSignature.ts` (HMAC) et `promotionQuote.ts` (calcul discount).

## Qualité code

- TypeScript strict sur backend et frontend
- Zod pour la validation des entrées API (côté serveur)
- `sonner` pour les toasts d'erreur côté client
- `ErrorBoundary` global dans `App.tsx`

## Déploiement

- `docker-compose.yml` à la racine — PostgreSQL 15 + PgAdmin
- Nginx recommandé en reverse proxy (`app.set('trust proxy', 1)` déjà configuré)
- `SIGTERM` / `SIGINT` gérés proprement (graceful shutdown)
- Rate limiting : 240 req/min/IP sur `/api`, 600 req/min/IP sur `/api/webhooks`
