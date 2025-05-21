import { create } from 'zustand';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';
import { MenuService } from '@/app/dashboard/carta/services/menu.service';
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
  let menuService: MenuService | null = null;
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
        if (!menuService) {
          menuService = new MenuService(restaurantId);
        }

        // Intentar obtener desde caché
        const key = categoryId || 'all';
        const cachedItems = cache.getItems(key);
        
        if (cachedItems) {
          set({ items: cachedItems, loading: false });
          return;
        }

        // Si no está en caché, cargar desde el servicio
        const items = await menuService.getMenuItems(categoryId);
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
        if (!menuService) {
          throw new Error('MenuService no inicializado');
        }

        await menuService.updateMenuItems(items);
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