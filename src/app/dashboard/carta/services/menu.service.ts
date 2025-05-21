import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

export class MenuService {
  private restaurantId: string;

  constructor(restaurantId: string) {
    this.restaurantId = restaurantId;
  }

  async getMenuItems(categoryId?: string) {
    const q = query(
      collection(db, 'productos'),
      where('restaurantId', '==', this.restaurantId),
      where('status', '==', 'active'),
      ...(categoryId ? [where('categoryId', '==', categoryId)] : []),
      orderBy('nombre')
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        currentVersion: data.currentVersion || 1,
        currentPrice: data.currentPrice || 0,
        priceHistory: data.priceHistory || [],
        stock: data.stock || {
          currentQuantity: 0,
          minQuantity: 0,
          maxQuantity: 100,
          lastUpdated: new Date(),
          status: 'in_stock' as const
        },
        versions: data.versions || [],
        status: data.status || 'active',
        metadata: {
          createdAt: data.metadata?.createdAt || new Date(),
          createdBy: data.metadata?.createdBy || '',
          lastModified: data.metadata?.lastModified || new Date(),
          lastModifiedBy: data.metadata?.lastModifiedBy || ''
        }
      } as VersionedProduct;
    });
  }
  
  async updateMenuItems(items: VersionedProduct[]) {
    const batch = writeBatch(db);
    items.forEach(item => {
      const ref = doc(db, 'productos', item.id);
      batch.update(ref, {
        ...item,
        lastModified: serverTimestamp()
      });
    });
    await batch.commit();
  }

  async getCategoryItems(categoryId: string) {
    const cached = await this.getCachedItems(categoryId);
    if (cached) return cached;

    const items = await this.getMenuItems(categoryId);
    await this.cacheItems(categoryId, items);
    return items;
  }

  private async getCachedItems(key: string) {
    // Implementar lógica de caché
    return null;
  }

  private async cacheItems(key: string, items: VersionedProduct[]) {
    // Implementar lógica de caché
  }
}