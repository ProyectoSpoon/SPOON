-- ============================================================================
-- TESTING: Optimizaciones de Performance
-- ============================================================================
-- Suite de tests para validar las 3 optimizaciones
-- Fecha: 2026-01-14
-- ============================================================================

-- ============================================================================
-- TEST 1: Auditoría Selectiva
-- ============================================================================

DO $$
DECLARE
  audit_count_before INTEGER;
  audit_count_after INTEGER;
  test_sesion_id UUID;
BEGIN
  RAISE NOTICE '=== TEST 1: Auditoría Selectiva ===';
  
  -- Crear sesión de prueba
  INSERT INTO caja_sesiones (restaurant_id, cajero_id, monto_inicial, estado)
  VALUES (
    (SELECT id FROM restaurants LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    50000,
    'abierta'
  ) RETURNING id INTO test_sesion_id;
  
  -- Test 1.1: Cambio crítico DEBE auditarse
  SELECT COUNT(*) INTO audit_count_before
  FROM audit_caja_sesiones WHERE record_id = test_sesion_id;
  
  UPDATE caja_sesiones 
  SET estado = 'cerrada', cerrada_at = now()
  WHERE id = test_sesion_id;
  
  SELECT COUNT(*) INTO audit_count_after
  FROM audit_caja_sesiones WHERE record_id = test_sesion_id;
  
  IF audit_count_after > audit_count_before THEN
    RAISE NOTICE '✓ Test 1.1 PASADO: Cambio crítico auditado';
  ELSE
    RAISE WARNING '✗ Test 1.1 FALLIDO: Cambio crítico NO auditado';
  END IF;
  
  -- Test 1.2: Cambio no crítico NO debe auditarse
  audit_count_before := audit_count_after;
  
  UPDATE caja_sesiones 
  SET notas_cierre = 'Test de auditoría'
  WHERE id = test_sesion_id;
  
  SELECT COUNT(*) INTO audit_count_after
  FROM audit_caja_sesiones WHERE record_id = test_sesion_id;
  
  IF audit_count_after = audit_count_before THEN
    RAISE NOTICE '✓ Test 1.2 PASADO: Cambio no crítico NO auditado';
  ELSE
    RAISE WARNING '✗ Test 1.2 FALLIDO: Cambio no crítico fue auditado';
  END IF;
  
  -- Limpiar
  DELETE FROM caja_sesiones WHERE id = test_sesion_id;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- TEST 2: Batch Updates
-- ============================================================================

DO $$
DECLARE
  test_orden_id UUID;
  monto_esperado INTEGER := 45000;
  monto_real INTEGER;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  execution_time NUMERIC;
BEGIN
  RAISE NOTICE '=== TEST 2: Batch Updates ===';
  
  -- Crear orden de prueba
  INSERT INTO ordenes_mesa (restaurant_id, numero_mesa, monto_total, estado)
  VALUES (
    (SELECT id FROM restaurants LIMIT 1),
    999,
    0,
    'activa'
  ) RETURNING id INTO test_orden_id;
  
  -- Test 2.1: Insertar múltiples items y verificar cálculo correcto
  start_time := clock_timestamp();
  
  INSERT INTO items_orden_mesa (orden_mesa_id, combinacion_id, cantidad, precio_unitario)
  VALUES 
    (test_orden_id, (SELECT id FROM generated_combinations LIMIT 1), 1, 15000),
    (test_orden_id, (SELECT id FROM generated_combinations LIMIT 1 OFFSET 1), 1, 15000),
    (test_orden_id, (SELECT id FROM generated_combinations LIMIT 1 OFFSET 2), 1, 15000);
  
  end_time := clock_timestamp();
  execution_time := EXTRACT(MILLISECOND FROM (end_time - start_time));
  
  SELECT monto_total INTO monto_real
  FROM ordenes_mesa WHERE id = test_orden_id;
  
  IF monto_real = monto_esperado THEN
    RAISE NOTICE '✓ Test 2.1 PASADO: Monto total correcto (% = %)', monto_real, monto_esperado;
    RAISE NOTICE '  Tiempo de ejecución: % ms', execution_time;
  ELSE
    RAISE WARNING '✗ Test 2.1 FALLIDO: Monto incorrecto (esperado: %, real: %)', monto_esperado, monto_real;
  END IF;
  
  -- Test 2.2: Verificar performance (debe ser < 100ms para 3 items)
  IF execution_time < 100 THEN
    RAISE NOTICE '✓ Test 2.2 PASADO: Performance aceptable (< 100ms)';
  ELSE
    RAISE WARNING '✗ Test 2.2 FALLIDO: Performance lenta (% ms)', execution_time;
  END IF;
  
  -- Limpiar
  DELETE FROM items_orden_mesa WHERE orden_mesa_id = test_orden_id;
  DELETE FROM ordenes_mesa WHERE id = test_orden_id;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- TEST 3: Jobs Asíncronos
-- ============================================================================

DO $$
DECLARE
  test_product_id UUID;
  queue_count_before INTEGER;
  queue_count_after INTEGER;
  popularity_before INTEGER;
  popularity_after INTEGER;
  result JSON;
BEGIN
  RAISE NOTICE '=== TEST 3: Jobs Asíncronos ===';
  
  -- Seleccionar producto de prueba
  SELECT id, popularity_score INTO test_product_id, popularity_before
  FROM universal_products LIMIT 1;
  
  -- Test 3.1: Verificar que update va a queue
  SELECT COUNT(*) INTO queue_count_before
  FROM pending_popularity_updates
  WHERE product_id = test_product_id AND processed_at IS NULL;
  
  INSERT INTO restaurant_product_usage (restaurant_id, universal_product_id)
  VALUES (
    (SELECT id FROM restaurants LIMIT 1),
    test_product_id
  );
  
  SELECT COUNT(*) INTO queue_count_after
  FROM pending_popularity_updates
  WHERE product_id = test_product_id AND processed_at IS NULL;
  
  IF queue_count_after > queue_count_before THEN
    RAISE NOTICE '✓ Test 3.1 PASADO: Update agregado a queue';
  ELSE
    RAISE WARNING '✗ Test 3.1 FALLIDO: Update NO agregado a queue';
  END IF;
  
  -- Test 3.2: Procesar queue y verificar actualización
  SELECT process_popularity_updates_now() INTO result;
  
  SELECT popularity_score INTO popularity_after
  FROM universal_products WHERE id = test_product_id;
  
  IF popularity_after > popularity_before THEN
    RAISE NOTICE '✓ Test 3.2 PASADO: Popularidad actualizada (% → %)', popularity_before, popularity_after;
    RAISE NOTICE '  Resultado del procesamiento: %', result;
  ELSE
    RAISE WARNING '✗ Test 3.2 FALLIDO: Popularidad NO actualizada';
  END IF;
  
  -- Test 3.3: Verificar que updates fueron marcados como procesados
  SELECT COUNT(*) INTO queue_count_after
  FROM pending_popularity_updates
  WHERE product_id = test_product_id AND processed_at IS NULL;
  
  IF queue_count_after = 0 THEN
    RAISE NOTICE '✓ Test 3.3 PASADO: Updates marcados como procesados';
  ELSE
    RAISE WARNING '✗ Test 3.3 FALLIDO: % updates aún pendientes', queue_count_after;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- TEST 4: Performance Benchmark
-- ============================================================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  test_orden_id UUID;
  i INTEGER;
BEGIN
  RAISE NOTICE '=== TEST 4: Performance Benchmark ===';
  
  -- Crear orden de prueba
  INSERT INTO ordenes_mesa (restaurant_id, numero_mesa, monto_total, estado)
  VALUES (
    (SELECT id FROM restaurants LIMIT 1),
    998,
    0,
    'activa'
  ) RETURNING id INTO test_orden_id;
  
  -- Benchmark: Insertar 10 items
  start_time := clock_timestamp();
  
  FOR i IN 1..10 LOOP
    INSERT INTO items_orden_mesa (orden_mesa_id, combinacion_id, cantidad, precio_unitario)
    VALUES (
      test_orden_id,
      (SELECT id FROM generated_combinations LIMIT 1 OFFSET (i % 5)),
      1,
      15000
    );
  END LOOP;
  
  end_time := clock_timestamp();
  
  RAISE NOTICE 'Tiempo para insertar 10 items: % ms', 
    EXTRACT(MILLISECOND FROM (end_time - start_time));
  RAISE NOTICE 'Promedio por item: % ms', 
    EXTRACT(MILLISECOND FROM (end_time - start_time)) / 10;
  
  -- Limpiar
  DELETE FROM items_orden_mesa WHERE orden_mesa_id = test_orden_id;
  DELETE FROM ordenes_mesa WHERE id = test_orden_id;
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- RESUMEN DE TESTS
-- ============================================================================

RAISE NOTICE '=== RESUMEN ===';
RAISE NOTICE 'Tests completados. Revisar resultados arriba.';
RAISE NOTICE 'Buscar ✓ para tests pasados y ✗ para tests fallidos.';
