import { useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  ProductVersion, 
  PriceHistory, 
  StockUpdate, 
  ProductStock,
  VersionedProduct 
} from '@/app/dashboard/carta/types/product-versioning.types';

interface UseProductHistoryProps {
  productId: string;
  restaurantId: string;
}

export function useProductHistory({ productId, restaurantId }: UseProductHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener historial de versiones
  const fetchVersionHistory = useCallback(async () => {
    setLoading(true);
    try {
      const versionsRef = collection(db, 'product_versions');
      const q = query(
        versionsRef,
        where('productId', '==', productId),
        where('restaurantId', '==', restaurantId),
        orderBy('version', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ProductVersion[];

    } catch (err) {
      setError('Error al obtener historial de versiones');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, restaurantId]);

  // Obtener historial de precios
  const fetchPriceHistory = useCallback(async () => {
    setLoading(true);
    try {
      const pricesRef = collection(db, 'product_prices');
      const q = query(
        pricesRef,
        where('productId', '==', productId),
        where('restaurantId', '==', restaurantId),
        orderBy('effectiveDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as PriceHistory[];

    } catch (err) {
      setError('Error al obtener historial de precios');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, restaurantId]);

  // Obtener actualizaciones de stock
  const fetchStockUpdates = useCallback(async (limitCount = 50) => {
    setLoading(true);
    try {
      const stockRef = collection(db, 'stock_updates');
      const q = query(
        stockRef,
        where('productId', '==', productId),
        where('restaurantId', '==', restaurantId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as StockUpdate[];

    } catch (err) {
      setError('Error al obtener actualizaciones de stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, restaurantId]);

  // Actualizar precio
  const updatePrice = useCallback(async (
    newPrice: number, 
    reason?: string, 
    expirationDate?: Date
  ) => {
    setLoading(true);
    try {
      // Obtener precio actual
      const currentPriceQuery = query(
        collection(db, 'product_prices'),
        where('productId', '==', productId),
        where('effectiveDate', '<=', new Date()),
        orderBy('effectiveDate', 'desc'),
        limit(1)
      );
      
      const currentPriceSnapshot = await getDocs(currentPriceQuery);
      const previousPrice = currentPriceSnapshot.docs[0]?.data()?.value;

      // Registrar nuevo precio
      await addDoc(collection(db, 'product_prices'), {
        id: `price_${Date.now()}`,
        productId,
        restaurantId,
        value: newPrice,
        previousPrice,
        effectiveDate: new Date(),
        expirationDate,
        reason,
        createdBy: 'current-user', // Deberías obtener esto del contexto de auth
        timestamp: serverTimestamp()
      });

      // Actualizar precio actual en el producto
      const productRef = doc(db, 'productos', productId);
      await updateDoc(productRef, {
        currentPrice: newPrice,
        'metadata.lastModified': serverTimestamp(),
        'metadata.lastModifiedBy': 'current-user'
      });

    } catch (err) {
      setError('Error al actualizar precio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, restaurantId]);

  // Actualizar stock
  const updateStock = useCallback(async (
    quantity: number,
    type: 'increment' | 'decrement' | 'set',
    options?: {
      reason?: string;
      location?: string;
      batchNumber?: string;
    }
  ) => {
    setLoading(true);
    try {
      const { reason, location, batchNumber } = options || {};

      // Registrar actualización de stock
      await addDoc(collection(db, 'stock_updates'), {
        id: `stock_${Date.now()}`,
        productId,
        restaurantId,
        quantity,
        type,
        reason,
        location,
        batchNumber,
        timestamp: serverTimestamp(),
        updatedBy: 'current-user' // Deberías obtener esto del contexto de auth
      });

      // Actualizar stock actual
      const productRef = doc(db, 'productos', productId);
      const productDoc = await getDocs(query(collection(db, 'productos'), where('id', '==', productId)));
      const currentStock = productDoc.docs[0].data().stock as ProductStock;

      let newQuantity = currentStock.currentQuantity;
      switch (type) {
        case 'increment':
          newQuantity += quantity;
          break;
        case 'decrement':
          newQuantity = Math.max(0, newQuantity - quantity);
          break;
        case 'set':
          newQuantity = quantity;
          break;
      }

      // Determinar estado de stock
      const stockStatus = 
        newQuantity <= currentStock.minQuantity ? 'low_stock' :
        newQuantity >= currentStock.maxQuantity ? 'over_stock' : 'in_stock';

      await updateDoc(productRef, {
        'stock.currentQuantity': newQuantity,
        'stock.status': stockStatus,
        'stock.lastUpdated': serverTimestamp(),
        'stock.alerts.lowStock': newQuantity <= currentStock.minQuantity,
        'stock.alerts.overStock': newQuantity >= currentStock.maxQuantity
      });

    } catch (err) {
      setError('Error al actualizar stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [productId, restaurantId]);

  return {
    loading,
    error,
    fetchVersionHistory,
    fetchPriceHistory,
    fetchStockUpdates,
    updatePrice,
    updateStock
  };
}