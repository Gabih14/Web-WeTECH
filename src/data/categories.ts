import { Category } from '../types';

export const categories: Category[] = [
  {
    name: 'FILAMENTOS',
    id: 'FILAMENTOS',
    subcategories: [
      { name: 'PLA', id: 'pla' },
      { name: '3N3', id: '3n3' },
      { name: 'Técnicos', id: 'tecnicos' }
    ]
  },
  {
    name: 'Impresoras 3D',
    id: 'impresoras 3d',
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