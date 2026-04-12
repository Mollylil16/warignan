

import { productFilters } from '../../types';

// Props : les filtres actuels + une fonction pour les modifier
interface FilterBarProps {
  filters: productFilters;
  // Partial<productFilters> = on peut modifier UN seul filtre à la fois
  // sans avoir à repasser TOUS les filtres
  onFilterChange: (newFilters: Partial<productFilters>) => void;
  // Prix max possible (pour la limite haute du slider)
  maxProductPrice: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

// Configuration des pills de catégorie/tri
// On les met dans un tableau pour éviter de répéter du JSX
const CATEGORY_PILLS = [
  { label: 'Tout', value: 'ALL' as const },
  { label: 'Robes', value: 'ROBE' as const },
  { label: 'Crop', value: 'CROP' as const },
];

const SORT_PILLS = [
  { label: 'Prix ↑', value: 'price-asc' as const },
  { label: 'Prix ↓', value: 'price-desc' as const },
  { label: 'Nouveautés', value: 'newest' as const },
  { label: 'Ancien', value: 'oldest' as const },
  { label: 'Coups de cœur', value: 'popular' as const },
];

const FilterBar = ({
  filters,
  onFilterChange,
  maxProductPrice,
  searchQuery,
  onSearchChange,
}: FilterBarProps) => {
  return (
    <nav
      className="sticky top-14 z-40 border-b border-[#2A2A2A] px-3 py-2.5 sm:top-16 sm:px-4 sm:py-3"
      style={{
        background: '#170b00',
      }}
    >
      <div className="mb-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une pièce, un code…"
          className="w-full rounded-full border border-[#2A2A2A] bg-[#121212] px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/50 focus:outline-none focus:ring-1 focus:ring-tiktok-cyan/30"
          aria-label="Recherche catalogue"
        />
      </div>

      {/* Scroll horizontal pour les pills */}
      {/* overflow-x: auto = scrollable horizontalement */}
      {/* scrollbar-hide = classe Tailwind custom pour cacher la scrollbar */}
      <div
        className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-1 sm:gap-2 sm:mx-0"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >

        {/* ---- PILLS DE CATÉGORIE ---- */}
        {CATEGORY_PILLS.map((pill) => {
          // On vérifie si ce pill est le filtre actif
          const isActive = filters.category === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => onFilterChange({ category: pill.value })}
              style={{
                // Fond blanc si actif, sinon fond sombre
                background: isActive ? '#FFFFFF' : '#121212',
                color: isActive ? '#050505' : '#FFFFFF',
                border: isActive ? '1px solid #FFFFFF' : '1px solid #2A2A2A',
                padding: '7px 12px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap', // Empêche le texte de se couper
                cursor: 'pointer',
                flexShrink: 0, // Empêche les pills de se rétrécir
              }}
            >
              {pill.label}
            </button>
          );
        })}

        {/* ---- PILLS DE TRI ---- */}
        {SORT_PILLS.map((pill) => {
          const isActive = filters.sortBy === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => onFilterChange({ sortBy: pill.value })}
              style={{
                background: isActive ? '#25F4EE' : '#121212',
                color: isActive ? '#050505' : '#25F4EE',
                border: `1px solid ${isActive ? '#25F4EE' : '#25F4EE55'}`,
                padding: '7px 12px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* ---- SLIDER DE PRIX ---- */}
      <div
        className="mt-3 flex min-w-0 items-center gap-2 sm:gap-3"
        style={{ fontSize: '11px', color: '#888' }}
      >
        {/* Prix minimum (fixe) */}
        <span className="shrink-0 text-[10px] sm:text-xs" style={{ whiteSpace: 'nowrap' }}>
          1 000F
        </span>

        {/* Le slider HTML natif */}
        <input
          type="range"
          min={1000}
          max={maxProductPrice}
          // value = valeur actuelle du filtre
          value={filters.maxPrice}
          // onChange se déclenche à chaque mouvement du slider
          onChange={(e) =>
            // parseInt convertit la valeur string du input en nombre
            onFilterChange({ maxPrice: parseInt(e.target.value) })
          }
          className="min-w-0 flex-1 touch-manipulation py-2"
          style={{
            // On stylise le slider manuellement
            WebkitAppearance: 'none',
            appearance: 'none',
            background: '#2A2A2A',
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
          }}
        />

        {/* Prix maximum dynamique (suit le slider) */}
        <span
          className="shrink-0 text-[10px] sm:text-xs"
          style={{ whiteSpace: 'nowrap', color: '#25F4EE', fontWeight: 600 }}
        >
          {/* toLocaleString pour formater avec espace : 15500 → "15 500" */}
          {filters.maxPrice.toLocaleString('fr-FR')}F
        </span>
      </div>
    </nav>
  );
};

export default FilterBar;