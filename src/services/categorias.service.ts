// src/services/categorias.service.ts
import { Categoria } from '@/utils/menuCache.utils';

export interface CategoriaAPI {
  id: string;
  nombre: string;
  tipo: string;
  orden: number;
  descripcion?: string;
  activo: boolean;
  restauranteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriasResponse {
  success: boolean;
  data: CategoriaAPI[];
  count: number;
  error?: string;
  message?: string;
}

/**
 * Servicio para gestionar las categorías desde la API
 */
export class CategoriasService {
  private static readonly BASE_URL = '/api/categorias';
  private static readonly DEFAULT_RESTAURANT_ID = 'd3e7dba8-ae9c-4cc4-8414-bde87b0ccf56';

  /**
   * Obtiene todas las categorías desde la API
   * @param restauranteId ID del restaurante (opcional)
   * @returns Promise con las categorías transformadas
   */
  static async obtenerCategorias(restauranteId?: string): Promise<Categoria[]> {
    try {
      const restaurantId = restauranteId || this.DEFAULT_RESTAURANT_ID;
      const url = `${this.BASE_URL}?restauranteId=${encodeURIComponent(restaurantId)}`;
      
      console.log('🔄 Cargando categorías desde API:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache', // Siempre obtener datos frescos
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data: CategoriasResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error desconocido al obtener categorías');
      }

      console.log('✅ Categorías cargadas desde API:', data.data.length, 'categorías');
      
      // Transformar los datos de la API al formato interno
      const categorias = data.data.map(this.transformarCategoriaAPI);
      
      return categorias;
    } catch (error) {
      console.error('❌ Error al cargar categorías desde API:', error);
      throw error;
    }
  }

  /**
   * Obtiene una categoría específica por ID
   * @param id ID de la categoría
   * @param restauranteId ID del restaurante (opcional)
   * @returns Promise con la categoría encontrada
   */
  static async obtenerCategoriaPorId(id: string, restauranteId?: string): Promise<Categoria | null> {
    try {
      const categorias = await this.obtenerCategorias(restauranteId);
      return categorias.find(cat => cat.id === id) || null;
    } catch (error) {
      console.error('❌ Error al obtener categoría por ID:', error);
      throw error;
    }
  }

  /**
   * Transforma una categoría de la API al formato interno
   * @param categoriaAPI Categoría desde la API
   * @returns Categoría en formato interno
   */
  private static transformarCategoriaAPI(categoriaAPI: CategoriaAPI): Categoria {
    return {
      id: categoriaAPI.id,
      nombre: categoriaAPI.nombre,
      tipo: 'principal' as const, // Todas las categorías principales por ahora
      parentId: undefined, // No hay subcategorías por ahora
    };
  }

  /**
   * Crea un mapeo de IDs antiguos (CAT_001) a nuevos UUIDs para compatibilidad
   * @param categorias Lista de categorías desde la API
   * @returns Mapeo de IDs antiguos a nuevos
   */
  static crearMapeoCompatibilidad(categorias: Categoria[]): Record<string, string> {
    const mapeo: Record<string, string> = {};
    
    // Función helper para normalizar texto (quitar acentos y caracteres especiales)
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        // Reemplazos específicos para caracteres problemáticos
        .replace(/proteã­nas/g, 'proteinas')
        .replace(/acompaã±amientos/g, 'acompanamientos')
        .replace(/ã­/g, 'i')
        .replace(/ã±/g, 'n')
        .replace(/ã¡/g, 'a')
        .replace(/ã©/g, 'e')
        .replace(/ã³/g, 'o')
        .replace(/ãº/g, 'u')
        // Normalización estándar
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/ñ/g, 'n') // Reemplazar ñ por n
        .replace(/í/g, 'i')
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u');
    };
    
    // Mapear basado en el nombre normalizado
    categorias.forEach((categoria) => {
      const nombreNormalizado = normalizeText(categoria.nombre);
      
      console.log(`🔍 Procesando categoría: "${categoria.nombre}" -> normalizado: "${nombreNormalizado}"`);
      
      if (nombreNormalizado.includes('entrada')) {
        mapeo['CAT_001'] = categoria.id;
        console.log(`✅ Mapeado CAT_001 -> ${categoria.id} (${categoria.nombre})`);
      } else if (nombreNormalizado.includes('principio')) {
        mapeo['CAT_002'] = categoria.id;
        console.log(`✅ Mapeado CAT_002 -> ${categoria.id} (${categoria.nombre})`);
      } else if (nombreNormalizado.includes('proteina')) {
        mapeo['CAT_003'] = categoria.id;
        console.log(`✅ Mapeado CAT_003 -> ${categoria.id} (${categoria.nombre})`);
      } else if (nombreNormalizado.includes('acompanamiento')) {
        mapeo['CAT_004'] = categoria.id;
        console.log(`✅ Mapeado CAT_004 -> ${categoria.id} (${categoria.nombre})`);
      } else if (nombreNormalizado.includes('bebida')) {
        mapeo['CAT_005'] = categoria.id;
        console.log(`✅ Mapeado CAT_005 -> ${categoria.id} (${categoria.nombre})`);
      } else {
        console.log(`⚠️ No se pudo mapear: "${categoria.nombre}" (normalizado: "${nombreNormalizado}")`);
      }
    });
    
    console.log('🔗 Mapeo de compatibilidad creado:', mapeo);
    return mapeo;
  }

  /**
   * Obtiene el ID nuevo basado en un ID antiguo
   * @param idAntiguo ID antiguo (ej: CAT_001)
   * @param mapeo Mapeo de compatibilidad
   * @returns ID nuevo (UUID) o el ID original si no se encuentra mapeo
   */
  static obtenerIdNuevo(idAntiguo: string, mapeo: Record<string, string>): string {
    return mapeo[idAntiguo] || idAntiguo;
  }

  /**
   * Obtiene el ID antiguo basado en un ID nuevo
   * @param idNuevo ID nuevo (UUID)
   * @param mapeo Mapeo de compatibilidad
   * @returns ID antiguo (ej: CAT_001) o el ID original si no se encuentra mapeo
   */
  static obtenerIdAntiguo(idNuevo: string, mapeo: Record<string, string>): string {
    const entrada = Object.entries(mapeo).find(([_, uuid]) => uuid === idNuevo);
    return entrada ? entrada[0] : idNuevo;
  }
}

// Exportar instancia por defecto para facilitar el uso
export const categoriasService = CategoriasService;
