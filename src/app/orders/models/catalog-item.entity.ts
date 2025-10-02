export interface CatalogItem {
  id: string;
  name: string;
  varietal: string;
  vintage: number;
  origin: string;
  price: number;
  imageUrl?: string;
  tastingNotes?: string;
}

export const MOCK_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'cab-2018',
    name: 'Gran Reserva Cabernet Sauvignon',
    varietal: 'Cabernet Sauvignon',
    vintage: 2018,
    origin: 'Napa Valley, USA',
    price: 58,
    imageUrl: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4',
    tastingNotes: 'Notas de cassis, vainilla y roble tostado con taninos redondos.'
  },
  {
    id: 'mal-2019',
    name: 'Alturas Andinas Malbec',
    varietal: 'Malbec',
    vintage: 2019,
    origin: 'Mendoza, Argentina',
    price: 42,
    imageUrl: 'https://images.unsplash.com/photo-1543248986-42142f9b6043',
    tastingNotes: 'Frutos rojos maduros, especias dulces y final persistente.'
  },
  {
    id: 'cha-2020',
    name: 'Costa Dorada Chardonnay',
    varietal: 'Chardonnay',
    vintage: 2020,
    origin: 'Casablanca, Chile',
    price: 36,
    imageUrl: 'https://images.unsplash.com/photo-1514533450685-26ef7784906e',
    tastingNotes: 'Aromas cítricos, mantequilla fresca y delicado tostado.'
  },
  {
    id: 'tem-2017',
    name: 'Viña Antigua Tempranillo',
    varietal: 'Tempranillo',
    vintage: 2017,
    origin: 'Rioja, España',
    price: 49,
    imageUrl: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c',
    tastingNotes: 'Ciruelas maduras, tabaco y notas de cuero envejecido.'
  },
  {
    id: 'ros-2022',
    name: 'Rosé Mediterráneo',
    varietal: 'Grenache',
    vintage: 2022,
    origin: 'Provenza, Francia',
    price: 24,
    imageUrl: 'https://images.unsplash.com/photo-1527169402991-3546847d86be',
    tastingNotes: 'Refrescante, floral y con un delicado toque mineral.'
  }
];
