import { create } from 'zustand';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { menuService } from '@/app/dashboard/carta/services/menu.service';
import { MenuCache } from '@/app/dashboard/carta/utils/menu-cache.utils';

interface MenuState {
  items: VersionedProduct[];
  loading: boolean;
  error: string | null;
  currentCategory: string | null;
  loadingCategories: string[];
}

interface MenuActions {
  loadItems: (restaurantId: string, categoryId?: string) => Promise<void>;
  updateItems: (items: VersionedProduct[]) => Promise<void>;
  setCurrentCategory: (categoryId: string | null) => void;
}

type MenuStore = MenuState & MenuActions;

export const useMenuStore = create<MenuStore>((set, get) => {
  const cache = MenuCache.getInstance();

  return {
    items: [],
    loading: false,
    error: null,
    currentCategory: null,
    loadingCategories: [],

    loadItems: async (restaurantId: string, categoryId?: string) => {
      set({ loading: true, error: null });
      try {
        console.log('Cargando elementos del menú (simulación):', { restaurantId, categoryId });

        // Intentar obtener desde caché
        const key = categoryId || 'all';
        const cachedItems = cache.getItems(key);
        
        if (cachedItems) {
          set({ items: cachedItems, loading: false });
          return;
        }

        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo
        const items: VersionedProduct[] = [
          {
            id: 'item_1',
            nombre: 'Menú Ejecutivo',
            descripcion: 'Menú completo del día',
            currentPrice: 15000,
            categoriaId: categoryId || 'CAT_001',
            currentVersion: 1,
            priceHistory: [],
            versions: [],
            status: 'active',
            stock: {
              currentQuantity: 50,
              minQuantity: 10,
              maxQuantity: 100,
              status: 'in_stock',
              lastUpdated: new Date(),
              alerts: {
                lowStock: false,
                overStock: false,
                thresholds: { low: 10, high: 90 }
              }
            },
            metadata: {
              createdAt: new Date(),
              createdBy: 'system',
              lastModified: new Date(),
              lastModifiedBy: 'system'
            }
          }
        ];

        cache.setItems(key, items);
        set({ items, loading: false });

      } catch (error) {
        set({ error: 'Error al cargar elementos del menú', loading: false });
        console.error(error);
      }
    },

    updateItems: async (items: VersionedProduct[]) => {
      set({ loading: true, error: null });
      try {
        console.log('Actualizando elementos del menú (simulación):', items);

        // Simular actualización
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = get().currentCategory || 'all';
        cache.updateItems(key, () => items);
        set({ items, loading: false });

      } catch (error) {
        set({ error: 'Error al actualizar elementos del menú', loading: false });
        console.error(error);
      }
    },

    setCurrentCategory: (categoryId: string | null) => {
      set({ currentCategory: categoryId });
    }
  };
});
