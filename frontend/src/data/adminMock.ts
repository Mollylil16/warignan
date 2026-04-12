/** Données fictives espace admin — remplacées par l’API. */

export interface MockAdminUser {
  id: string;
  email: string;
  role: 'admin' | 'vendeuse' | 'livreur';
  displayName: string;
  active: boolean;
  lastLogin: string;
}

export const mockAdminUsers: MockAdminUser[] = [
  {
    id: 'u1',
    email: 'admin@warignan.shop',
    role: 'admin',
    displayName: 'Admin principal',
    active: true,
    lastLogin: '2026-04-11T09:00:00',
  },
  {
    id: 'u2',
    email: 'vendeuse@warignan.shop',
    role: 'vendeuse',
    displayName: 'Fatou — vendeuse',
    active: true,
    lastLogin: '2026-04-11T08:30:00',
  },
  {
    id: 'u3',
    email: 'livreur.kouassi@warignan.shop',
    role: 'livreur',
    displayName: 'Kouassi',
    active: true,
    lastLogin: '2026-04-10T18:00:00',
  },
  {
    id: 'u4',
    email: 'archive@warignan.shop',
    role: 'vendeuse',
    displayName: 'Compte archivé',
    active: false,
    lastLogin: '2026-01-15T12:00:00',
  },
];
