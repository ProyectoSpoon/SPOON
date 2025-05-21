// src/app/dashboard/carta/components/detalles-producto/selector-imagen/types.ts
export interface ImagenGaleria {
    id: string;
    url: string;
    thumbnail: string;
    categoria: string;
    tags: string[];
    dimensiones: {
      ancho: number;
      alto: number;
    };
    tamaño: number;
    formato: string;
    fechaSubida: string;
    favorito: boolean;
  }
  
  export interface FiltrosGaleria {
    categoria: string | null;
    orientacion: 'todas' | 'horizontal' | 'vertical' | 'cuadrada';
    ordenar: 'recientes' | 'antiguos' | 'alfabetico' | 'tamaño';
    favoritos: boolean;
  }
  
  // src/app/dashboard/carta/components/detalles-producto/selector-imagen/GaleriaSpoon.tsx
  import { useState, useEffect } from 'react';
  import { Input } from '@/shared/components/ui/Input';
  import { Button } from '@/shared/components/ui/Button';
  import { cn } from '@/lib/utils';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/shared/components/ui/Select';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/shared/components/ui/DropdownMenu';
  import { 
    Search, 
    Filter, 
    Heart, 
    Image as ImageIcon, 
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Star,
    StarOff,
    Download,
    X
  } from 'lucide-react';
  import type { ImagenGaleria, FiltrosGaleria } from './types';
  
  interface GaleriaSpoonProps {
    onSelect: (imageUrl: string) => void;
    imagenSeleccionada?: string;
  }
  
  // Datos de ejemplo
  const CATEGORIAS = [
    'Todas',
    'Platos principales',
    'Entradas',
    'Postres',
    'Bebidas',
    'Ingredientes',
  ];
  
  const MOCK_IMAGES: ImagenGaleria[] = Array.from({ length: 20 }, (_, i) => ({
    id: `img-${i + 1}`,
    url: `/api/placeholder/400/300`,
    thumbnail: `/api/placeholder/200/150`,
    categoria: CATEGORIAS[Math.floor(Math.random() * (CATEGORIAS.length - 1)) + 1],
    tags: ['comida', 'plato', 'gourmet'],
    dimensiones: { ancho: 400, alto: 300 },
    tamaño: 1024 * 1024 * Math.random(), // Tamaño aleatorio hasta 1MB
    formato: 'jpg',
    fechaSubida: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    favorito: Math.random() > 0.7,
  }));
  
  export function GaleriaSpoon({ onSelect, imagenSeleccionada }: GaleriaSpoonProps) {
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [imagenPreview, setImagenPreview] = useState<ImagenGaleria | null>(null);
    const itemsPorPagina = 12;
  
    const [filtros, setFiltros] = useState<FiltrosGaleria>({
      categoria: null,
      orientacion: 'todas',
      ordenar: 'recientes',
      favoritos: false,
    });
  
    const formatearTamaño = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
  
    const formatearFecha = (fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };
  
    // Filtrar y ordenar imágenes
    const imagenesFiltradas = MOCK_IMAGES.filter(img => {
      const matchBusqueda = img.tags.some(tag => 
        tag.toLowerCase().includes(busqueda.toLowerCase())
      ) || img.categoria.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchCategoria = !filtros.categoria || filtros.categoria === 'Todas' 
        ? true 
        : img.categoria === filtros.categoria;
  
      const matchOrientacion = filtros.orientacion === 'todas' ? true :
        filtros.orientacion === 'horizontal' ? img.dimensiones.ancho > img.dimensiones.alto :
        filtros.orientacion === 'vertical' ? img.dimensiones.alto > img.dimensiones.ancho :
        img.dimensiones.ancho === img.dimensiones.alto;
  
      const matchFavoritos = filtros.favoritos ? img.favorito : true;
  
      return matchBusqueda && matchCategoria && matchOrientacion && matchFavoritos;
    }).sort((a, b) => {
      switch (filtros.ordenar) {
        case 'recientes':
          return new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime();
        case 'antiguos':
          return new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime();
        case 'alfabetico':
          return a.categoria.localeCompare(b.categoria);
        case 'tamaño':
          return b.tamaño - a.tamaño;
        default:
          return 0;
      }
    });
  
    const paginasTotales = Math.ceil(imagenesFiltradas.length / itemsPorPagina);
    const imagenesActuales = imagenesFiltradas.slice(
      (pagina - 1) * itemsPorPagina,
      pagina * itemsPorPagina
    );
    // src/app/dashboard/carta/components/detalles-producto/selector-imagen/types.ts
export interface ImagenGaleria {
    id: string;
    url: string;
    thumbnail: string;
    categoria: string;
    tags: string[];
    dimensiones: {
      ancho: number;
      alto: number;
    };
    tamaño: number;
    formato: string;
    fechaSubida: string;
    favorito: boolean;
  }
  
  export interface FiltrosGaleria {
    categoria: string | null;
    orientacion: 'todas' | 'horizontal' | 'vertical' | 'cuadrada';
    ordenar: 'recientes' | 'antiguos' | 'alfabetico' | 'tamaño';
    favoritos: boolean;
  }
  
  // src/app/dashboard/carta/components/detalles-producto/selector-imagen/GaleriaSpoon.tsx
  import { useState, useEffect } from 'react';
  import { Input } from '@/shared/components/ui/input';
  import { Button } from '@/shared/components/ui/button';
  import { cn } from '@/lib/utils';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/shared/components/ui/select';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/shared/components/ui/dropdown-menu';
  import { 
    Search, 
    Filter, 
    Heart, 
    Image as ImageIcon, 
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Star,
    StarOff,
    Download,
    X
  } from 'lucide-react';
  import type { ImagenGaleria, FiltrosGaleria } from './types';
  
  interface GaleriaSpoonProps {
    onSelect: (imageUrl: string) => void;
    imagenSeleccionada?: string;
  }
  
  // Datos de ejemplo
  const CATEGORIAS = [
    'Todas',
    'Platos principales',
    'Entradas',
    'Postres',
    'Bebidas',
    'Ingredientes',
  ];
  
  const MOCK_IMAGES: ImagenGaleria[] = Array.from({ length: 20 }, (_, i) => ({
    id: `img-${i + 1}`,
    url: `/api/placeholder/400/300`,
    thumbnail: `/api/placeholder/200/150`,
    categoria: CATEGORIAS[Math.floor(Math.random() * (CATEGORIAS.length - 1)) + 1],
    tags: ['comida', 'plato', 'gourmet'],
    dimensiones: { ancho: 400, alto: 300 },
    tamaño: 1024 * 1024 * Math.random(), // Tamaño aleatorio hasta 1MB
    formato: 'jpg',
    fechaSubida: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    favorito: Math.random() > 0.7,
  }));
  
  export function GaleriaSpoon({ onSelect, imagenSeleccionada }: GaleriaSpoonProps) {
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [imagenPreview, setImagenPreview] = useState<ImagenGaleria | null>(null);
    const itemsPorPagina = 12;
  
    const [filtros, setFiltros] = useState<FiltrosGaleria>({
      categoria: null,
      orientacion: 'todas',
      ordenar: 'recientes',
      favoritos: false,
    });
  
    const formatearTamaño = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
  
    const formatearFecha = (fecha: string) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };
  
    // Filtrar y ordenar imágenes
    const imagenesFiltradas = MOCK_IMAGES.filter(img => {
      const matchBusqueda = img.tags.some(tag => 
        tag.toLowerCase().includes(busqueda.toLowerCase())
      ) || img.categoria.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchCategoria = !filtros.categoria || filtros.categoria === 'Todas' 
        ? true 
        : img.categoria === filtros.categoria;
  
      const matchOrientacion = filtros.orientacion === 'todas' ? true :
        filtros.orientacion === 'horizontal' ? img.dimensiones.ancho > img.dimensiones.alto :
        filtros.orientacion === 'vertical' ? img.dimensiones.alto > img.dimensiones.ancho :
        img.dimensiones.ancho === img.dimensiones.alto;
  
      const matchFavoritos = filtros.favoritos ? img.favorito : true;
  
      return matchBusqueda && matchCategoria && matchOrientacion && matchFavoritos;
    }).sort((a, b) => {
      switch (filtros.ordenar) {
        case 'recientes':
          return new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime();
        case 'antiguos':
          return new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime();
        case 'alfabetico':
          return a.categoria.localeCompare(b.categoria);
        case 'tamaño':
          return b.tamaño - a.tamaño;
        default:
          return 0;
      }
    });
  
    const paginasTotales = Math.ceil(imagenesFiltradas.length / itemsPorPagina);
    const imagenesActuales = imagenesFiltradas.slice(
      (pagina - 1) * itemsPorPagina,
      pagina * itemsPorPagina
    );