-- ============================================================================
-- Optimización 3: Jobs Asíncronos
-- ============================================================================
-- Objetivo: Reducir latencia general en 30% procesando updates en batch
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Crear tabla de queue para actualizaciones de popularidad
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_popularity_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES universal_products(id) ON DELETE CASCADE,
  increment INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now(),
  processed_at TIMESTAMP,
  
  -- Constraint para evitar valores negativos
  CONSTRAINT positive_increment CHECK (increment > 0)
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_pending_popularity_product 
ON pending_popularity_updates(product_id) 
WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_popularity_created 
ON pending_popularity_updates(created_at) 
WHERE processed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_popularity_processed
ON pending_popularity_updates(processed_at)
WHERE processed_at IS NOT NULL;

-- ============================================================================
-- 2. Crear función para agregar a queue (reemplaza update directo)
-- ============================================================================

CREATE OR REPLACE FUNCTION queue_product_popularity_update()
RETURNS TRIGGER AS $$
BEGIN
  -- En lugar de actualizar directamente, agregar a queue
  INSERT INTO pending_popularity_updates (product_id, increment)
  VALUES (NEW.universal_product_id, 1);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si falla el insert en queue, no fallar la transacción principal
    RAISE WARNING 'Error al agregar update de popularidad a queue: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Crear función de procesamiento batch
-- ============================================================================

CREATE OR REPLACE FUNCTION process_pending_popularity_updates()
RETURNS JSON AS $$
DECLARE
  updates_processed INTEGER;
  products_updated INTEGER;
  start_time TIMESTAMP;
  execution_time NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
  -- Actualizar popularidad en batch
  WITH updates AS (
    SELECT 
      product_id,
      SUM(increment) AS total_increment,
      COUNT(*) AS update_count
    FROM pending_popularity_updates
    WHERE processed_at IS NULL
    GROUP BY product_id
  )
  UPDATE universal_products p
  SET 
    popularity_score = LEAST(100, GREATEST(0, p.popularity_score + u.total_increment)),
    updated_at = now()
  FROM updates u
  WHERE p.id = u.product_id;
  
  GET DIAGNOSTICS products_updated = ROW_COUNT;
  
  -- Marcar como procesados
  UPDATE pending_popularity_updates
  SET processed_at = now()
  WHERE processed_at IS NULL;
  
  GET DIAGNOSTICS updates_processed = ROW_COUNT;
  
  execution_time := EXTRACT(MILLISECOND FROM (clock_timestamp() - start_time));
  
  -- Limpiar registros antiguos (más de 7 días)
  DELETE FROM pending_popularity_updates
  WHERE processed_at < now() - INTERVAL '7 days';
  
  RETURN json_build_object(
    'success', true,
    'products_updated', products_updated,
    'updates_processed', updates_processed,
    'execution_time_ms', execution_time,
    'timestamp', now()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Reemplazar trigger de update directo con queue
-- ============================================================================

-- Eliminar trigger antiguo (update directo)
DROP TRIGGER IF EXISTS update_product_popularity ON restaurant_product_usage;

-- Crear nuevo trigger (queue)
CREATE TRIGGER queue_product_popularity_update
AFTER INSERT ON restaurant_product_usage
FOR EACH ROW
EXECUTE FUNCTION queue_product_popularity_update();

-- ============================================================================
-- 5. Configurar cron job (requiere extensión pg_cron)
-- ============================================================================

-- Verificar si pg_cron está disponible
DO $$
BEGIN
  -- Intentar crear el job
  BEGIN
    -- Eliminar job si ya existe
    PERFORM cron.unschedule('process-popularity-updates');
  EXCEPTION
    WHEN undefined_table THEN
      RAISE WARNING 'Extensión pg_cron no disponible. El job debe configurarse manualmente.';
      RAISE WARNING 'Comando: SELECT cron.schedule(''process-popularity-updates'', ''0 * * * *'', $$SELECT process_pending_popularity_updates()$$);';
  END;
  
  -- Crear job para ejecutar cada hora
  BEGIN
    PERFORM cron.schedule(
      'process-popularity-updates',
      '0 * * * *',  -- Cada hora en punto
      $$SELECT process_pending_popularity_updates()$$
    );
    RAISE NOTICE 'Cron job configurado exitosamente';
  EXCEPTION
    WHEN undefined_table THEN
      NULL; -- Ya mostramos el warning arriba
  END;
END $$;

-- ============================================================================
-- 6. Crear función para procesamiento manual (útil para testing)
-- ============================================================================

CREATE OR REPLACE FUNCTION process_popularity_updates_now()
RETURNS JSON AS $$
BEGIN
  RETURN process_pending_popularity_updates();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_popularity_updates_now() IS 
'Procesa manualmente las actualizaciones de popularidad pendientes. Útil para testing o procesamiento bajo demanda.';

-- ============================================================================
-- 7. Migrar datos existentes (si hay updates pendientes)
-- ============================================================================

DO $$
DECLARE
  pending_count INTEGER;
BEGIN
  -- Contar updates pendientes en queue
  SELECT COUNT(*) INTO pending_count
  FROM pending_popularity_updates
  WHERE processed_at IS NULL;
  
  IF pending_count > 0 THEN
    RAISE NOTICE 'Procesando % updates pendientes...', pending_count;
    PERFORM process_pending_popularity_updates();
    RAISE NOTICE 'Updates procesados';
  ELSE
    RAISE NOTICE 'No hay updates pendientes';
  END IF;
END $$;

-- ============================================================================
-- 8. Verificación final
-- ============================================================================

DO $$
DECLARE
  trigger_exists BOOLEAN;
  table_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Verificar tabla
  SELECT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'pending_popularity_updates'
  ) INTO table_exists;
  
  -- Verificar trigger
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'queue_product_popularity_update'
  ) INTO trigger_exists;
  
  -- Verificar función
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'process_pending_popularity_updates'
  ) INTO function_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'Error: Tabla pending_popularity_updates no se creó';
  END IF;
  
  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'Error: Trigger queue_product_popularity_update no se creó';
  END IF;
  
  IF NOT function_exists THEN
    RAISE EXCEPTION 'Error: Función process_pending_popularity_updates no se creó';
  END IF;
  
  RAISE NOTICE 'Optimización 3 aplicada exitosamente';
  RAISE NOTICE 'Tabla, trigger y funciones creados correctamente';
  RAISE NOTICE 'Para procesar manualmente: SELECT process_popularity_updates_now();';
END $$;

COMMIT;

-- ============================================================================
-- Fin de script de optimización 3
-- ============================================================================
