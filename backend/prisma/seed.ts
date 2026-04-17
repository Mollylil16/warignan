import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed « production-ready » : uniquement les comptes staff pour se connecter.
 * Aucun produit, commande, réservation, paiement, média, livraison ni promo fictifs.
 * Les données métier arrivent des clients (checkout) et des actions vendeuse dans l’app.
 */
async function main() {
  await prisma.promotion.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: 'warignan@warignan.shop',
      passwordHash: await bcrypt.hash('wgn225', 10),
      displayName: 'Boutique Warignan',
      role: 'vendeuse',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@warignan.shop',
      passwordHash: await bcrypt.hash('admin123', 10),
      displayName: 'Admin Warignan',
      role: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      email: 'livreur@warignan.shop',
      passwordHash: await bcrypt.hash('livreur123', 10),
      displayName: 'Livreur partenaire',
      role: 'livreur',
    },
  });

  console.log(
    'Seed OK — comptes uniquement (base métier vide). Connexion vendeuse : warignan (ou warignan@warignan.shop) / wgn225 | admin (ou admin@warignan.shop) / admin123 | livreur (ou livreur@warignan.shop) / livreur123'
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
