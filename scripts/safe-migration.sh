#!/bin/bash

# ===================================================================
# SPOON Database Migration Script v2.0
# Migración segura de estructura actual a nueva arquitectura con esquemas
# ===================================================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración de base de datos
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-spoon_db}
DB_PASSWORD_FILE=${DB_PASSWORD_FILE:-./secrets/db_password.txt}

# Directorios
BACKUP_DIR="./backups"
SCRIPTS_DIR="./scripts"

# Timestamp para archivos
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v psql &> /dev/null; then
        error "psql no está instalado. Instala PostgreSQL client."
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump no está instalado. Instala PostgreSQL client."
        exit 1
    fi
    
    success "Dependencias verificadas"
}

# Función para verificar conexión a base de datos
check_db_connection() {
    log "Verificando conexión a base de datos..."
    
    if [ -f "$DB_PASSWORD_FILE" ]; then
        export PGPASSWORD=$(cat "$DB_PASSWORD_FILE")
    else
        error "Archivo de contraseña no encontrado: $DB_PASSWORD_FILE"
        exit 1
    fi
    
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        error "No se puede conectar a la base de datos"
        error "Host: $DB_HOST, Port: $DB_PORT, User: $DB_USER, Database: $DB_NAME"
        exit 1
    fi
    
    success "Conexión a base de datos verificada"
}

# Función para crear directorio de backups
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log "Directorio de backups creado: $BACKUP_DIR"
    fi
}

# Función para crear backup completo
create_backup() {
    log "Creando backup completo de la base de datos..."
    
    local backup_file="$BACKUP_DIR/backup_pre_migration_$TIMESTAMP.sql"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        success "Backup creado: $backup_file"
        echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
    else
        error "Error creando backup"
        exit 1
    fi
}

# Función para exportar datos críticos
export_critical_data() {
    log "Exportando datos críticos..."
    
    local data_dir="$BACKUP_DIR/critical_data_$TIMESTAMP"
    mkdir -p "$data_dir"
    
    # Exportar productos si existen
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt productos" &> /dev/null; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY (SELECT * FROM productos) TO '$data_dir/productos.csv' WITH CSV HEADER;" || true
    fi
    
    # Exportar categorías si existen
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt categorias" &> /dev/null; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY (SELECT * FROM categorias) TO '$data_dir/categorias.csv' WITH CSV HEADER;" || true
    fi
    
    # Exportar combinaciones si existen
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt combinaciones" &> /dev/null; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\COPY (SELECT * FROM combinaciones) TO '$data_dir/combinaciones.csv' WITH CSV HEADER;" || true
    fi
    
    success "Datos críticos exportados a: $data_dir"
}

# Función para mostrar estructura actual
show_current_structure() {
    log "Estructura actual de la base de datos:"
    
    echo "=== TABLAS EXISTENTES ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" || true
    
    echo -e "\n=== ESQUEMAS EXISTENTES ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dn" || true
}

# Función para eliminar estructura actual
drop_current_structure() {
    log "Eliminando estructura actual..."
    
    warning "¡ATENCIÓN! Se eliminarán todas las tablas existentes"
    
    # Script para eliminar tablas actuales
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Eliminar tablas en orden correcto para evitar errores de FK
DROP TABLE IF EXISTS combinacion_productos CASCADE;
DROP TABLE IF EXISTS combinaciones CASCADE;
DROP TABLE IF EXISTS menu_productos CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS stock_actualizaciones CASCADE;
DROP TABLE IF EXISTS producto_versiones CASCADE;
DROP TABLE IF EXISTS precio_historial CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS restaurantes CASCADE;

-- Eliminar funciones y triggers si existen
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Limpiar tipos enum si existen
DROP TYPE IF EXISTS auth_role_enum CASCADE;
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS price_range_enum CASCADE;
DROP TYPE IF EXISTS restaurant_status_enum CASCADE;
DROP TYPE IF EXISTS category_type_enum CASCADE;
DROP TYPE IF EXISTS product_status_enum CASCADE;
DROP TYPE IF EXISTS version_status_enum CASCADE;
DROP TYPE IF EXISTS stock_movement_enum CASCADE;
DROP TYPE IF EXISTS daily_menu_status_enum CASCADE;
DROP TYPE IF EXISTS order_type_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS order_item_status_enum CASCADE;
DROP TYPE IF EXISTS log_severity_enum CASCADE;
DROP TYPE IF EXISTS publication_action_enum CASCADE;
DROP TYPE IF EXISTS setting_type_enum CASCADE;

-- Eliminar esquemas si existen
DROP SCHEMA IF EXISTS auth CASCADE;
DROP SCHEMA IF EXISTS restaurant CASCADE;
DROP SCHEMA IF EXISTS menu CASCADE;
DROP SCHEMA IF EXISTS sales CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;
DROP SCHEMA IF EXISTS config CASCADE;

EOF
    
    success "Estructura actual eliminada"
}

# Función para aplicar nueva estructura
apply_new_structure() {
    log "Aplicando nueva estructura de base de datos..."
    
    if [ ! -f "$SCRIPTS_DIR/create-complete-database-structure.sql" ]; then
        error "Script de nueva estructura no encontrado: $SCRIPTS_DIR/create-complete-database-structure.sql"
        exit 1
    fi
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPTS_DIR/create-complete-database-structure.sql"; then
        success "Nueva estructura aplicada correctamente"
    else
        error "Error aplicando nueva estructura"
        exit 1
    fi
}

