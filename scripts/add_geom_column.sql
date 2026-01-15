-- scripts/add_geom_column.sql

-- 1. Activar Extensión (Idempotente)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Añadir Columna geom si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='restaurant' AND table_name='restaurants' AND column_name='geom') THEN
        ALTER TABLE restaurant.restaurants ADD COLUMN geom GEOGRAPHY(Point, 4326);
    END IF;
END
$$;

-- 3. Migrar datos existentes (Safe Update)
-- Solo migra si latitude/longitude NO son nulos Y NO son 0,0 (que suele ser el default erróneo)
-- También verifica rangos válidos para evitar errores de geografía
UPDATE restaurant.restaurants 
SET geom = ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND NOT (latitude = 0 AND longitude = 0)
  AND latitude BETWEEN -90 AND 90
  AND longitude BETWEEN -180 AND 180;

-- 4. Crear Índice Espacial (Idempotente)
CREATE INDEX IF NOT EXISTS idx_restaurants_geom ON restaurant.restaurants USING GIST (geom);
