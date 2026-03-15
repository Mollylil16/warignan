import { Product, ProductCategory, ProductStatus, productFilters } from "../types";

// Liste de tes 30 images (à adapter selon tes vrais noms de fichiers)
const imageFiles = [
    'robe-soiree-1.webp',
    'robe-soiree-2.webp',
    'robe-soiree-3.webp',
    'robe-fleurie-1.jpg',
    'robe-fleurie-2.jpg',
    'robe-fleurie-3.jpg',
    'robe-cocktail-1.jpg',
    'robe-cocktail-2.jpg',
    'robe-longue-1.jpg',
    'robe-longue-2.jpg',
    'robe-courte-1.jpg',
    'robe-courte-2.jpg',
    'robe-boheme-1.jpg',
    'robe-boheme-2.jpg',
    'robe-chic-1.jpg',
    'crop-top-white-1.png',
    'crop-top-white-2.png',
    'crop-top-black-1.jpg',
    'crop-top-black-2.jpg',
    'crop-top-beige-1.jpg',
    'crop-top-beige-2.jpg',
    'crop-top-rose-1.jpg',
    'crop-top-rose-2.jpg',
    'crop-top-imprime-1.jpg',
    'crop-top-imprime-2.jpg',
    'crop-top-satin-1.jpg',
    'crop-top-satin-2.jpg',
    'crop-top-coton-1.jpg',
    'crop-top-coton-2.jpg',
    'crop-top-lace-1.jpg'
];

// Noms de produits pour les robes
const robeNames = [
    'Robe de soirée élégante',
    'Robe fleurie bohème',
    'Robe portefeuille chic',
    'Robe cocktail tendance',
    'Robe longue cérémonie',
    'Robe courte décontractée',
    'Robe bohème été',
    'Robe satin soirée',
    'Robe dentelle romantique',
    'Robe minimaliste',
    'Robe patineuse colorée',
    'Robe trapèze casual',
    'Robe cache-cœur',
    'Robe chemise oversize',
    'Robe plissée'
];

// Noms de produits pour les crop tops
const cropTopNames = [
    'Crop top blanc basique',
    'Crop top noir tendance',
    'Crop top beige doux',
    'Crop top rose pastel',
    'Crop top imprimé fleuri',
    'Crop top satiné',
    'Crop top coton bio',
    'Crop top à volants',
    'Crop top asymétrique',
    'Crop top noué',
    'Crop top manches longues',
    'Crop top rayé marin',
    'Crop top résille',
    'Crop top sportswear',
    'Crop top cérémonie'
];

// Fonction pour générer un code produit unique
const generateProductCode = (category: ProductCategory, index: number): string => {
    const prefix = category === ProductCategory.ROBE ? 'RB' : 'CT';
    return `${prefix}-${String(index + 1).padStart(4, '0')}`;
};

// Fonction pour générer une date aléatoire dans les 3 derniers mois
const getRandomDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    return date.toISOString();
};

// Fonction pour générer une description selon la catégorie
const generateDescription = (nom: string, category: ProductCategory): string => {
    if (category === ProductCategory.ROBE) {
        const descriptions = [
            "Parfaite pour toutes vos occasions spéciales. Allie confort et élégance.",
            "Un véritable coup de cœur ! La pièce incontournable de votre garde-robe.",
            "Sublime votre silhouette avec sa coupe flatteuse et ses finitions soignées.",
            "Idéale pour un look sophistiqué ou décontracté selon vos accessoires.",
            "Confectionnée avec des matériaux de qualité pour un confort absolu."
        ];
        return `${nom} - ${descriptions[Math.floor(Math.random() * descriptions.length)]}`;
    } else {
        const descriptions = [
            "La pièce tendance de la saison. Parfait pour un look casual chic.",
            "Se marie facilement avec tous vos bas. Indispensable du dressing.",
            "Confortable et stylé pour toutes vos journées, du bureau aux sorties.",
            "Coton doux et coupe moderne pour un rendu parfait.",
            "Idéal pour superposer ou porter seul selon les occasions."
        ];
        return `${nom} - ${descriptions[Math.floor(Math.random() * descriptions.length)]}`;
    }
};

// Création des produits
export const mockProducts: Product[] = [];

