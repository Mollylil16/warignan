-- Migration : ajout clientPhone à la table Order
ALTER TABLE "Order" ADD COLUMN "clientPhone" TEXT;
