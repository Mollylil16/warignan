-- Migration : ajout du champ phone (optionnel) sur le modèle User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
