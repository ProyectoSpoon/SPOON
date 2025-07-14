import { lazy } from 'react';

// ✅ OPTIMIZACIÓN: Lazy loading de componentes pesados
export const ProductModal = lazy(() => 
  import('./ProductModal').then(module => ({ default: module.ProductModal }))
);

export const FavoritesSection = lazy(() => 
  import('./FavoritesSection').then(module => ({ default: module.FavoritesSection }))
);

export const MenuSection = lazy(() => 
  import('./MenuSection').then(module => ({ default: module.MenuSection }))
);
