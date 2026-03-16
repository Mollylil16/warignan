
export const formatPrice = (price: number): string => {
    // toLocaleString('fr-FR') ajoute automatiquement les espaces comme séparateurs
    // Exemple: 12500 → "12 500"
    return `${price.toLocaleString('fr-FR')} FCFA`;
  };
  
  /**
   * Formate le prix en deux parties séparées (pour l'affichage stylisé)
   * Exemple : formatPriceParts(12500) → { amount: "12 500", currency: "FCFA" }
   */
  export const formatPriceParts = (price: number) => {
    return {
      amount: price.toLocaleString('fr-FR'), // "12 500"
      currency: 'FCFA',                       // "FCFA"
    };
  };