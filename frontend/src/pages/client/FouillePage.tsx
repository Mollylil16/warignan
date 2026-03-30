

import { useState, useMemo } from 'react';
// useState = pour stocker et modifier des données réactives
// useMemo = pour mémoriser un calcul coûteux (éviter de recalculer à chaque rendu)

import { productFilters, ProductCategory } from '../../types';
import { mockProducts } from '../../data/mockProducts';
import HeroSection from '../../components/shared/heroSection';
import FilterBar from '../../components/shared/StatusBadge';
import ProductCard from '../../components/shared/ProductCard';

const FouillePage = () => {
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
  const maxProductPrice = Math.max(...mockProducts.map((p) => p.prix)); // 15500

  // ---- FILTRAGE ET TRI DES PRODUITS ----
  // useMemo = ce calcul ne se refait QUE si filters ou mockProducts changent
  // Sinon React réutilise le résultat précédent (optimisation)
  const filteredProducts = useMemo(() => {
    // Étape 1 : copier le tableau (pour ne pas modifier l'original)
    let result = [...mockProducts];

    // Étape 2 : filtrer par catégorie
    if (filters.category !== 'ALL') {
      const categoryKey = filters.category as keyof typeof ProductCategory;
      result = result.filter((p) => p.category === ProductCategory[categoryKey]);
    }

    // Étape 3 : filtrer par prix max
    result = result.filter((p) => p.prix <= filters.maxPrice);

    // Étape 4 : trier selon le choix
    if (filters.sortBy === 'price-asc') {
      // sort() avec comparateur → ordre croissant de prix
      result.sort((a, b) => a.prix - b.prix);
    } else if (filters.sortBy === 'newest') {
      // Tri par date décroissante (plus récent en premier)
      // new Date() convertit la string ISO en objet Date comparable
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    // 'popular' → on garde l'ordre par défaut (on n'a pas de données de popularité)

    return result;
  }, [filters]); // Dépendances : recalculer si filters change

  return (
    // Fragment <> </> = wrapper invisible (pas de div inutile dans le DOM)
    <>
      {/* Section héro avec badge LIVE et CTA */}
      <HeroSection />

      {/* Barre de filtres sticky */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        maxProductPrice={maxProductPrice}
      />

      {/* ---- CATALOGUE PRODUITS (grille 3 × 3) ---- */}
      {/* id="feed" permet le scroll depuis le bouton CTA */}
      <main
        id="feed"
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px px-2 pb-6 sm:gap-1 sm:px-4 sm:pb-8 md:grid-cols-3 md:gap-2 lg:px-6"
        style={{
          background: '#2A2A2A',
        }}
      >
        {/* Si aucun produit ne correspond aux filtres */}
        {filteredProducts.length === 0 ? (
          <div
            className="col-span-2 py-16 text-center sm:py-20 md:col-span-3"
            style={{ color: '#888', fontSize: '14px' }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
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