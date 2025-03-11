import { Product } from '../types';
import Amarillo from '../assets/GST-AMARILLO-700x700.png';
import AmarilloFluor from '../assets/GST-AMARILLO-FLUOR-700x700.png';
import Blanco from '../assets/Grilo_pla_blanco-1.jpeg';
import Piel from '../assets/Grilon_pla_piel.jpeg'; 
import impresora3D from '../assets/CR6 S.png';
import repuesto from '../assets/racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'PLA Premium Filamento 1kg',
    description: 'Filamento PLA de alta calidad, 1.75mm, precisión dimensional +/- 0.02mm',
    price: 24.99,
    promotionalPrice: 19.99, // Añadir precio promocional
    image: Amarillo,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [1, 2.5, 4],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF', stock: { '1': 10, '2.5': 5, '4': 2 } },
      { name: 'Negro', hex: '#000000', stock: { '1': 8, '2.5': 4, '4': 1 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '1': 12, '2.5': 6, '4': 3 } },
      { name: 'Azul', hex: '#0000FF', stock: { '1': 7, '2.5': 3, '4': 1 } },
      { name: 'Verde', hex: '#00FF00', stock: { '1': 9, '2.5': 4, '4': 2 } },
      { name: 'Amarillo', hex: '#FFFF00', stock: { '1': 11, '2.5': 5, '4': 2 } }
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
      { name: 'Translúcido', hex: '#FFFFFF', stock: { '1': 10 } },
      { name: 'Negro', hex: '#000000', stock: { '1': 8 } },
      { name: 'Azul', hex: '#0000FF', stock: { '1': 7 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '1': 6 } }
    ]
  },
  {
    id: '3',
    name: 'Ender 3 V2 - Kit Completo',
    description: 'Impresora 3D FDM con curso de uso y armado incluido. Perfecta para principiantes.',
    price: 279.99,
    image: impresora3D,
    category: 'impresoras',
    subcategory: 'filamento',
    stock: 5 
  },
  {
    id: '4',
    name: 'Elegoo Mars 3 Pro',
    description: 'Impresora 3D de resina con alta precisión. Incluye curso de uso.',
    price: 1300500,
    image: impresora3D,
    category: 'impresoras',
    subcategory: 'resina',
    stock: 3 // Añadir stock para impresoras
  },
  {
    id: '5',
    name: 'Hotend E3D V6',
    description: 'Hotend de alta calidad para impresoras FDM',
    price: 59.99,
    image: repuesto,
    category: 'repuestos',
    stock: 20 // Añadir stock para repuestos
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
      { name: 'Translúcido', hex: '#FFFFFF', stock: { '0.250': 10, '0.500': 5, '1': 2 } },
      { name: 'Negro', hex: '#000000', stock: { '0.250': 8, '0.500': 4, '1': 1 } },
      { name: 'Azul', hex: '#0000FF', stock: { '0.250': 7, '0.500': 3, '1': 1 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '0.250': 6, '0.500': 3, '1': 1 } }
    ]
  },
  {
    id: '7',
    name: 'GRILON3 PLA Boutique 1kg',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    price: 29.99,
    promotionalPrice: 24.99, // Añadir precio promocional
    image: Piel,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [2],
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF', stock: { '2': 10 } },
      { name: 'Negro', hex: '#000000', stock: { '2': 8 } },
      { name: 'Azul', hex: '#0000FF', stock: { '2': 7 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '2': 6 } }
    ]
  }
];