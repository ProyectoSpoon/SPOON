-- ============================================================================
-- Optimización 2: Batch Updates
-- ============================================================================
-- Objetivo: Reducir latencia en órdenes en 60% usando STATEMENT-level triggers
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Crear función batch para actualizar monto total de órdenes
-- ============================================================================

CREATE OR REPLACE FUNCTION actualizar_monto_total_orden_batch()
RETURNS TRIGGER AS $$
DECLARE
  affected_orders UUID[];
BEGIN
  -- Obtener IDs de órdenes afectadas por esta operación
  -- Usar tabla de transición para operaciones en batch
  IF TG_OP = 'DELETE' THEN
    SELECT ARRAY_AGG(DISTINCT orden_mesa_id) INTO affected_orders
    FROM old_table;
  ELSIF TG_OP = 'INSERT' THEN
    SELECT ARRAY_AGG(DISTINCT orden_mesa_id) INTO affected_orders
    FROM new_table;
  ELSE -- UPDATE
    SELECT ARRAY_AGG(DISTINCT orden_mesa_id) INTO affected_orders
    FROM (
      SELECT orden_mesa_id FROM old_table
      UNION
      SELECT orden_mesa_id FROM new_table
    ) AS combined;
  END IF;

  -- Actualizar totales de todas las órdenes afectadas en un solo UPDATE
  UPDATE ordenes_mesa o
  SET 
    monto_total = (
      SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
      FROM items_orden_mesa i
      WHERE i.orden_mesa_id = o.id
    ),
    fecha_actualizacion = now()
  WHERE o.id = ANY(affected_orders);

  RETURN NULL; -- AFTER trigger, valor de retorno ignorado
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Reemplazar trigger ROW-level con STATEMENT-level
-- ============================================================================

-- Eliminar trigger antiguo (ROW-level)
DROP TRIGGER IF EXISTS actualizar_monto_total_orden ON items_orden_mesa;

-- Crear nuevo trigger (STATEMENT-level)
CREATE TRIGGER actualizar_monto_total_orden_batch
AFTER INSERT OR UPDATE OR DELETE ON items_orden_mesa
REFERENCING 
  OLD TABLE AS old_table
  NEW TABLE AS new_table
FOR EACH STATEMENT
EXECUTE FUNCTION actualizar_monto_total_orden_batch();

-- ============================================================================
-- 3. Verificar y corregir integridad de datos existentes
-- ============================================================================

DO $$
DECLARE
  inconsistencias INTEGER;
  ordenes_corregidas INTEGER;
BEGIN
  -- Contar órdenes con totales inconsistentes
  SELECT COUNT(*) INTO inconsistencias
  FROM ordenes_mesa o
  WHERE o.monto_total != (
    SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
    FROM items_orden_mesa i
    WHERE i.orden_mesa_id = o.id
  );
  
  IF inconsistencias > 0 THEN
    RAISE NOTICE 'Encontradas % órdenes con totales inconsistentes', inconsistencias;
    RAISE NOTICE 'Corrigiendo totales...';
    
    -- Corregir inconsistencias
    UPDATE ordenes_mesa o
    SET monto_total = (
      SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
      FROM items_orden_mesa i
      WHERE i.orden_mesa_id = o.id
    ),
    fecha_actualizacion = now()
    WHERE o.monto_total != (
      SELECT COALESCE(SUM(i.cantidad * i.precio_unitario), 0)
      FROM items_orden_mesa i
      WHERE i.orden_mesa_id = o.id
    );
    
    GET DIAGNOSTICS ordenes_corregidas = ROW_COUNT;
    RAISE NOTICE 'Totales corregidos en % órdenes', ordenes_corregidas;
  ELSE
    RAISE NOTICE 'Todos los totales están correctos';
  END IF;
END $$;

-- ============================================================================
-- 4. Crear índice para optimizar cálculo de totales
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_items_orden_mesa_orden_id
ON items_orden_mesa(orden_mesa_id, precio_unitario, cantidad);

-- ============================================================================
-- 5. Verificación final
-- ============================================================================

DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  -- Verificar que el trigger se creó correctamente
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'actualizar_monto_total_orden_batch'
    AND tgrelid = 'items_orden_mesa'::regclass
  ) INTO trigger_exists;
  
  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'Error: El trigger batch no se creó correctamente';
  END IF;
  
  RAISE NOTICE 'Optimización 2 aplicada exitosamente';
  RAISE NOTICE 'Trigger STATEMENT-level creado correctamente';
END $$;

COMMIT;

-- ============================================================================
-- Fin de script de optimización 2
-- ============================================================================
