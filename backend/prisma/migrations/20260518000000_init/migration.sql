-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "amountFcfa" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "checkoutUrl" TEXT,
    "gateway" TEXT,
    "externalRef" TEXT,
    "externalId" TEXT,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prix" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponible',
    "imageName" JSONB NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "itemsSummary" TEXT NOT NULL,
    "subtotalFcfa" INTEGER NOT NULL DEFAULT 0,
    "discountFcfa" INTEGER NOT NULL DEFAULT 0,
    "promoCode" TEXT,
    "totalFcfa" INTEGER NOT NULL,
    "paidAt" DATETIME,
    "courierId" TEXT,
    "courierName" TEXT,
    "step" TEXT NOT NULL DEFAULT 'preparation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "productsSummary" TEXT NOT NULL,
    "subtotalFcfa" INTEGER NOT NULL DEFAULT 0,
    "discountFcfa" INTEGER NOT NULL DEFAULT 0,
    "promoCode" TEXT,
    "totalFcfa" INTEGER NOT NULL,
    "depositFcfa" INTEGER NOT NULL,
    "depositStatus" TEXT NOT NULL DEFAULT 'pending',
    "workflow" TEXT NOT NULL DEFAULT 'awaiting_deposit',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "amountFcfa" INTEGER NOT NULL,
    "provider" TEXT,
    "externalId" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "gallery" TEXT NOT NULL DEFAULT 'uncategorized',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderRef" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dateISO" TEXT NOT NULL,
    "windowLabel" TEXT NOT NULL,
    "courierId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PaymentIntent_reference_idx" ON "PaymentIntent"("reference");

-- CreateIndex
CREATE INDEX "PaymentIntent_externalId_idx" ON "PaymentIntent"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_reference_key" ON "Reservation"("reference");

-- CreateIndex
CREATE INDEX "PaymentEvent_reference_idx" ON "PaymentEvent"("reference");

-- CreateIndex
CREATE INDEX "PaymentEvent_reference_flow_status_idx" ON "PaymentEvent"("reference", "flow", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_externalId_key" ON "PaymentEvent"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
