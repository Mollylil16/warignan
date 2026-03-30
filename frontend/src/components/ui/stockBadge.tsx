

import { ProductStatus } from '../../types';

// Interface des props (paramètres) que ce composant accepte
interface StockBadgeProps {
  status: ProductStatus; // Le statut du produit
  stock: number;         // La quantité en stock
}

const StockBadge = ({ status, stock }: StockBadgeProps) => {
  // On calcule le contenu et le style du badge selon le statut

  if (status === ProductStatus.RESERVER) {
    // Produit réservé : badge orange
    return (
      <div className="absolute right-2 top-2 z-20 rounded border border-orange-500 bg-orange-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-orange-400 backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
        Réservé
      </div>
    );
  }

  if (status === ProductStatus.SOLD) {
    // Produit vendu : badge gris
    return (
      <div className="absolute right-2 top-2 z-20 rounded border border-gray-500 bg-gray-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gray-400 backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
        Vendu
      </div>
    );
  }

  // Produit disponible : on vérifie le stock
  if (stock === 1) {
    // Stock = 1 → "Dernier !" avec animation clignotante
    return (
      <div className="absolute right-2 top-2 z-20 rounded border px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs"
        style={{
          // Style inline car l'animation custom ne peut pas être faite en Tailwind pur
          background: 'rgba(255, 0, 0, 0.2)',
          borderColor: '#FF0000',
          animation: 'flashBorder 1s infinite',
        }}
      >
        Dernier !
      </div>
    );
  }

  // Stock normal : badge vert "Disponible"
  return (
    <div className="absolute right-2 top-2 z-20 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs"
      style={{
        background: 'rgba(0, 255, 85, 0.15)',
        border: '1px solid #00FF55',
        color: '#00FF55',
      }}
    >
      Disponible
    </div>
  );
};

export default StockBadge;