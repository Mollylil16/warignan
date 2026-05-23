-- Migration : ajout clientPhone (drift db push) et numeroSuivi (tracking livreur)
ALTER TABLE "Delivery" ADD COLUMN "clientPhone" TEXT;
ALTER TABLE "Delivery" ADD COLUMN "numeroSuivi" TEXT;
CREATE UNIQUE INDEX "Delivery_numeroSuivi_key" ON "Delivery"("numeroSuivi");
