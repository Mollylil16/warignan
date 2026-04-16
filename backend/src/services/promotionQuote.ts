import type { Promotion, PromotionType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

export type PromotionQuote = {
  promoCode: string | null;
  discountFcfa: number;
  totalFcfa: number;
  promotion: null | {
    id: string;
    code: string;
    label: string;
    type: PromotionType;
    value: number;
  };
};

function computeDiscount(subtotalFcfa: number, p: Promotion): number {
  if (subtotalFcfa <= 0) return 0;
  if (p.type === 'fixed') return Math.min(subtotalFcfa, p.value);
  // percent
  const raw = Math.floor((subtotalFcfa * p.value) / 100);
  return Math.min(subtotalFcfa, raw);
}

export async function quotePromotion(args: {
  code: string | null | undefined;
  subtotalFcfa: number;
}): Promise<PromotionQuote> {
  const subtotalFcfa = Math.max(0, Math.trunc(args.subtotalFcfa));
  const code = args.code?.trim().toUpperCase() ?? '';
  if (!code) {
    return { promoCode: null, discountFcfa: 0, totalFcfa: subtotalFcfa, promotion: null };
  }

  const d = todayISO();
  const p = await prisma.promotion.findUnique({ where: { code } });
  if (!p || !p.active || p.startDate > d || p.endDate < d) {
    throw new HttpError(400, 'Code promo invalide ou expiré');
  }

  const discountFcfa = computeDiscount(subtotalFcfa, p);
  const totalFcfa = Math.max(0, subtotalFcfa - discountFcfa);
  return {
    promoCode: p.code,
    discountFcfa,
    totalFcfa,
    promotion: { id: p.id, code: p.code, label: p.label, type: p.type, value: p.value },
  };
}

