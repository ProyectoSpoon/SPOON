-- ============================================================================
-- ROLLBACK: Optimización 2 - Batch Updates
-- ============================================================================
-- Revierte los cambios de STATEMENT-level a ROW-level triggers
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

RAISE NOTICE 'Iniciando rollback de Optimización 2: Batch Updates';

-- ============================================================================
-- 1. Restaurar función original ROW-level
-- ============================================================================

CREATE OR REPLACE FUNCTION actualizar_monto_total_orden()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el monto total de la orden afectada
  UPDATE ordenes_mesa
  SET 
    monto_total = (
      SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
      FROM items_orden_mesa i
      WHERE i.orden_mesa_id = COALESCE(NEW.orden_mesa_id, OLD.orden_mesa_id)
    ),
    fecha_actualizacion = now()
  WHERE id = COALESCE(NEW.orden_mesa_id, OLD.orden_mesa_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Reemplazar trigger STATEMENT-level con ROW-level
-- ============================================================================

DROP TRIGGER IF EXISTS actualizar_monto_total_orden_batch ON items_orden_mesa;

CREATE TRIGGER actualizar_monto_total_orden
AFTER INSERT OR UPDATE OR DELETE ON items_orden_mesa
FOR EACH ROW
EXECUTE FUNCTION actualizar_monto_total_orden();

RAISE NOTICE 'Trigger ROW-level restaurado';

-- ============================================================================
-- 3. Eliminar función batch (opcional)
-- ============================================================================

-- Comentar si quieres mantener la función para uso futuro
-- DROP FUNCTION IF EXISTS actualizar_monto_total_orden_batch();

-- ============================================================================
-- 4. Verificar integridad de datos
-- ============================================================================

DO $$
DECLARE
  inconsistencias INTEGER;
BEGIN
  SELECT COUNT(*) INTO inconsistencias
  FROM ordenes_mesa o
  WHERE o.monto_total != (
    SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
    FROM items_orden_mesa i
    WHERE i.orden_mesa_id = o.id
  );
  
  IF inconsistencias > 0 THEN
    RAISE WARNING 'Encontradas % órdenes con totales inconsistentes después del rollback', inconsistencias;
    
    -- Corregir
    UPDATE ordenes_mesa o
    SET monto_total = (
      SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
      FROM items_orden_mesa i
      WHERE i.orden_mesa_id = o.id
    );
    
    RAISE NOTICE 'Totales corregidos';
  ELSE
    RAISE NOTICE 'Todos los totales están correctos';
  END IF;
END $$;

-- ============================================================================
-- 5. Verificación
-- ============================================================================

DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'actualizar_monto_total_orden'
    AND tgrelid = 'items_orden_mesa'::regclass
  ) INTO trigger_exists;
  
  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'Error: El trigger ROW-level no se restauró correctamente';
  END IF;
  
  RAISE NOTICE 'Rollback completado exitosamente';
END $$;

COMMIT;

RAISE NOTICE 'Rollback de Optimización 2 completado';