// Ajout des robes (15 produits)
robeNames.forEach((nom, index) => {
    const prix = Math.floor(Math.random() * 150000) + 35000; // 35k - 185k FCFA
    const statusRandom = Math.random();
    
    let status: ProductStatus;
    if (statusRandom > 0.9) {
        status = ProductStatus.SOLD;
    } else if (statusRandom > 0.7) {
        status = ProductStatus.RESERVER;
    } else {
        status = ProductStatus.DISPONIBLE;
    }
    
    // Pour les produits SOLD, le stock est à 0
    const stock = status === ProductStatus.SOLD ? 0 : Math.floor(Math.random() * 20) + 1;
    
    mockProducts.push({
        id: (index + 1).toString(),
        code: generateProductCode(ProductCategory.ROBE, index),
        nom: nom,
        description: generateDescription(nom, ProductCategory.ROBE),
        prix: Math.round(prix / 1000) * 1000, // Arrondi au millier
        category: ProductCategory.ROBE,
        status: status,
        createdAt: getRandomDate(),
        imageName: [imageFiles[index % 15]], // Une image par produit pour commencer
        stock: stock
    });
});

// Ajout des crop tops (15 produits)
cropTopNames.forEach((nom, index) => {
    const prix = Math.floor(Math.random() * 50000) + 12000; // 12k - 62k FCFA
    const statusRandom = Math.random();
    
    let status: ProductStatus;
    if (statusRandom > 0.9) {
        status = ProductStatus.SOLD;
    } else if (statusRandom > 0.7) {
        status = ProductStatus.RESERVER;
    } else {
        status = ProductStatus.DISPONIBLE;
    }
    
    const stock = status === ProductStatus.SOLD ? 0 : Math.floor(Math.random() * 25) + 1;
    
    mockProducts.push({
        id: (index + 16).toString(),
        code: generateProductCode(ProductCategory.CROP, index),
        nom: nom,
        description: generateDescription(nom, ProductCategory.CROP),
        prix: Math.round(prix / 1000) * 1000,
        category: ProductCategory.CROP,
        status: status,
        createdAt: getRandomDate(),
        imageName: [imageFiles[(index % 15) + 15]], // Utilise les images 16-30
        stock: stock
    });
});

// Fonction pour filtrer les produits selon les filtres
export const filterProducts = (
    products: Product[], 
    filters: productFilters
): Product[] => {
    return products.filter(product => {
        // Filtre par catégorie
        if (filters.category !== 'ALL') {
            const category = filters.category === 'ROBE' 
                ? ProductCategory.ROBE 
                : ProductCategory.CROP;
            if (product.category !== category) return false;
        }
        
        // Filtre par prix maximum
        if (product.prix > filters.maxPrice) return false;
        
        return true;
    }).sort((a, b) => {
        // Tri
        switch (filters.sortBy) {
            case 'price-asc':
                return a.prix - b.prix;
            case 'price-desc':
                return b.prix - a.prix;
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'popular':
                // Simulé par le stock (plus le stock est bas, plus c'est populaire)
                return a.stock - b.stock;
            default:
                return 0;
        }
    });
};

// Fonctions utilitaires
export const getProductById = (id: string): Product | undefined => {
    return mockProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: ProductCategory): Product[] => {
    return mockProducts.filter(product => product.category === category);
};

export const getRobes = (): Product[] => {
    return mockProducts.filter(product => product.category === ProductCategory.ROBE);
};

export const getCropTops = (): Product[] => {
    return mockProducts.filter(product => product.category === ProductCategory.CROP);
};

export const getAvailableProducts = (): Product[] => {
    return mockProducts.filter(product => product.status === ProductStatus.DISPONIBLE);
};

export const getReservedProducts = (): Product[] => {
    return mockProducts.filter(product => product.status === ProductStatus.RESERVER);
};

export const getSoldProducts = (): Product[] => {
    return mockProducts.filter(product => product.status === ProductStatus.SOLD);
};

export const getNewArrivals = (days: number = 30): Product[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return mockProducts.filter(product => 
        new Date(product.createdAt) >= cutoffDate
    );
};

export const searchProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return mockProducts.filter(product => 
        product.nom.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm)
    );
};

// Statistiques
export const getStats = () => {
    const total = mockProducts.length;
    const robes = getRobes().length;
    const crops = getCropTops().length;
    const disponibles = getAvailableProducts().length;
    const reserves = getReservedProducts().length;
    const sold = getSoldProducts().length;
    
    const prixMoyen = Math.round(
        mockProducts.reduce((acc, p) => acc + p.prix, 0) / total
    );
    
    const stockTotal = mockProducts.reduce((acc, p) => acc + p.stock, 0);
    
    return {
        total,
        robes,
        crops,
        disponibles,
        reserves,
        sold,
        prixMoyen,
        stockTotal
    };
};

// Export par défaut pour faciliter l'import
export default mockProducts;