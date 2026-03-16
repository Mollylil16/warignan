// ============================================================
// Données fictives (mock data) pour tester le frontend
// SANS le backend. On remplacera ça plus tard par de vraies
// requêtes API avec React Query.
// ============================================================

import { Product, ProductCategory, ProductStatus } from '../types';

// Tableau de produits fictifs qui simule ce que l'API retournera
export const mockProducts: Product[] = [
  {
    id: '1',
    code: '#R-042',
    nom: 'Robe Soie Vintage Y2K',
    description: 'Superbe robe en soie vintage années 2000',
    prix: 12500,
    category: ProductCategory.ROBE,
    status: ProductStatus.DISPONIBLE,
    // stock à 1 = on affichera "Dernier !"
    stock: 1,
    imageName: [
      'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    code: '#C-881',
    nom: 'Crocs Classic Yellow (T.41)',
    description: 'Crocs classiques jaunes taille 41',
    prix: 3500,
    category: ProductCategory.CROP,
    status: ProductStatus.DISPONIBLE,
    stock: 3,
    imageName: [
      'https://images.pexels.com/photos/10321101/pexels-photo-10321101.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    code: '#R-019',
    nom: 'Maxi Robe Fleurie Été',
    description: 'Maxi robe fleurie pour l\'été',
    prix: 8000,
    category: ProductCategory.ROBE,
    // Ce produit est réservé → les boutons seront désactivés
    status: ProductStatus.RESERVER,
    stock: 1,
    imageName: [
      'https://images.pexels.com/photos/1852382/pexels-photo-1852382.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '4',
    code: '#C-212',
    nom: 'Crocs Rose Poudré (T.38)',
    description: 'Crocs rose poudré taille 38',
    prix: 2500,
    category: ProductCategory.CROP,
    status: ProductStatus.DISPONIBLE,
    stock: 2,
    imageName: [
      'https://images.pexels.com/photos/10321105/pexels-photo-10321105.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '5',
    code: '#R-057',
    nom: 'Robe Wrap Fleurie',
    description: 'Robe wrap à motif fleuri',
    prix: 9500,
    category: ProductCategory.ROBE,
    status: ProductStatus.DISPONIBLE,
    stock: 2,
    imageName: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '6',
    code: '#R-033',
    nom: 'Robe Noire Élégante',
    description: 'Robe noire élégante',
    prix: 15500,
    category: ProductCategory.ROBE,
    status: ProductStatus.DISPONIBLE,
    stock: 1,
    imageName: [
      'https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-12T10:00:00Z',
  },
];