# Warignan Shop

Monorepo : **frontend** (Vite + React) et **backend** (Express + Prisma + SQLite).

| Dossier     | Rôle |
|------------|------|
| `frontend/` | Interface boutique, espace vendeuse, paiement (démo), suivi |
| `backend/`  | API REST — voir `backend/README.md` et la section collaborateur ci-dessous |

## Démarrage rapide

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Comptes seed backend : vendeuse **`warignan`** / **`wgn225`** (l’e-mail stocké reste `warignan@warignan.shop` ; la connexion accepte aussi le court identifiant), **`admin`** / **`admin123`**, **`livreur`** / **`livreur123`** (même principe avec `@warignan.shop`). Le seed ne crée **que ces comptes** : pas de commandes, promos ni catalogue fictifs (tu ajoutes les vrais articles depuis l’espace vendeuse ou l’admin).

## Promotions (prod)

- **Public** : `GET /api/promotions/active` (bannière boutique), `POST /api/promotions/quote` (simulation d’un code).
- **Checkout** : les pages paiement envoient `subtotalFcfa` et un `promoCode` optionnel ; **le serveur** calcule la remise et le total.

---

## À faire côté backend (collaborateur)

Cette liste est reprise **intégralement** dans `backend/README.md` pour que tout le monde la voie au même endroit. Détail pédagogique : `backend/docs/EXERCICE_JUNIOR_BACKEND.md`.

1. **Livraisons** — Aujourd’hui `GET /api/deliveries` répond **501**. Modèle Prisma `Delivery` seedé mais pas d’API complète. À faire : liste + filtres (statut, date), `PATCH` pour `courierId` / `status`, routes protégées (vendeuse/admin, éventuellement livreur « mes livraisons »).

2. **Réservations** — Aujourd’hui seulement `GET /api/reservations`. À faire : `PATCH /api/reservations/:id` pour `workflow` et/ou `depositStatus`, avec règles métier sur les transitions (ex. pas de passage incohérent `cancelled` → `validated`).

3. **Webhooks paiement (Wave / Orange Money)** — Les routes enregistrent un JSON simplifié **sans vérifier la signature**. À faire : doc fournisseur, validation avec `WAVE_WEBHOOK_SECRET` / `ORANGE_MONEY_WEBHOOK_SECRET`, refus en prod si invalide ; éventuellement body brut (`express.raw`).

4. **Pagination & perf** — Pas de `page` / `limit` sur les listes. À faire : pagination (ou curseur) + éventuellement `select` Prisma pour alléger les réponses.

5. **Médias** — Upload disque local uniquement. À faire : suppression fichier si suppression en base, resize (ex. sharp), S3 / Cloudinary, etc.

6. **Qualité / prod** — Tests (auth, `trackingService`, …), env strict en prod (`JWT_SECRET`, secrets webhooks), PostgreSQL en prod.

**Critères de validation suggérés pour le collaborateur**

- [ ] Au moins une route **livraisons** utile + **auth**.
- [ ] Au moins une **transition** de réservation gérée côté API.
- [ ] Une **tentative de vérif webhook** documentée (même en mock).
- [ ] **README** mis à jour avec ce qui a été ajouté.

---

## Git : pousser le projet sur le dépôt distant

À lancer **à la racine** du repo (`warignan-shop/`), après avoir configuré le remote (GitHub, GitLab, etc.).

```bash
# Vérifier l’état
git status

# Ne pas committer les secrets (.env, dev.db, uploads) — déjà dans .gitignore côté backend
git add .
git status

# Message de commit explicite
git commit -m "feat: backend Express/Prisma + roadmap collaborateur dans README"

# Branche principale (adapter si ta branche s'appelle master)
git branch -M main
git push -u origin main
```

**Première fois / nouveau remote**

```bash
git remote add origin https://github.com/TON_ORG/warignan-shop.git
git push -u origin main
```

**Travail en équipe (recommandé pour le collègue)**

```bash
git checkout -b feat/livraisons-api
# ... commits ...
git push -u origin feat/livraisons-api
# puis ouvrir une Pull Request vers main
```

Ne jamais committer : `backend/.env`, `backend/dev.db`, `backend/uploads/*` (fichiers uploadés), `node_modules/`.
