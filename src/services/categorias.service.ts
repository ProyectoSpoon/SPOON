// src/services/categorias.service.ts
import { Categoria } from '@/utils/menuCache.utils';

// Interfaz actualizada para coincidir con la respuesta de la API (nombres en español)
export interface CategoriaAPI {
  id: string;
  nombre: string; // API devuelve "nombre"
  tipo: string; // API devuelve "tipo"
  orden: number; // API devuelve "orden"
  descripcion?: string; // API devuelve "descripcion"
  parentId?: string; // API devuelve "parentId" - NUEVO
  activo: boolean; // API devuelve "activo"
  restauranteId: string; // API devuelve "restauranteId"
  createdAt: string; // API devuelve "createdAt"
  updatedAt: string; // API devuelve "updatedAt"
}

export interface CategoriasResponse {
  success: boolean;
  data: CategoriaAPI[];
  count: number;
  restauranteId?: string;
  error?: string;
  message?: string;
}

/**
 * Servicio para gestionar las categorías desde la API
 */
export class CategoriasService {
  private static readonly BASE_URL = '/api/categorias';

  /**
   * Obtiene todas las categorías desde la API
   * @param restauranteId ID del restaurante (opcional)
   * @returns Promise con las categorías transformadas
   */
  static async obtenerCategorias(restauranteId?: string): Promise<Categoria[]> {
    try {
      // Si no se proporciona restauranteId, no enviamos parámetro para que la API use el restaurante por defecto
      const url = restauranteId
        ? `${this.BASE_URL}?restauranteId=${encodeURIComponent(restauranteId)}`
        : this.BASE_URL;

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

      console.log('✅ Categorías cargadas desde API:', {
        cantidad: data.data.length,
        restauranteId: data.restauranteId,
        categorias: data.data.map(c => c.nombre)
      });

      // Si no hay categorías, mostrar mensaje informativo
      if (data.data.length === 0) {
        console.warn('⚠️ No se encontraron categorías. Verifica que el restaurante tenga categorías configuradas.');
      }

      // Transformar los datos de la API al formato interno
      const categorias = data.data.map(this.transformarCategoriaAPI);

      // Ordenar: primero principales, luego subcategorías por sort_order
      const categoriasOrdenadas = categorias.sort((a, b) => {
        // Primero las principales (sin parentId)
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;

        // Si ambas son del mismo tipo, ordenar alfabéticamente
        return a.nombre.localeCompare(b.nombre);
      });

      console.log('🏗️ Categorías transformadas y ordenadas:', {
        total: categoriasOrdenadas.length,
        principales: categoriasOrdenadas.filter(c => !c.parentId).length,
        subcategorias: categoriasOrdenadas.filter(c => c.parentId).length
      });

      return categoriasOrdenadas;
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
    // Determinar el tipo basado en parentId
    const tipo: 'principal' | 'subcategoria' = categoriaAPI.parentId ? 'subcategoria' : 'principal';

    console.log(`🔄 Transformando: "${categoriaAPI.nombre}" (${categoriaAPI.tipo}) -> tipo: ${tipo}, parentId: ${categoriaAPI.parentId || 'ninguno'}`);

    return {
      id: categoriaAPI.id,
      nombre: categoriaAPI.nombre, // Ya viene en español
      tipo: tipo, // Basado en parentId
      parentId: categoriaAPI.parentId // Ya viene transformado
    };
  }

  /**
   * Obtiene solo las categorías principales (sin parent_id)
   * @param restauranteId ID del restaurante (opcional)
   * @returns Promise con las categorías principales
   */
  static async obtenerCategoriasPrincipales(restauranteId?: string): Promise<Categoria[]> {
    const categorias = await this.obtenerCategorias(restauranteId);
    return categorias.filter(cat => cat.tipo === 'principal');
  }

  /**
   * Obtiene las subcategorías de una categoría principal específica
   * @param parentId ID de la categoría principal
   * @param restauranteId ID del restaurante (opcional)
   * @returns Promise con las subcategorías
   */
  static async obtenerSubcategorias(parentId: string, restauranteId?: string): Promise<Categoria[]> {
    const categorias = await this.obtenerCategorias(restauranteId);
    return categorias.filter(cat => cat.parentId === parentId);
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
        .replace(/proteínas/g, 'proteinas')
        .replace(/acompañamientos/g, 'acompanamientos')
        .replace(/í/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u')
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

    // Mapeo directo para las categorías conocidas
    const categoriaMapeada: Record<string, string> = {
      'entradas': 'CAT_001',
      'principios': 'CAT_002',
      'proteinas': 'CAT_003',
      'acompanamientos': 'CAT_004',
      'bebidas': 'CAT_005',
      'almuerzos': 'CAT_006', // ⭐ AÑADIDO
    };

    const uuidMapping: Record<string, string> = {
      'CAT_001': '494fbac6-59ed-42af-af24-039298ba16b6', // Entradas
      'CAT_002': 'de7f4731-3eb3-4d41-b830-d35e5125f4a3', // Principios
      'CAT_003': '299b1ba0-0678-4e0e-ba53-90e5d95e5543', // Proteinas
      'CAT_004': '8b0751ae-1332-409e-a710-f229be0b9758', // Acompañamientos
      'CAT_005': 'c77ffc73-b65a-4f03-adb1-810443e61799', // Bebidas
      'CAT_006': 'eac729e6-e216-4e45-9d6f-2698c757b096', // ALMUERZOS ⭐ AÑADIDO
    };

    categorias.forEach((categoria) => {
      const nombreNormalizado = normalizeText(categoria.nombre);

      console.log(`🔍 Procesando categoría: "${categoria.nombre}" -> normalizado: "${nombreNormalizado}"`);

      // Buscar el ID antiguo basado en el nombre normalizado
      const oldId = categoriaMapeada[nombreNormalizado];

      if (oldId) {
        // Verificar si el UUID del mapeo coincide con el de la categoría actual de la API
        if (uuidMapping[oldId] === categoria.id) {
          mapeo[oldId] = categoria.id;
          console.log(`✅ Mapeado ${oldId} -> ${categoria.id} (${categoria.nombre})`);
        } else {
          // Si el UUID no coincide, podría ser un caso donde el nombre normalizado se repite o ha cambiado
          // En este caso, el sistema de mapeo por nombre normalizado es la fuente de la verdad
          // Por lo tanto, si el nombre normalizado coincide, asumimos que es el mapeo correcto.
          // Se podría añadir una advertencia si los UUIDs no coinciden.
          mapeo[oldId] = categoria.id;
          console.warn(`⚠️ Mapeado ${oldId} -> ${categoria.id} (${categoria.nombre}). El UUID en el mapeo predefinido era ${uuidMapping[oldId]}.`);
        }
      } else {
        console.log(`⚠️ No se pudo mapear: "${categoria.nombre}" (normalizado: "${nombreNormalizado}")`);
      }
    });

    console.log('🗺️ Mapeo de compatibilidad creado:', mapeo);
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