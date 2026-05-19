import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock prisma avant l'import du module
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    promotion: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { quotePromotion } from '../src/services/promotionQuote.js';

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const TOMORROW = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

function makePromo(overrides: Partial<{ type: string; value: number; startDate: string; endDate: string; active: boolean }> = {}) {
  return {
    id: 'promo-1',
    code: 'TEST10',
    label: 'Test 10%',
    type: 'percent',
    value: 10,
    startDate: YESTERDAY,
    endDate: TOMORROW,
    active: true,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('quotePromotion', () => {
  it('retourne zéro si aucun code fourni', async () => {
    const result = await quotePromotion({ code: null, subtotalFcfa: 10_000 });
    expect(result.discountFcfa).toBe(0);
    expect(result.totalFcfa).toBe(10_000);
    expect(result.promotion).toBeNull();
  });

  it('retourne zéro si code vide', async () => {
    const result = await quotePromotion({ code: '', subtotalFcfa: 10_000 });
    expect(result.discountFcfa).toBe(0);
  });

  it('lève une erreur si code inconnu', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(null);
    await expect(quotePromotion({ code: 'INCONNU', subtotalFcfa: 10_000 })).rejects.toThrow('Code promo invalide ou expiré');
  });

  it('lève une erreur si promo inactive', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo({ active: false }) as any);
    await expect(quotePromotion({ code: 'TEST10', subtotalFcfa: 10_000 })).rejects.toThrow('Code promo invalide ou expiré');
  });

  it('lève une erreur si promo expirée', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(
      makePromo({ startDate: YESTERDAY, endDate: YESTERDAY }) as any
    );
    await expect(quotePromotion({ code: 'TEST10', subtotalFcfa: 10_000 })).rejects.toThrow('Code promo invalide ou expiré');
  });

  it('lève une erreur si promo pas encore commencée', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(
      makePromo({ startDate: TOMORROW, endDate: TOMORROW }) as any
    );
    await expect(quotePromotion({ code: 'TEST10', subtotalFcfa: 10_000 })).rejects.toThrow('Code promo invalide ou expiré');
  });

  it('calcule un discount pourcentage correctement', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo({ type: 'percent', value: 10 }) as any);
    const result = await quotePromotion({ code: 'TEST10', subtotalFcfa: 10_000 });
    expect(result.discountFcfa).toBe(1_000);
    expect(result.totalFcfa).toBe(9_000);
  });

  it('calcule un discount fixe correctement', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo({ type: 'fixed', value: 2_000 }) as any);
    const result = await quotePromotion({ code: 'TEST10', subtotalFcfa: 10_000 });
    expect(result.discountFcfa).toBe(2_000);
    expect(result.totalFcfa).toBe(8_000);
  });

  it('plafonne le discount fixe au montant du panier', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo({ type: 'fixed', value: 20_000 }) as any);
    const result = await quotePromotion({ code: 'TEST10', subtotalFcfa: 5_000 });
    expect(result.discountFcfa).toBe(5_000);
    expect(result.totalFcfa).toBe(0);
  });

  it('plafonne le discount percent à 100%', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo({ type: 'percent', value: 150 }) as any);
    const result = await quotePromotion({ code: 'TEST10', subtotalFcfa: 5_000 });
    expect(result.discountFcfa).toBe(5_000);
    expect(result.totalFcfa).toBe(0);
  });

  it('retourne 0 de discount si panier vide', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo() as any);
    const result = await quotePromotion({ code: 'TEST10', subtotalFcfa: 0 });
    expect(result.discountFcfa).toBe(0);
    expect(result.totalFcfa).toBe(0);
  });

  it('normalise le code en majuscules', async () => {
    vi.mocked(prisma.promotion.findUnique).mockResolvedValue(makePromo() as any);
    await quotePromotion({ code: 'test10', subtotalFcfa: 10_000 });
    expect(prisma.promotion.findUnique).toHaveBeenCalledWith({ where: { code: 'TEST10' } });
  });
});
