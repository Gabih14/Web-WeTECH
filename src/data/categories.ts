import { Category } from '../types';

export const categories: Category[] = [
  {
    name: 'Filamentos',
    id: 'FILAMENTOS',
    subcategories: [
      { name: 'PLA', id: 'pla' },
      { name: 'Técnicos', id: 'tecnicos' }
    ]
  },
  {
    name: 'Impresoras 3D',
    id: 'impresoras',
    subcategories: [
      { name: 'Filamento', id: 'filamento' },
      { name: 'Resina', id: 'resina' }
    ]
  },
  {
    name: 'Repuestos',
    id: 'repuestos'
  }
];