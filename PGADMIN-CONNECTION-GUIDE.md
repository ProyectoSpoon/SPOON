# Guía de Conexión pgAdmin

## Acceso a pgAdmin

1. **Abrir pgAdmin en el navegador:**
   ```
   http://localhost:5050
   ```

2. **Credenciales de acceso a pgAdmin:**
   - **Email:** admin@example.com
   - **Contraseña:** spoon_password_2024

## Configuración de Conexión a PostgreSQL

Una vez dentro de pgAdmin, crear una nueva conexión al servidor:

### Pestaña "General"
- **Name:** Spoon Database

### Pestaña "Connection"
- **Host name/address:** postgres
- **Port:** 5432
- **Maintenance database:** spoon_db
- **Username:** postgres
- **Password:** spoon_password_2024

### Configuración Importante
- **Host:** Usar `postgres` (nombre del contenedor), NO `localhost` o `127.0.0.1`
- Esto es porque pgAdmin está ejecutándose dentro de Docker y debe usar el nombre del servicio para conectarse

## Verificación
- Una vez configurado, deberías poder ver la base de datos `spoon_db`
- Podrás ejecutar consultas SQL directamente desde pgAdmin
- Tendrás acceso completo a todas las tablas y datos

## Puertos Utilizados
- **pgAdmin:** http://localhost:5050
- **PostgreSQL:** localhost:5432 (para conexiones externas)
- **PostgreSQL interno:** postgres:5432 (para conexiones entre contenedores)

## Notas
- pgAdmin y PostgreSQL están en la misma red Docker (`spoon_backend`)
- La contraseña se lee desde el archivo `secrets/db_password.txt`
- pgAdmin se reinicia automáticamente si hay problemas