# Función para verificar nueva estructura
verify_new_structure() {
    log "Verificando nueva estructura..."
    
    echo "=== ESQUEMAS CREADOS ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dn"
    
    echo -e "\n=== TABLAS EN ESQUEMA auth ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt auth.*"
    
    echo -e "\n=== TABLAS EN ESQUEMA restaurant ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt restaurant.*"
    
    echo -e "\n=== TABLAS EN ESQUEMA menu ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt menu.*"
    
    echo -e "\n=== TABLAS EN ESQUEMA sales ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt sales.*"
    
    echo -e "\n=== DATOS DE EJEMPLO ==="
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as usuarios FROM auth.users;"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as restaurantes FROM restaurant.restaurants;"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as categorias FROM menu.categories;"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as productos FROM menu.products;"
    
    success "Verificación de estructura completada"
}

# Función para crear script de rollback
create_rollback_script() {
    local rollback_script="$BACKUP_DIR/rollback_$TIMESTAMP.sh"
    local backup_file=$(cat "$BACKUP_DIR/latest_backup.txt")
    
    cat > "$rollback_script" << EOF
#!/bin/bash
# Script de rollback automático generado el $TIMESTAMP

echo "Ejecutando rollback de migración..."

# Restaurar backup
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$backup_file"

echo "Rollback completado. Base de datos restaurada al estado anterior."
EOF
    
    chmod +x "$rollback_script"
    success "Script de rollback creado: $rollback_script"
}

# Función principal de migración
run_migration() {
    log "=== INICIANDO MIGRACIÓN SPOON DATABASE v2.0 ==="
    
    # Verificaciones previas
    check_dependencies
    check_db_connection
    create_backup_dir
    
    # Mostrar estructura actual
    show_current_structure
    
    # Crear backups
    create_backup
    export_critical_data
    create_rollback_script
    
    # Confirmar migración
    echo ""
    warning "¿Estás seguro de que quieres proceder con la migración?"
    warning "Esto eliminará TODOS los datos actuales y creará la nueva estructura."
    read -p "Escribe 'CONFIRMAR' para continuar: " confirmation
    
    if [ "$confirmation" != "CONFIRMAR" ]; then
        log "Migración cancelada por el usuario"
        exit 0
    fi
    
    # Ejecutar migración
    log "Iniciando migración..."
    drop_current_structure
    apply_new_structure
    verify_new_structure
    
    success "=== MIGRACIÓN COMPLETADA EXITOSAMENTE ==="
    success "Nueva estructura de base de datos implementada"
    success "Datos de ejemplo cargados"
    success "Sistema listo para usar"
    
    echo ""
    log "Próximos pasos:"
    echo "1. Actualizar configuración de APIs"
    echo "2. Ejecutar tests de verificación"
    echo "3. Actualizar tipos TypeScript"
    echo ""
    log "En caso de problemas, ejecutar rollback:"
    echo "bash $BACKUP_DIR/rollback_$TIMESTAMP.sh"
}

# Función para mostrar ayuda
show_help() {
    echo "SPOON Database Migration Script v2.0"
    echo ""
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  migrate     Ejecutar migración completa (por defecto)"
    echo "  backup      Solo crear backup"
    echo "  verify      Solo verificar conexión"
    echo "  rollback    Mostrar instrucciones de rollback"
    echo "  help        Mostrar esta ayuda"
    echo ""
    echo "Variables de entorno:"
    echo "  DB_HOST     Host de PostgreSQL (default: localhost)"
    echo "  DB_PORT     Puerto de PostgreSQL (default: 5432)"
    echo "  DB_USER     Usuario de PostgreSQL (default: postgres)"
    echo "  DB_NAME     Nombre de base de datos (default: spoon_db)"
    echo "  DB_PASSWORD_FILE  Archivo con contraseña (default: ./secrets/db_password.txt)"
}

# Función para solo backup
backup_only() {
    log "=== CREANDO BACKUP ÚNICAMENTE ==="
    check_dependencies
    check_db_connection
    create_backup_dir
    create_backup
    export_critical_data
    success "Backup completado"
}

# Función para verificar conexión
verify_only() {
    log "=== VERIFICANDO CONEXIÓN ==="
    check_dependencies
    check_db_connection
    show_current_structure
    success "Verificación completada"
}

# Función para mostrar instrucciones de rollback
show_rollback_info() {
    echo "=== INSTRUCCIONES DE ROLLBACK ==="
    echo ""
    echo "Para revertir la migración:"
    echo ""
    echo "1. Buscar el backup más reciente:"
    echo "   ls -la backups/backup_pre_migration_*.sql"
    echo ""
    echo "2. Restaurar backup:"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backups/backup_pre_migration_TIMESTAMP.sql"
    echo ""
    echo "3. O usar script de rollback automático:"
    echo "   bash backups/rollback_TIMESTAMP.sh"
    echo ""
    echo "4. Revertir cambios en código (si se aplicaron):"
    echo "   git checkout HEAD~1 -- src/config/ src/lib/ src/app/api/"
}

# Punto de entrada principal
case "${1:-migrate}" in
    migrate)
        run_migration
        ;;
    backup)
        backup_only
        ;;
    verify)
        verify_only
        ;;
    rollback)
        show_rollback_info
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac
