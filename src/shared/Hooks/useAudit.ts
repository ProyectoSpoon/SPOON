// src/shared/hooks/useAudit.ts - Hook para auditoría
'use client';

import { useCallback } from 'react';

interface AuditLogData {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  user_id?: string;
  restaurant_id?: string;
}

export const useAudit = () => {
  const logAction = useCallback(async (data: AuditLogData) => {
    try {
      console.log('📝 Registrando auditoría:', data);
      
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ip_address: 'client-side', // En producción esto vendría del servidor
          user_agent: navigator.userAgent
        }),
      });

      if (!response.ok) {
        console.error('❌ Error al registrar auditoría:', response.statusText);
      } else {
        console.log('✅ Auditoría registrada exitosamente');
      }
    } catch (error) {
      console.error('❌ Error en hook de auditoría:', error);
    }
  }, []);

  return { logAction };
};

// Acciones predefinidas para consistencia
export const AUDIT_ACTIONS = {
  // Órdenes
  ORDER_CREATED: 'order_created',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_COMPLETED: 'order_completed',
  
  // Productos
  PRODUCT_ADDED: 'product_added',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  
  // Menú
  MENU_PUBLISHED: 'menu_published',
  MENU_UPDATED: 'menu_updated',
  
  // Sistema
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  SETTINGS_CHANGED: 'settings_changed',
  
  // Ventas
  SALE_COMPLETED: 'sale_completed',
  PAYMENT_PROCESSED: 'payment_processed'
} as const;

export const ENTITY_TYPES = {
  ORDER: 'order',
  PRODUCT: 'product',
  MENU: 'menu',
  USER: 'user',
  RESTAURANT: 'restaurant',
  SALE: 'sale'
} as const;
