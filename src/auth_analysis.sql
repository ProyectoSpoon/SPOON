-- 2.1 Estructura completa de autenticación
\d+ auth.users;
\d+ auth.user_sessions;

-- 2.2 Distribución de roles de usuarios
SELECT 
    role,
    status,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM auth.users
GROUP BY role, status
ORDER BY role, status;

-- 2.3 Actividad de usuarios
SELECT 
    DATE_TRUNC('day', created_at) as registration_date,
    COUNT(*) as new_users,
    SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as cumulative_users
FROM auth.users
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY registration_date;

-- 2.4 Usuarios con email verificado vs sin verificar
SELECT 
    email_verified,
    status,
    COUNT(*) as count
FROM auth.users
GROUP BY email_verified, status;

-- 2.5 Análisis de sesiones activas
SELECT 
    COUNT(*) as total_sessions,
    COUNT(DISTINCT user_id) as unique_users_with_sessions,
    MIN(created_at) as oldest_session,
    MAX(created_at) as newest_session
FROM auth.user_sessions;
