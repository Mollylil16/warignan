

import { productFilters } from '../../types';

// Props : les filtres actuels + une fonction pour les modifier
interface FilterBarProps {
  filters: productFilters;
  // Partial<productFilters> = on peut modifier UN seul filtre à la fois
  // sans avoir à repasser TOUS les filtres
  onFilterChange: (newFilters: Partial<productFilters>) => void;
  // Prix max possible (pour la limite haute du slider)
  maxProductPrice: number;
}

// Configuration des pills de catégorie/tri
// On les met dans un tableau pour éviter de répéter du JSX
const CATEGORY_PILLS = [
  { label: 'Tout', value: 'ALL' as const },
  { label: 'Robes', value: 'ROBE' as const },
  { label: 'Crocs', value: 'CROP' as const },
];

const SORT_PILLS = [
  { label: 'Prix ↑', value: 'price-asc' as const },
  { label: 'Nouveautés', value: 'newest' as const },
  { label: 'Coups de ❤️', value: 'popular' as const },
];

const FilterBar = ({ filters, onFilterChange, maxProductPrice }: FilterBarProps) => {
  return (
    <nav
      className="px-4 py-3 sticky z-40"
      style={{
        // top: 73px = juste en dessous de la navbar (hauteur navbar ≈ 73px)
        top: '73px',
        background: '#050505',
        borderBottom: '1px solid #2A2A2A',
      }}
    >
      {/* Scroll horizontal pour les pills */}
      {/* overflow-x: auto = scrollable horizontalement */}
      {/* scrollbar-hide = classe Tailwind custom pour cacher la scrollbar */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }} // Cache la scrollbar sur Firefox
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
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '13px',
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
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '13px',
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
        className="flex items-center gap-3 mt-3"
        style={{ fontSize: '12px', color: '#888' }}
      >
        {/* Prix minimum (fixe) */}
        <span style={{ whiteSpace: 'nowrap' }}>1 000F</span>

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
          className="flex-1"
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
        <span style={{ whiteSpace: 'nowrap', color: '#25F4EE', fontWeight: 600 }}>
          {/* toLocaleString pour formater avec espace : 15500 → "15 500" */}
          {filters.maxPrice.toLocaleString('fr-FR')}F
        </span>
      </div>
    </nav>
  );
};

export default FilterBar;