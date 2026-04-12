import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockMediaAssets,
  type MediaGallerySlot,
  type MockMediaAsset,
} from '../data/vendeuseMock';

export type MediaLibraryItem = MockMediaAsset;

function seedItems(): MediaLibraryItem[] {
  return mockMediaAssets.map((m) => ({ ...m }));
}

interface MediaLibraryState {
  items: MediaLibraryItem[];
  addItem: (item: MediaLibraryItem) => void;
  removeItem: (id: string) => void;
  setPrimary: (id: string) => void;
  setGallery: (id: string, gallery: MediaGallerySlot) => void;
  updateItemUrl: (id: string, url: string, filename: string) => void;
  resetToSeed: () => void;
}

export const useMediaLibraryStore = create<MediaLibraryState>()(
  persist(
    (set) => ({
      items: seedItems(),

      addItem: (item) =>
        set((s) => ({
          items: [item, ...s.items],
        })),

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((m) => m.id !== id),
        })),

      setPrimary: (id) =>
        set((s) => ({
          items: s.items.map((m) => ({ ...m, isPrimary: m.id === id })),
        })),

      setGallery: (id, gallery) =>
        set((s) => ({
          items: s.items.map((m) =>
            m.id === id
              ? {
                  ...m,
                  gallery,
                  context:
                    gallery === 'robes'
                      ? 'Catalogue — Robes'
                      : gallery === 'crops'
                        ? 'Catalogue — Crops'
                        : gallery === 'live'
                          ? 'Live & reels'
                          : gallery === 'banners'
                            ? 'Bannières & home'
                            : 'Non classé',
                }
              : m
          ),
        })),

      updateItemUrl: (id, url, filename) =>
        set((s) => ({
          items: s.items.map((m) => (m.id === id ? { ...m, url, filename } : m)),
        })),

      resetToSeed: () => set({ items: seedItems() }),
    }),
    {
      name: 'warignan-media-library-v2',
      partialize: (s) => ({ items: s.items }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== 'object') return current;
        const p = persisted as { items?: MediaLibraryItem[] };
        if (!Array.isArray(p.items)) return current;
        return {
          ...current,
          items: p.items.map((m) => ({
            ...m,
            gallery: m.gallery ?? 'uncategorized',
          })),
        };
      },
    }
  )
);
