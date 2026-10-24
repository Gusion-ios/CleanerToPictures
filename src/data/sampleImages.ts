import { ImageItem, Folder } from '../types';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'folder-favorites',
    name: 'Favoritas & Destacadas',
    color: '#f59e0b', // Amber
    icon: 'star',
    isDefault: false,
    createdAt: '2026-10-20',
  },
  {
    id: 'folder-trips',
    name: 'Viajes & Paisajes',
    color: '#06b6d4', // Cyan
    icon: 'compass',
    isDefault: true, // Default target folder for quick swipe right
    createdAt: '2026-10-20',
  },
  {
    id: 'folder-work',
    name: 'Trabajo & Proyectos',
    color: '#8b5cf6', // Violet
    icon: 'briefcase',
    isDefault: false,
    createdAt: '2026-10-21',
  },
  {
    id: 'folder-personal',
    name: 'Familia & Amigos',
    color: '#ec4899', // Pink
    icon: 'heart',
    isDefault: false,
    createdAt: '2026-10-22',
  },
  {
    id: 'folder-documents',
    name: 'Documentos & Facturas',
    color: '#10b981', // Emerald
    icon: 'file-text',
    isDefault: false,
    createdAt: '2026-10-23',
  },
];

export const INITIAL_IMAGES: ImageItem[] = [
  {
    id: 'img-1',
    name: 'Puesta_de_Sol_Montana_4K.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 4820000, // ~4.8 MB
    width: 3840,
    height: 2160,
    date: '2026-09-14 19:42',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-2',
    name: 'Captura_Pantalla_Error_Borrable.png',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 2150000, // ~2.1 MB
    width: 1920,
    height: 1080,
    date: '2026-10-02 11:15',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-3',
    name: 'Cafe_Manana_Brunch.jpg',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 3410000, // ~3.4 MB
    width: 2800,
    height: 1860,
    date: '2026-10-10 09:30',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-4',
    name: 'Foto_Movida_Desenfocada_Descarte.jpg',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 5670000, // ~5.6 MB
    width: 4000,
    height: 3000,
    date: '2026-09-28 22:10',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-5',
    name: 'Playa_Tropical_Aguas_Cristalinas.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 6240000, // ~6.2 MB
    width: 4200,
    height: 2800,
    date: '2026-08-19 14:05',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-6',
    name: 'Recibo_Supermercado_Temporal.jpg',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 1890000, // ~1.8 MB
    width: 2400,
    height: 3200,
    date: '2026-10-18 16:22',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-7',
    name: 'Reunion_Equipo_Oficina.jpg',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 4120000, // ~4.1 MB
    width: 3600,
    height: 2400,
    date: '2026-10-05 10:45',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-8',
    name: 'Meme_Chat_Duplicado.jpg',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 1450000, // ~1.4 MB
    width: 1400,
    height: 1400,
    date: '2026-10-12 18:03',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-9',
    name: 'Ruta_Senderismo_Bosque.jpg',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 5320000, // ~5.3 MB
    width: 3900,
    height: 2600,
    date: '2026-09-02 11:20',
    isDeleted: false,
    isFavorite: false,
  },
  {
    id: 'img-10',
    name: 'Boceto_Notas_Pizarra.jpg',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80',
    sizeBytes: 2980000, // ~2.9 MB
    width: 2900,
    height: 1900,
    date: '2026-10-14 15:30',
    isDeleted: false,
    isFavorite: false,
  },
];
