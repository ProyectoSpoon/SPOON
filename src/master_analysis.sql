-- ======================================================
-- 🚀 SPOON DATABASE MASTER ANALYSIS SCRIPT
-- ======================================================
-- Ejecutar en psql: \i master_analysis.sql

\timing on
\echo '🚀 INICIANDO ANÁLISIS COMPLETO DE SPOON DATABASE'
\echo '================================================='

\echo '\n📊 1. ANÁLISIS GENERAL'
\i temp_query.sql

\echo '\n👥 2. ANÁLISIS DE AUTENTICACIÓN'
\i auth_analysis.sql

\echo '\n🏪 3. ANÁLISIS DE RESTAURANTES'
\i restaurant_analysis.sql

\echo '\n⏰ 4. ANÁLISIS DE HORARIOS'
\i business_hours_analysis.sql

\echo '\n🍽️ 5. ANÁLISIS DE MENÚ'
\i menu_analysis.sql

\echo '\n🔐 6. ANÁLISIS DE ROLES'
\i roles_analysis.sql

\echo '\n🛠️ 7. ANÁLISIS TÉCNICO'
\i technical_analysis.sql

\echo '\n📈 8. ANÁLISIS DE PERFORMANCE'
\i performance_analysis.sql

\echo '\n🎯 9. ANÁLISIS DE NEGOCIO'
\i business_analysis.sql

\echo '\n✅ ANÁLISIS COMPLETO TERMINADO'
\timing off
