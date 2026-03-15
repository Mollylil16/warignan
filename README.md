# WARIGNAN — Friperie ivoirienne

E-commerce friperie Côte d'Ivoire : catalogue, commandes, réservations, livraisons. Pas de compte client — commande par téléphone/nom. Auth JWT pour vendeuse, admin, livreur.

## Stack

- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, React Query, Zustand
- **Backend:** NestJS, TypeScript, TypeORM
- **Base de données:** PostgreSQL 15
- **Auth:** JWT (VENDEUSE | ADMIN | LIVREUR)

## Démarrage rapide

### 1. Base de données

```bash
docker-compose up -d
```

PostgreSQL : `localhost:5432` — pgAdmin : `http://localhost:5050`

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API : `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App : `http://localhost:5173`

## Structure

- `frontend/` — React (pages client, vendeuse, livreur, admin)
- `backend/` — NestJS (auth, users, products, orders, reservations, deliveries, payments, tracking, uploads)
- `docker-compose.yml` — PostgreSQL + pgAdmin

## Rôles

- **Clientes** : pas de compte — fouille (catalogue), commande, réservation, suivi par numéro
- **Vendeuse** : produits, commandes, réservations, livraisons
- **Livreur** : livraisons assignées
- **Admin** : tout + users + stats

## Prix

Tous les montants en **FCFA** (entiers). Paiement Wave / Orange Money avec preuve (screenshot).
