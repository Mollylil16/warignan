import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentEvent.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('vendeuse123', 10);
  await prisma.user.create({
    data: {
      email: 'vendeuse@warignan.shop',
      passwordHash,
      displayName: 'Vendeuse démo',
      role: 'vendeuse',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@warignan.shop',
      passwordHash: await bcrypt.hash('admin123', 10),
      displayName: 'Admin démo',
      role: 'admin',
    },
  });

  const imgs = (paths: string[]) => paths as unknown as object;

  await prisma.product.createMany({
    data: [
      {
        code: '#R-042',
        nom: 'Robe Soie Vintage Y2K',
        description: 'Superbe robe en soie vintage années 2000',
        prix: 12500,
        category: 'robe',
        status: 'disponible',
        imageName: imgs(['/images/robe.webp']),
        stock: 1,
        featured: true,
      },
      {
        code: '#C-881',
        nom: 'Crop Classic Yellow (T.41)',
        description: 'Crop classiques jaunes taille 41',
        prix: 3500,
        category: 'crop',
        status: 'disponible',
        imageName: imgs(['/images/croc4.webp']),
        stock: 3,
        featured: true,
      },
      {
        code: '#R-019',
        nom: 'Maxi Robe Fleurie Été',
        description: "Maxi robe fleurie pour l'été",
        prix: 8000,
        category: 'robe',
        status: 'reserver',
        imageName: imgs(['/images/robe3.webp']),
        stock: 1,
        featured: false,
      },
      {
        code: '#C-212',
        nom: 'Crop Rose Poudré (T.38)',
        description: 'Crop rose poudré taille 38',
        prix: 2500,
        category: 'crop',
        status: 'disponible',
        imageName: imgs(['/images/crocs2.webp']),
        stock: 2,
        featured: false,
      },
      {
        code: '#R-057',
        nom: 'Robe Wrap Fleurie',
        description: 'Robe wrap à motif fleuri',
        prix: 9500,
        category: 'robe',
        status: 'disponible',
        imageName: imgs(['/images/robe5.webp']),
        stock: 2,
        featured: true,
      },
      {
        code: '#R-033',
        nom: 'Robe Noire Élégante',
        description: 'Robe noire élégante',
        prix: 15500,
        category: 'robe',
        status: 'disponible',
        imageName: imgs(['/images/robe7.webp']),
        stock: 1,
        featured: false,
      },
    ],
  });

  await prisma.order.createMany({
    data: [
      {
        reference: 'WRG-CMD-001',
        clientName: 'Aïcha K.',
        city: 'Cocody',
        itemsSummary: 'Robe cocktail satin ×1',
        totalFcfa: 11000,
        paidAt: new Date('2026-04-04T16:00:00'),
        step: 'preparation',
      },
      {
        reference: 'WRG-CMD-002',
        clientName: 'Koffi M.',
        city: 'Marcory',
        itemsSummary: 'Crop lin ×1, Robe wrap ×1',
        totalFcfa: 12300,
        paidAt: new Date('2026-04-05T10:30:00'),
        step: 'emballage',
      },
    ],
  });

  await prisma.reservation.createMany({
    data: [
      {
        reference: 'WRG-RES-A1B2',
        clientName: 'Aïcha K.',
        clientPhone: '+225 07 12 34 56 78',
        productsSummary: 'Robe Soie Vintage ×1',
        totalFcfa: 15000,
        depositFcfa: 4500,
        depositStatus: 'paid',
        workflow: 'awaiting_validation',
      },
      {
        reference: 'WRG-RES-C3D4',
        clientName: 'Mariam D.',
        clientPhone: '+225 05 98 76 54 32',
        productsSummary: 'Maxi robe fleurie ×1',
        totalFcfa: 8000,
        depositFcfa: 2400,
        depositStatus: 'pending',
        workflow: 'awaiting_deposit',
      },
    ],
  });

  await prisma.paymentEvent.createMany({
    data: [
      {
        reference: 'WRG-DEMO-PAY-1',
        flow: 'order',
        amountFcfa: 11000,
        provider: 'wave',
        status: 'confirmed',
        payload: { demo: true },
      },
    ],
  });

  await prisma.mediaAsset.createMany({
    data: [
      {
        url: '/images/robe.webp',
        filename: 'robe.webp',
        gallery: 'robes',
        isPrimary: true,
      },
      {
        url: '/images/croc4.webp',
        filename: 'croc4.webp',
        gallery: 'crops',
        isPrimary: false,
      },
    ],
  });

  await prisma.delivery.createMany({
    data: [
      {
        orderRef: 'WRG-CMD-002',
        clientName: 'Koffi M.',
        address: 'Marcory résidentiel, villa 12',
        dateISO: '2026-04-06',
        windowLabel: '10h – 12h',
        courierId: 'c1',
        status: 'assigned',
      },
    ],
  });

  console.log('Seed OK — comptes : vendeuse@warignan.shop / vendeuse123 , admin@warignan.shop / admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
