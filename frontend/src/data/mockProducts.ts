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
      '/images/WhatsApp%20Image%202026-03-28%20at%2023.01.00.jpeg',
      'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    code: '#C-881',
    nom: 'Crop Classic Yellow (T.41)',
    description: 'Crop classiques jaunes taille 41',
    prix: 3500,
    category: ProductCategory.CROP,
    status: ProductStatus.DISPONIBLE,
    stock: 3,
    imageName: [
      'https://images.pexels.com/photos/10321101/pexels-photo-10321101.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/10321105/pexels-photo-10321105.jpeg?auto=compress&cs=tinysrgb&w=800',
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
    nom: 'Crop Rose Poudré (T.38)',
    description: 'Crop rose poudré taille 38',
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
  {
    id: '7',
    code: '#C-301',
    nom: 'Crop Denim Bleu (T.40)',
    description: 'Crop denim bleu taille 40',
    prix: 4200,
    category: ProductCategory.CROP,
    status: ProductStatus.DISPONIBLE,
    stock: 4,
    imageName: [
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-19T10:00:00Z',
  },
  {
    id: '8',
    code: '#R-088',
    nom: 'Robe Cocktail Satin',
    description: 'Robe cocktail en satin',
    prix: 11000,
    category: ProductCategory.ROBE,
    status: ProductStatus.DISPONIBLE,
    stock: 2,
    imageName: [
      'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '9',
    code: '#C-445',
    nom: 'Crop Lin Blanc (T.39)',
    description: 'Crop lin blanc taille 39',
    prix: 2800,
    category: ProductCategory.CROP,
    status: ProductStatus.DISPONIBLE,
    stock: 5,
    imageName: [
      'https://images.pexels.com/photos/6311666/pexels-photo-6311666.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    createdAt: '2024-01-21T10:00:00Z',
  },
];