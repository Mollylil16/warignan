import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { productFilters } from '../../types';

interface FilterBarProps {
  filters: productFilters;
  onFilterChange: (newFilters: Partial<productFilters>) => void;
  maxProductPrice: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORY_PILLS = [
  { label: 'Tout', value: 'ALL' as const },
  { label: 'Robes', value: 'ROBE' as const },
  { label: 'Crops', value: 'CROP' as const },
];

const SORT_PILLS = [
  { label: 'Nouveautés', value: 'newest' as const },
  { label: 'Coups de cœur', value: 'popular' as const },
  { label: 'Prix ↑', value: 'price-asc' as const },
  { label: 'Prix ↓', value: 'price-desc' as const },
  { label: 'Anciens', value: 'oldest' as const },
];

const FilterBar = ({
  filters,
  onFilterChange,
  maxProductPrice,
  searchQuery,
  onSearchChange,
}: FilterBarProps) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Check if any advanced filter is active (not default)
  const isFiltered = filters.sortBy !== 'newest' || filters.maxPrice < maxProductPrice;

  return (
    <nav
      className="sticky top-14 z-40 border-b border-white/5 px-3 py-2.5 backdrop-blur-md sm:top-16 sm:px-4 sm:py-3.5"
      style={{
        background: 'rgba(17, 15, 16, 0.95)',
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Search Input */}
        <div className="mb-2.5">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un modèle, un code (ex: WRG-ROB-001)..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-tiktok-pink/50 focus:outline-none focus:ring-1 focus:ring-tiktok-pink/30 transition-all"
            aria-label="Recherche catalogue"
          />
        </div>

        {/* Categories Row & Toggle Button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1.5 shrink-0">
            {CATEGORY_PILLS.map((pill) => {
              const isActive = filters.category === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => onFilterChange({ category: pill.value })}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-black border border-white'
                      : 'bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Toggle for mobile filters */}
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all sm:hidden ${
              isOpenMobile || isFiltered
                ? 'bg-tiktok-pink text-white border-tiktok-pink'
                : 'bg-white/5 text-neutral-300 border-white/10'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filtres</span>
            {isFiltered && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Expandable Advanced Filters (always visible on desktop, toggled on mobile) */}
        <div className={`${isOpenMobile ? 'block' : 'hidden'} sm:block mt-3 space-y-3 pt-2.5 border-t border-white/5`}>
          {/* Sort pills */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold sm:w-20">Trier par :</span>
            <div className="flex flex-wrap gap-1.5">
              {SORT_PILLS.map((pill) => {
                const isActive = filters.sortBy === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => onFilterChange({ sortBy: pill.value })}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-tiktok-cyan text-black border border-tiktok-cyan'
                        : 'bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price slider */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold sm:w-20">Prix max :</span>
            <div className="flex flex-1 items-center gap-3">
              <span className="text-[10px] font-semibold text-neutral-500">1 000 F</span>
              <input
                type="range"
                min={1000}
                max={maxProductPrice}
                value={filters.maxPrice}
                onChange={(e) => onFilterChange({ maxPrice: parseInt(e.target.value) })}
                className="flex-1 accent-tiktok-cyan cursor-pointer h-1.5 rounded-lg bg-white/10 appearance-none outline-none"
              />
              <span className="text-[11px] font-extrabold text-tiktok-cyan min-w-[70px] text-right">
                {filters.maxPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FilterBar;