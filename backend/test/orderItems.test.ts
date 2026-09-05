import { describe, expect, it } from 'vitest';
import { parseProductImageUrls, buildEnrichedItems } from '../src/services/orderItems.js';

describe('orderItems service', () => {
  it('parseProductImageUrls extracts array of urls correctly', () => {
    expect(parseProductImageUrls(['/uploads/img1.jpg', '/uploads/img2.jpg'])).toEqual([
      '/uploads/img1.jpg',
      '/uploads/img2.jpg',
    ]);
    expect(parseProductImageUrls(JSON.stringify(['/uploads/a.png']))).toEqual(['/uploads/a.png']);
    expect(parseProductImageUrls('/uploads/single.jpg')).toEqual(['/uploads/single.jpg']);
    expect(parseProductImageUrls(null)).toEqual([]);
    expect(parseProductImageUrls('')).toEqual([]);
  });

  it('buildEnrichedItems maps items with product details', () => {
    const productMap = new Map([
      [
        'CR-E9AD0D',
        {
          code: 'CR-E9AD0D',
          nom: 'Crop Top Noir',
          prix: 2000,
          imageName: ['/uploads/crop.jpg'],
        },
      ],
      [
        'RB-272045',
        {
          code: 'RB-272045',
          nom: 'Robe Blanche',
          prix: 5000,
          imageName: JSON.stringify(['/uploads/robe.jpg']),
        },
      ],
    ]);

    const enriched = buildEnrichedItems('CR-E9AD0D ×2, RB-272045 ×1, UNKNOWN ×1', productMap);

    expect(enriched).toHaveLength(3);
    expect(enriched[0]).toEqual({
      code: 'CR-E9AD0D',
      qty: 2,
      nom: 'Crop Top Noir',
      prix: 2000,
      image: '/uploads/crop.jpg',
      images: ['/uploads/crop.jpg'],
    });
    expect(enriched[1]).toEqual({
      code: 'RB-272045',
      qty: 1,
      nom: 'Robe Blanche',
      prix: 5000,
      image: '/uploads/robe.jpg',
      images: ['/uploads/robe.jpg'],
    });
    expect(enriched[2]).toEqual({
      code: 'UNKNOWN',
      qty: 1,
      nom: null,
      prix: null,
      image: null,
      images: [],
    });
  });
});
