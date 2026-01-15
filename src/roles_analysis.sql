-- 6.1 Estructura de roles y usuarios por restaurante
\d+ restaurant.restaurant_roles;
\d+ restaurant.restaurant_users;

-- 6.2 Distribución de empleados por restaurante
SELECT 
    r.name as restaurant_name,
    COUNT(ru.id) as employee_count,
    STRING_AGG(DISTINCT rr.role_name, ', ') as roles_in_restaurant
FROM restaurant.restaurants r
LEFT JOIN restaurant.restaurant_users ru ON r.id = ru.restaurant_id
LEFT JOIN restaurant.restaurant_roles rr ON ru.role_id = rr.id
WHERE r.status = 'active'
GROUP BY r.id, r.name
ORDER BY employee_count DESC;

-- 6.3 Roles más comunes en el sistema
SELECT 
    rr.role_name,
    rr.permissions,
    COUNT(ru.id) as users_with_role
FROM restaurant.restaurant_roles rr
LEFT JOIN restaurant.restaurant_users ru ON rr.id = ru.role_id
GROUP BY rr.id, rr.role_name, rr.permissions
ORDER BY users_with_role DESC;

-- 6.4 Usuarios que trabajan en múltiples restaurantes
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    COUNT(ru.restaurant_id) as restaurants_count,
    STRING_AGG(r.name, ' | ') as restaurant_names
FROM auth.users u
JOIN restaurant.restaurant_users ru ON u.id = ru.user_id
JOIN restaurant.restaurants r ON ru.restaurant_id = r.id
WHERE r.status = 'active'
GROUP BY u.id, u.email, u.first_name, u.last_name
HAVING COUNT(ru.restaurant_id) > 1
ORDER BY restaurants_count DESC;
