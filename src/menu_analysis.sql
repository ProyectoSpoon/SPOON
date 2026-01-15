-- 5.1 Estructura de productos y menús
\d+ system.products;
\d+ system.categories;
\d+ restaurant.menu_items;
\d+ restaurant.menu_pricing;
\d+ restaurant.favorite_products;

-- 5.2 Distribución de productos por categoría
SELECT 
    c.name as category,
    COUNT(p.id) as product_count
FROM system.categories c
LEFT JOIN system.products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- 5.3 Análisis de precios de productos
SELECT 
    c.name as category,
    COUNT(mp.id) as priced_items,
    MIN(mp.price) as min_price,
    MAX(mp.price) as max_price,
    AVG(mp.price) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mp.price) as median_price
FROM restaurant.menu_pricing mp
JOIN restaurant.menu_items mi ON mp.menu_item_id = mi.id
JOIN system.products p ON mi.product_id = p.id
JOIN system.categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY avg_price DESC;

-- 5.4 Restaurantes con más productos en menú
SELECT 
    r.name as restaurant_name,
    COUNT(mi.id) as menu_items_count,
    COUNT(mp.id) as priced_items_count
FROM restaurant.restaurants r
LEFT JOIN restaurant.menu_items mi ON r.id = mi.restaurant_id
LEFT JOIN restaurant.menu_pricing mp ON mi.id = mp.menu_item_id
WHERE r.status = 'active'
GROUP BY r.id, r.name
ORDER BY menu_items_count DESC
LIMIT 10;

-- 5.5 Productos favoritos más populares
SELECT 
    p.name as product_name,
    c.name as category,
    COUNT(fp.id) as times_favorited
FROM restaurant.favorite_products fp
JOIN system.products p ON fp.product_id = p.id
JOIN system.categories c ON p.category_id = c.id
GROUP BY p.id, p.name, c.name
ORDER BY times_favorited DESC
LIMIT 20;
