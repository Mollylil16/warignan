

import { useState, useMemo } from 'react';
// useState = pour stocker et modifier des données réactives
// useMemo = pour mémoriser un calcul coûteux (éviter de recalculer à chaque rendu)

import { productFilters, ProductCategory } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { Search } from 'lucide-react';
import FilterBar from '../../components/shared/StatusBadge';
import ProductCard from '../../components/shared/ProductCard';

const FouillePage = () => {
  const { data: catalog } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // ---- ÉTAT DES FILTRES ----
  // useState retourne [valeur actuelle, fonction pour la modifier]
  const [filters, setFilters] = useState<productFilters>({
    category: 'ALL',          // Par défaut : tout afficher
    sortBy: 'newest',          // Par défaut : les plus récents
    maxPrice: 15500,           // Par défaut : prix max à fond
  });

  // ---- FONCTION DE MISE À JOUR DES FILTRES ----
  // Partial<ProductFilters> = on peut passer un seul filtre
  // Le spread (...) fusionne l'ancien état avec le nouveau
  const handleFilterChange = (newFilters: Partial<productFilters>) => {
    setFilters((prev: productFilters) => ({ ...prev, ...newFilters }));
    // Exemple : si on passe { category: 'ROBE' }
    // le résultat sera { category: 'ROBE', sortBy: 'newest', maxPrice: 15500 }
  };

  // ---- PRIX MAX PARMI TOUS LES PRODUITS ----
  // Pour définir la limite haute du slider
  const maxProductPrice = Math.max(...catalog.map((p) => p.prix), 1000);

  // ---- FILTRAGE ET TRI DES PRODUITS ----
  // useMemo = ce calcul ne se refait QUE si filters ou le catalogue changent
  // Sinon React réutilise le résultat précédent (optimisation)
  const filteredProducts = useMemo(() => {
    // Étape 1 : copier le tableau (pour ne pas modifier l'original)
    let result = [...catalog];

    // Étape 2 : filtrer par catégorie
    if (filters.category !== 'ALL') {
      const categoryKey = filters.category as keyof typeof ProductCategory;
      result = result.filter((p) => p.category === ProductCategory[categoryKey]);
    }

    // Étape 3 : filtrer par prix max
    result = result.filter((p) => p.prix <= filters.maxPrice);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Étape 4 : trier selon le choix
    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => a.prix - b.prix);
    } else if (filters.sortBy === 'price-desc') {
      result.sort((a, b) => b.prix - a.prix);
    } else if (filters.sortBy === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filters.sortBy === 'oldest') {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (filters.sortBy === 'popular') {
      result.sort((a, b) => {
        const fa = a.featured ? 1 : 0;
        const fb = b.featured ? 1 : 0;
        if (fb !== fa) return fb - fa;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    return result;
  }, [filters, catalog, searchQuery]);

  return (
    <>
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        maxProductPrice={maxProductPrice}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 lg:px-6">
        <p className="text-xs text-neutral-500">
          <span className="font-semibold text-neutral-400">{filteredProducts.length}</span> pièce
          {filteredProducts.length > 1 ? 's' : ''}
          {searchQuery.trim() ? ' — filtrées par ta recherche' : ''}
        </p>
      </div>

      <main
        id="feed"
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 bg-[#050505] px-3 pb-8 sm:gap-4 sm:px-4 sm:pb-10 md:grid-cols-3 md:gap-5 lg:px-6"
      >
        {/* Si aucun produit ne correspond aux filtres */}
        {filteredProducts.length === 0 ? (
          <div
            className="col-span-2 py-16 text-center sm:py-20 md:col-span-3"
            style={{ color: '#888', fontSize: '14px' }}
          >
            <Search
              className="mx-auto mb-4 h-12 w-12 text-neutral-600"
              strokeWidth={1.25}
              aria-hidden
            />
            <p>Aucun produit trouvé pour ces filtres</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="min-w-0">
              <ProductCard product={product} />
            </div>
          ))
        )}
      </main>
    </>
  );
};

export default FouillePage;