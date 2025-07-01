import { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Configuración base para fetch
const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función helper para manejar respuestas
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// ===== PRODUCTOS =====
export const productosAPI = {
  // Obtener productos
  async getProductos(params?: {
    categoriaId?: string;
    subcategoriaId?: string;
    restauranteId?: string;
  }): Promise<{ success: boolean; data: VersionedProduct[]; count: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.categoriaId) searchParams.append('categoriaId', params.categoriaId);
    if (params?.subcategoriaId) searchParams.append('subcategoriaId', params.subcategoriaId);
    if (params?.restauranteId) searchParams.append('restauranteId', params.restauranteId);

    const url = `${API_BASE_URL}/api/productos${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      ...fetchConfig,
    });

    return handleResponse<{ success: boolean; data: VersionedProduct[]; count: number }>(response);
  },

  // Crear producto
  async createProducto(producto: {
    nombre: string;
    descripcion: string;
    precio: number;
    categoriaId: string;
    subcategoriaId?: string;
    imagen?: string;
    stockInicial?: number;
    stockMinimo?: number;
    stockMaximo?: number;
    restauranteId?: string;
  }): Promise<{ success: boolean; data: VersionedProduct; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/productos`, {
      method: 'POST',
      ...fetchConfig,
      body: JSON.stringify(producto),
    });

    return handleResponse<{ success: boolean; data: VersionedProduct; message: string }>(response);
  },

  // Actualizar producto
  async updateProducto(id: string, producto: Partial<{
    nombre: string;
    descripcion: string;
    precio: number;
    categoriaId: string;
    subcategoriaId?: string;
    imagen?: string;
    stockActual?: number;
    stockMinimo?: number;
    stockMaximo?: number;
  }>): Promise<{ success: boolean; data: VersionedProduct; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      method: 'PUT',
      ...fetchConfig,
      body: JSON.stringify(producto),
    });

    return handleResponse<{ success: boolean; data: VersionedProduct; message: string }>(response);
  },

  // Eliminar producto
  async deleteProducto(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
      method: 'DELETE',
      ...fetchConfig,
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  }
};

// ===== CATEGORÍAS =====
export const categoriasAPI = {
  // Obtener categorías
  async getCategorias(params?: {
    tipo?: 'categoria' | 'subcategoria';
    restauranteId?: string;
  }): Promise<{ success: boolean; data: any[]; count: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.tipo) searchParams.append('tipo', params.tipo);
    if (params?.restauranteId) searchParams.append('restauranteId', params.restauranteId);

    const url = `${API_BASE_URL}/api/categorias${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      ...fetchConfig,
    });

    return handleResponse<{ success: boolean; data: any[]; count: number }>(response);
  },

  // Crear categoría
  async createCategoria(categoria: {
    nombre: string;
    tipo?: 'categoria' | 'subcategoria';
    orden?: number;
    descripcion?: string;
    restauranteId?: string;
  }): Promise<{ success: boolean; data: any; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      method: 'POST',
      ...fetchConfig,
      body: JSON.stringify(categoria),
    });

    return handleResponse<{ success: boolean; data: any; message: string }>(response);
  }
};

// ===== HEALTH CHECK =====
export const healthAPI = {
  // Verificar estado de la API
  async checkHealth(): Promise<{ success: boolean; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      ...fetchConfig,
    });

    return handleResponse<{ success: boolean; timestamp: string }>(response);
  }
};

// Exportar todo como un objeto
export const apiService = {
  productos: productosAPI,
  categorias: categoriasAPI,
  health: healthAPI,
};

export default apiService;
