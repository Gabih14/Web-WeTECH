import { Product } from '../types';
import Amarillo from '../assets/GST-AMARILLO-700x700.png';
import AmarilloFluor from '../assets/GST-AMARILLO-FLUOR-700x700.png';
import Blanco from '../assets/Grilo_pla_blanco-1.jpeg';
import Piel from '../assets/Grilon_pla_piel.jpeg'; 
export const products: Product[] = [
  {
    id: '1',
    name: 'PLA Premium Filamento 1kg',
    description: 'Filamento PLA de alta calidad, 1.75mm, precisión dimensional +/- 0.02mm',
    price: 24.99,
    image: Amarillo,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [1, 2.5, 4],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Rojo', hex: '#FF0000' },
      { name: 'Azul', hex: '#0000FF' },
      { name: 'Verde', hex: '#00FF00' },
      { name: 'Amarillo', hex: '#FFFF00' }
    ]
  },
  {
    id: '2',
    name: 'PETG Filamento Técnico 1kg',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    price: 29.99,
    image: AmarilloFluor,
    category: 'filamentos',
    subcategory: 'tecnicos',
    weights: [1],
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Azul', hex: '#0000FF' },
      { name: 'Rojo', hex: '#FF0000' }
    ]
  },
  {
    id: '3',
    name: 'Ender 3 V2 - Kit Completo',
    description: 'Impresora 3D FDM con curso de uso y armado incluido. Perfecta para principiantes.',
    price: 279.99,
    image: 'https://images.unsplash.com/photo-1615947914112-73cd3529b0cf',
    category: 'impresoras',
    subcategory: 'filamento'
  },
  {
    id: '4',
    name: 'Elegoo Mars 3 Pro',
    description: 'Impresora 3D de resina con alta precisión. Incluye curso de uso.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6',
    category: 'impresoras',
    subcategory: 'resina'
  },
  {
    id: '5',
    name: 'Hotend E3D V6',
    description: 'Hotend de alta calidad para impresoras FDM',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1631749352438-7d576312185d',
    category: 'repuestos'
  },
  {
    id: '6',
    name: 'PETG Filamento Técnico 1kg',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    price: 29.99,
    image: Blanco,
    category: 'filamentos',
    subcategory: 'tecnicos',
    weights: [0.250, 0.500, 1],
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Azul', hex: '#0000FF' },
      { name: 'Rojo', hex: '#FF0000' }
    ]
  },
  {
    id: '7',
    name: 'GRILON3 PLA Boutique 1kg',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    price: 29.99,
    image: Piel,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [2],
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF' },
      { name: 'Negro', hex: '#000000' },
      { name: 'Azul', hex: '#0000FF' },
      { name: 'Rojo', hex: '#FF0000' }
    ]
  }
];