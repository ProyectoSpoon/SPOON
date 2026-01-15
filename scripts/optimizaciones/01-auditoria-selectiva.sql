-- ============================================================================
-- Optimización 1: Auditoría Selectiva
-- ============================================================================
-- Objetivo: Reducir overhead de auditoría en 40% auditando solo campos críticos
-- Fecha: 2026-01-14
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Crear función de auditoría selectiva
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_log_selective()
RETURNS TRIGGER AS $$
DECLARE
  critical_fields TEXT[];
  old_values JSONB;
  new_values JSONB;
  field TEXT;
  has_critical_change BOOLEAN := FALSE;
BEGIN
  -- Definir campos críticos por tabla
  CASE TG_TABLE_NAME
    WHEN 'ordenes_mesa' THEN
      critical_fields := ARRAY['estado', 'monto_total', 'pagada_at', 'mesa_id'];
    WHEN 'transacciones_caja' THEN
      critical_fields := ARRAY['monto', 'metodo_pago', 'tipo_transaccion', 'caja_sesion_id'];
    WHEN 'universal_products' THEN
      critical_fields := ARRAY['name', 'category_id', 'is_verified', 'popularity_score'];
    ELSE
      -- Para otras tablas, auditar todo (comportamiento por defecto)
      critical_fields := NULL;
  END CASE;

  -- Si no hay campos críticos definidos, auditar todo
  IF critical_fields IS NULL THEN
    INSERT INTO audit_log (
      table_name,
      operation,
      record_id,
      old_values,
      new_values,
      user_id,
      timestamp
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
      auth.uid(),
      now()
    );
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Para UPDATE, verificar si algún campo crítico cambió
  IF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
    
    -- Verificar cambios en campos críticos
    FOREACH field IN ARRAY critical_fields
    LOOP
      IF old_values->field IS DISTINCT FROM new_values->field THEN
        has_critical_change := TRUE;
        EXIT;
      END IF;
    END LOOP;
    
    -- Si no hay cambios críticos, no auditar
    IF NOT has_critical_change THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Construir JSONB solo con campos críticos
  IF TG_OP != 'INSERT' THEN
    old_values := jsonb_object(
      critical_fields,
      ARRAY(SELECT old_values->f FROM unnest(critical_fields) AS f)
    );
  ELSE
    old_values := NULL;
  END IF;

  IF TG_OP != 'DELETE' THEN
    new_values := jsonb_object(
      critical_fields,
      ARRAY(SELECT new_values->f FROM unnest(critical_fields) AS f)
    );
  ELSE
    new_values := NULL;
  END IF;

  -- Insertar en audit_log solo con campos críticos
  INSERT INTO audit_log (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    user_id,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    old_values,
    new_values,
    auth.uid(),
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Modificar trigger en caja_sesiones (auditoría selectiva)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_audit_caja_sesiones ON caja_sesiones;

CREATE TRIGGER trigger_audit_caja_sesiones
AFTER INSERT OR UPDATE OR DELETE ON caja_sesiones
FOR EACH ROW
WHEN (
  -- Solo auditar en estos casos:
  TG_OP = 'DELETE' OR 
  TG_OP = 'INSERT' OR
  (TG_OP = 'UPDATE' AND (
    -- Cambios en campos críticos
    OLD.estado IS DISTINCT FROM NEW.estado OR
    OLD.saldo_final_reportado IS DISTINCT FROM NEW.saldo_final_reportado OR
    OLD.saldo_final_calculado IS DISTINCT FROM NEW.saldo_final_calculado OR
    OLD.diferencia_caja IS DISTINCT FROM NEW.diferencia_caja OR
    OLD.conciliada IS DISTINCT FROM NEW.conciliada OR
    OLD.cerrada_at IS DISTINCT FROM NEW.cerrada_at OR
    OLD.abierta_at IS DISTINCT FROM NEW.abierta_at
  ))
)
EXECUTE FUNCTION audit_caja_sesiones_changes();

-- ============================================================================
-- 3. Reemplazar triggers en tablas de alto tráfico
-- ============================================================================

-- Tabla: ordenes_mesa
DROP TRIGGER IF EXISTS fn_audit_log ON ordenes_mesa;
CREATE TRIGGER fn_audit_log_selective_trigger
AFTER INSERT OR UPDATE OR DELETE ON ordenes_mesa
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log_selective();

-- Tabla: transacciones_caja
DROP TRIGGER IF EXISTS fn_audit_log ON transacciones_caja;
CREATE TRIGGER fn_audit_log_selective_trigger
AFTER INSERT OR UPDATE OR DELETE ON transacciones_caja
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log_selective();

-- ============================================================================
-- 4. Crear índice para queries de auditoría optimizadas
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_critical_changes 
ON audit_log(table_name, operation, timestamp DESC)
WHERE new_values IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_record_lookup
ON audit_log(record_id, timestamp DESC);

-- ============================================================================
-- 5. Verificación de integridad
-- ============================================================================

DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  -- Verificar que los triggers se crearon correctamente
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname IN (
    'trigger_audit_caja_sesiones',
    'fn_audit_log_selective_trigger'
  );
  
  IF trigger_count < 2 THEN
    RAISE EXCEPTION 'Error: No se crearon todos los triggers esperados';
  END IF;
  
  RAISE NOTICE 'Optimización 1 aplicada exitosamente';
  RAISE NOTICE 'Triggers creados: %', trigger_count;
END $$;

COMMIT;

-- ============================================================================
-- Fin de script de optimización 1
-- ============================================================================
