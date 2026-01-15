-- ============================================================================
-- ROLLBACK: Optimización 1 - Auditoría Selectiva
-- ============================================================================
-- Revierte los cambios de auditoría selectiva a auditoría completa
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

RAISE NOTICE 'Iniciando rollback de Optimización 1: Auditoría Selectiva';

-- ============================================================================
-- 1. Restaurar trigger original en caja_sesiones
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_audit_caja_sesiones ON caja_sesiones;

CREATE TRIGGER trigger_audit_caja_sesiones
AFTER INSERT OR UPDATE OR DELETE ON caja_sesiones
FOR EACH ROW 
EXECUTE FUNCTION audit_caja_sesiones_changes();

RAISE NOTICE 'Trigger original restaurado en caja_sesiones';

-- ============================================================================
-- 2. Restaurar triggers originales en tablas de alto tráfico
-- ============================================================================

-- Tabla: ordenes_mesa
DROP TRIGGER IF EXISTS fn_audit_log_selective_trigger ON ordenes_mesa;
CREATE TRIGGER fn_audit_log
AFTER INSERT OR UPDATE OR DELETE ON ordenes_mesa
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

-- Tabla: transacciones_caja
DROP TRIGGER IF EXISTS fn_audit_log_selective_trigger ON transacciones_caja;
CREATE TRIGGER fn_audit_log
AFTER INSERT OR UPDATE OR DELETE ON transacciones_caja
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

RAISE NOTICE 'Triggers originales restaurados en tablas de alto tráfico';

-- ============================================================================
-- 3. Eliminar función selectiva (opcional, mantener para futuro uso)
-- ============================================================================

-- Comentar esta línea si quieres mantener la función para uso futuro
-- DROP FUNCTION IF EXISTS fn_audit_log_selective();

-- ============================================================================
-- 4. Eliminar índices específicos de auditoría selectiva (opcional)
-- ============================================================================

-- Comentar si quieres mantener los índices
-- DROP INDEX IF EXISTS idx_audit_log_critical_changes;
-- DROP INDEX IF EXISTS idx_audit_log_record_lookup;

-- ============================================================================
-- 5. Verificación
-- ============================================================================

DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname IN ('trigger_audit_caja_sesiones', 'fn_audit_log')
  AND tgrelid IN ('caja_sesiones'::regclass, 'ordenes_mesa'::regclass, 'transacciones_caja'::regclass);
  
  IF trigger_count < 3 THEN
    RAISE WARNING 'No se restauraron todos los triggers esperados';
  ELSE
    RAISE NOTICE 'Rollback completado exitosamente';
    RAISE NOTICE 'Triggers restaurados: %', trigger_count;
  END IF;
END $$;

COMMIT;

RAISE NOTICE 'Rollback de Optimización 1 completado';
