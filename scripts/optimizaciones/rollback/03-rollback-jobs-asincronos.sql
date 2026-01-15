-- ============================================================================
-- ROLLBACK: Optimización 3 - Jobs Asíncronos
-- ============================================================================
-- Revierte los cambios de queue asíncrono a updates directos
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

RAISE NOTICE 'Iniciando rollback de Optimización 3: Jobs Asíncronos';

-- ============================================================================
-- 1. Restaurar función original de update directo
-- ============================================================================

CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar popularidad directamente
  UPDATE universal_products
  SET 
    popularity_score = LEAST(100, popularity_score + 1),
    updated_at = now()
  WHERE id = NEW.universal_product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Reemplazar trigger de queue con update directo
-- ============================================================================

DROP TRIGGER IF EXISTS queue_product_popularity_update ON restaurant_product_usage;

CREATE TRIGGER update_product_popularity
AFTER INSERT ON restaurant_product_usage
FOR EACH ROW
EXECUTE FUNCTION update_product_popularity();

RAISE NOTICE 'Trigger de update directo restaurado';

-- ============================================================================
-- 3. Procesar updates pendientes en queue antes de eliminar
-- ============================================================================

DO $$
DECLARE
  pending_count INTEGER;
  result JSON;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM pending_popularity_updates
  WHERE processed_at IS NULL;
  
  IF pending_count > 0 THEN
    RAISE NOTICE 'Procesando % updates pendientes antes de rollback...', pending_count;
    SELECT process_pending_popularity_updates() INTO result;
    RAISE NOTICE 'Updates procesados: %', result;
  ELSE
    RAISE NOTICE 'No hay updates pendientes';
  END IF;
END $$;

-- ============================================================================
-- 4. Eliminar cron job
-- ============================================================================

DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('process-popularity-updates');
    RAISE NOTICE 'Cron job eliminado';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'pg_cron no disponible, job no eliminado';
  END;
END $$;

-- ============================================================================
-- 5. Eliminar tabla de queue (CUIDADO: esto elimina datos)
-- ============================================================================

-- IMPORTANTE: Comentar esta sección si quieres mantener el historial
DROP TABLE IF EXISTS pending_popularity_updates CASCADE;
RAISE NOTICE 'Tabla de queue eliminada';

-- ============================================================================
-- 6. Eliminar funciones de queue (opcional)
-- ============================================================================

-- Comentar si quieres mantener las funciones
DROP FUNCTION IF EXISTS queue_product_popularity_update();
DROP FUNCTION IF EXISTS process_pending_popularity_updates();
DROP FUNCTION IF EXISTS process_popularity_updates_now();

RAISE NOTICE 'Funciones de queue eliminadas';

-- ============================================================================
-- 7. Verificación
-- ============================================================================

DO $$
DECLARE
  trigger_exists BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  -- Verificar trigger
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_product_popularity'
    AND tgrelid = 'restaurant_product_usage'::regclass
  ) INTO trigger_exists;
  
  -- Verificar que tabla de queue fue eliminada
  SELECT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'pending_popularity_updates'
  ) INTO table_exists;
  
  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'Error: El trigger de update directo no se restauró';
  END IF;
  
  IF table_exists THEN
    RAISE WARNING 'La tabla de queue aún existe (puede ser intencional)';
  END IF;
  
  RAISE NOTICE 'Rollback completado exitosamente';
END $$;

COMMIT;

RAISE NOTICE 'Rollback de Optimización 3 completado';
