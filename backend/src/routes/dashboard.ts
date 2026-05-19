import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

router.get(
  '/vendeuse',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (_req, res, next) => {
    try {
      const todayStart = startOfToday();
      const tomorrowStart = startOfTomorrow();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        orderByStep,
        shippedToday,
        reservationByWorkflow,
        payments24h,
        payments7d,
        todoReservations,
        todoOrders,
      ] = await Promise.all([
        prisma.order.groupBy({
          by: ['step'],
          _count: { _all: true },
        }),
        prisma.order.count({
          where: {
            step: 'expediee',
            updatedAt: { gte: todayStart, lt: tomorrowStart },
          },
        }),
        prisma.reservation.groupBy({
          by: ['workflow'],
          _count: { _all: true },
        }),
        prisma.paymentEvent.findMany({
          where: { createdAt: { gte: last24h } },
          select: { amountFcfa: true, status: true },
        }),
        prisma.paymentEvent.findMany({
          where: { createdAt: { gte: last7d }, status: 'confirmed' },
          select: { reference: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
        prisma.reservation.findMany({
          where: { workflow: 'awaiting_validation' },
          orderBy: { createdAt: 'asc' },
          take: 5,
          select: { id: true, reference: true, clientName: true, createdAt: true },
        }),
        prisma.order.findMany({
          where: {
            step: { in: ['preparation', 'emballage'] },
            createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: 'asc' },
          take: 5,
          select: { id: true, reference: true, clientName: true, city: true, createdAt: true, step: true },
        }),
      ]);

      const orders = Object.fromEntries(orderByStep.map((r) => [r.step, r._count._all])) as Record<
        string,
        number
      >;

      const reservations = Object.fromEntries(
        reservationByWorkflow.map((r) => [r.workflow, r._count._all])
      ) as Record<string, number>;

      const payments24hCount = payments24h.length;
      const payments24hAmount = payments24h.reduce((s, p) => s + (p.status === 'confirmed' ? p.amountFcfa : 0), 0);
      const payments24hFailed = payments24h.reduce((s, p) => s + (p.status === 'failed' ? 1 : 0), 0);

      const refs = Array.from(new Set(payments7d.map((p) => p.reference)));
      const [orderRefs, reservationRefs] = await Promise.all([
        prisma.order.findMany({ where: { reference: { in: refs } }, select: { reference: true } }),
        prisma.reservation.findMany({ where: { reference: { in: refs } }, select: { reference: true } }),
      ]);
      const known = new Set([
        ...orderRefs.map((r) => r.reference),
        ...reservationRefs.map((r) => r.reference),
      ]);
      const anomalies7d = refs.filter((r) => !known.has(r)).length;

      const todo = [
        ...todoReservations.map((r) => ({
          kind: 'reservation' as const,
          reference: r.reference,
          title: 'Réservation à valider',
          subtitle: r.clientName,
          createdAt: r.createdAt.toISOString(),
          priority: 1,
        })),
        ...todoOrders.map((o) => ({
          kind: 'order' as const,
          reference: o.reference,
          title: o.step === 'emballage' ? 'Commande en emballage' : 'Commande en préparation',
          subtitle: `${o.clientName} — ${o.city}`,
          createdAt: o.createdAt.toISOString(),
          priority: 2,
        })),
      ]
        .sort((a, b) => a.priority - b.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 5);

      res.json({
        kpi: {
          orders: {
            preparation: orders.preparation ?? 0,
            emballage: orders.emballage ?? 0,
            expediee: orders.expediee ?? 0,
            livree: orders.livree ?? 0,
            shippedToday,
          },
          reservations: {
            awaiting_deposit: reservations.awaiting_deposit ?? 0,
            awaiting_validation: reservations.awaiting_validation ?? 0,
            validated: reservations.validated ?? 0,
            cancelled: reservations.cancelled ?? 0,
          },
          payments: {
            last24h: {
              count: payments24hCount,
              amountFcfaConfirmed: payments24hAmount,
              failedCount: payments24hFailed,
            },
            anomaliesLast7d: anomalies7d,
          },
        },
        todo,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/admin',
  requireAuth,
  requireRoles('admin'),
  async (_req, res, next) => {
    try {
      const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        confirmedPaymentsAgg,
        ordersAgg,
        ordersByStep,
        reservationsByWorkflow,
        payments7d,
        usersCount,
      ] = await Promise.all([
        prisma.paymentEvent.aggregate({
          where: { status: 'confirmed' },
          _sum: { amountFcfa: true },
        }),
        prisma.order.aggregate({
          _sum: { totalFcfa: true },
          _count: { _all: true },
        }),
        prisma.order.groupBy({ by: ['step'], _count: { _all: true } }),
        prisma.reservation.groupBy({ by: ['workflow'], _count: { _all: true } }),
        prisma.paymentEvent.findMany({
          where: { createdAt: { gte: last7d }, status: 'confirmed' },
          select: { amountFcfa: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      ]);

      // Tendance CA confirmé par jour (7 derniers jours)
      const byDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        byDay[d.toISOString().slice(0, 10)] = 0;
      }
      payments7d.forEach((p) => {
        const day = p.createdAt.toISOString().slice(0, 10);
        if (byDay[day] !== undefined) byDay[day] += p.amountFcfa;
      });

      res.json({
        caReel: confirmedPaymentsAgg._sum.amountFcfa ?? 0,
        caAttendu: ordersAgg._sum.totalFcfa ?? 0,
        totalOrders: ordersAgg._count._all,
        ordersByStep: Object.fromEntries(ordersByStep.map((r) => [r.step, r._count._all])),
        reservationsByWorkflow: Object.fromEntries(
          reservationsByWorkflow.map((r) => [r.workflow, r._count._all])
        ),
        trendCa7d: Object.entries(byDay).map(([date, amount]) => ({ date, amount })),
        usersByRole: Object.fromEntries(usersCount.map((r) => [r.role, r._count._all])),
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;

