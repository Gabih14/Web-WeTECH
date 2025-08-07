import { Product } from '../types/types';
import Amarillo from '../assets/GST-AMARILLO-700x700.png';
import AmarilloFluor from '../assets/GST-AMARILLO-FLUOR-700x700.png';
import Blanco from '../assets/Grilo_pla_blanco-1.jpeg';
import Piel from '../assets/Grilon_pla_piel.jpeg'; 
import impresora3D from '../assets/CR6 S.png';
import repuesto from '../assets/racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: '3N3 PLA standart',
    description: 'Filamento PLA de alta calidad, 1.75mm, precisión dimensional +/- 0.02mm',
    image: Amarillo,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [
      { weight: 0.5, price: 10234, promotionalPrice: 8699 },
      { weight: 1, price: 18470, promotionalPrice: 15699 }
    ],
    discountQuantity: {
      5: 0.17,
      10: 0.20,
      50: 0.22
    },
    colors: [
      { name: 'Blanco', hex: '#FFFFFF', stock: { '1': 100, '0.5': 5} },
      { name: 'Negro', hex: '#000000', stock: { '1': 8, '0.5': 4} },
      { name: 'Rojo', hex: '#FF0000', stock: { '1': 12, '0.5': 6} },
      { name: 'Azul', hex: '#0000FF', stock: { '1': 7, '0.5': 3} },
      { name: 'Verde', hex: '#00FF00', stock: { '1': 9, '0.5': 4} },
      { name: 'Amarillo', hex: '#FFFF00', stock: { '1': 11, '0.5': 5} }
    ]
  },
  {
    id: '2',
    name: '3N3 PETG',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    image: AmarilloFluor,
    category: 'filamentos',
    subcategory: 'tecnicos',
    weights: [
      { weight: 1, price: 16117, promotionalPrice:13699}
    ],
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
    price: 279999,
    promotionalPrice:237999.15,
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
    promotionalPrice:1105405,
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
    name: 'Grilon3 PETG',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    image: Blanco,
    category: 'filamentos',
    subcategory: 'tecnicos',
    weights: [
      { weight: 1, price: 19764, promotionalPrice: 16799 },
      { weight: 4, price: 63058, promotionalPrice: 53599 },
  
    ],
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF', stock: {  '4': 5, '1': 40 } },
      { name: 'Negro', hex: '#000000', stock: { '4': 4, '1': 1 } },
      { name: 'Azul', hex: '#0000FF', stock: { '4': 3, '1': 1 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '4': 3, '1': 1 } }
    ]
  },
  {
    id: '7',
    name: 'GRILON3 PLA Premium',
    description: 'Filamento PETG resistente al calor y químicos, ideal para piezas funcionales',
    image: Piel,
    category: 'filamentos',
    subcategory: 'pla',
    weights: [
      { weight: 1, price: 18822.35, promotionalPrice: 15998.99 }
    ],
    discountQuantity: {
      5: 0.17,
      10: 0.20,
      50: 0.22
    },
    colors: [
      { name: 'Translúcido', hex: '#FFFFFF', stock: { '1': 10 } },
      { name: 'Negro', hex: '#000000', stock: { '1': 8 } },
      { name: 'Azul', hex: '#0000FF', stock: { '1': 7 } },
      { name: 'Rojo', hex: '#FF0000', stock: { '1': 6 } }
    ]
  }
];