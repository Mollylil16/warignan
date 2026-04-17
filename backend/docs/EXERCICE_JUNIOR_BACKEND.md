# Exercice backend (~30 % restants) — Warignan

Ce document liste ce qui **n’est pas fini** volontairement pour ton premier exercice pro. Le reste du dossier `backend/` tourne déjà (API + Prisma + auth + catalogue + suivi partiel).

## Contexte

- Stack : **Node.js**, **Express**, **TypeScript**, **Prisma**, **SQLite** (`dev.db`).
- Comptes seed : vendeuse `warignan` / `wgn225` (ou e-mail complet `@warignan.shop`), `admin` / `admin123` (le seed ne remplit plus de données métier fictives).

## Tâches suggérées (par priorité)

### 1. Livraisons (`Delivery`)

- Implémenter `GET /api/deliveries` (liste, filtres par `status`, par date).
- Ajouter `PATCH /api/deliveries/:id` pour changer `courierId` ou `status`.
- Protéger les routes : **vendeuse** / **admin** (et éventuellement **livreur** avec filtre « mes courses »).
- Fichiers : `src/routes/deliveries.ts`, éventuellement `src/services/deliveryService.ts`.

### 2. Réservations — mise à jour workflow

- Ajouter `PATCH /api/reservations/:id` pour modifier `workflow` et/ou `depositStatus`.
- Valider les transitions (ex. on ne passe pas de `cancelled` à `validated` sans règle métier).
- Tester avec Prisma Studio ou Thunder Client.

### 3. Webhooks Wave / Orange Money

- Lire la doc officielle sur la **signature** des requêtes entrantes.
- Implémenter la vérification dans `src/routes/webhooks.ts` avec `WAVE_WEBHOOK_SECRET` / `ORANGE_MONEY_WEBHOOK_SECRET`.
- En production, refuser les requêtes non signées (`401`).
- Option avancée : accepter le **body brut** (`express.raw`) pour certains fournisseurs.

### 4. Pagination & perf

- Ajouter `?page=` et `?limit=` (ou curseur) sur `GET /api/products` et listes vendeuse.
- Limiter les champs renvoyés si besoin (`select` Prisma).

### 5. Upload médias

- Aujourd’hui : fichier sur disque local + URL `/uploads/...`.
- Améliorations possibles : suppression du fichier si la ligne DB est supprimée, redimensionnement (sharp), envoi vers **S3** / Cloudinary.

### 6. Qualité

- Ajouter des tests (Vitest ou Jest) sur `trackingService` et auth.
- Variables d’environnement strictes en prod (`JWT_SECRET` fort, pas de secret vide).
- Passer la base en **PostgreSQL** pour la prod (`DATABASE_URL` Postgres).

## Critères de « terminé » pour toi

- [ ] Au moins une route **livraisons** fonctionnelle + auth.
- [ ] Au moins une **transition** réservation validée côté API.
- [ ] Une **tentative documentée** de vérif webhook (même si en mock avec secret de test).
- [ ] README mis à jour avec ce que tu as ajouté.

Bon courage — demande une review de ta PR avant de merger.
