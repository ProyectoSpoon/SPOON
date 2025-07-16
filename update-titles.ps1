# Script para agregar títulos dinámicos a todas las páginas del dashboard
$BASE_PATH = "C:\APP\SPOON\src\app\dashboard"

# Mapeo de rutas a títulos
$PAGE_TITLES = @{
    "page.tsx" = @{ title = "Dashboard"; subtitle = "Panel principal de control" }
    "auditoria" = @{ title = "Auditoría"; subtitle = "Registro de actividades del sistema" }
    "carta" = @{ title = "Gestión de Carta"; subtitle = "Administración del menú y productos" }
    "carta\combinaciones" = @{ title = "Combinaciones"; subtitle = "Gestión de combinaciones de productos" }
    "carta\especiales" = @{ title = "Especiales"; subtitle = "Productos especiales del día" }
    "carta\favoritos" = @{ title = "Favoritos"; subtitle = "Productos favoritos del restaurante" }
    "carta\menu-dia" = @{ title = "Menú del Día"; subtitle = "Gestión del menú diario del restaurante" }
    "carta\programacion-semanal" = @{ title = "Programación Semanal"; subtitle = "Planificación de menús semanales" }
    "configuracion" = @{ title = "Configuración"; subtitle = "Configuraciones generales del sistema" }
    "configuracion\categorias" = @{ title = "Configuración de Categorías"; subtitle = "Gestión de categorías de productos" }
    "configuracion\horario-comercial" = @{ title = "Horario Comercial"; subtitle = "Configuración de horarios de atención" }
    "configuracion\horario-comercial-simple" = @{ title = "Horario Comercial"; subtitle = "Configuración simple de horarios" }
    "configuracion\usuarios" = @{ title = "Gestión de Usuarios"; subtitle = "Administración de usuarios del sistema" }
    "configuracion\usuarios\roles" = @{ title = "Roles de Usuario"; subtitle = "Configuración de roles y permisos" }
    "estadisticas" = @{ title = "Estadísticas"; subtitle = "Análisis y reportes del negocio" }
    "estadisticas\analisis-ventas" = @{ title = "Análisis de Ventas"; subtitle = "Reportes detallados de ventas" }
    "estadisticas\components\AnalisisVentas" = @{ title = "Análisis de Ventas"; subtitle = "Componentes de análisis" }
    "estadisticas\rendimiento-menu" = @{ title = "Rendimiento del Menú"; subtitle = "Análisis de popularidad de productos" }
    "estadisticas\tendencias" = @{ title = "Tendencias"; subtitle = "Tendencias de ventas y comportamiento" }
    "gestion-ordenes" = @{ title = "Gestión de Órdenes"; subtitle = "Administración de pedidos y órdenes" }
    "menu-dia" = @{ title = "Menú del Día"; subtitle = "Gestión del menú diario" }
    "registro-ventas" = @{ title = "Registro de Ventas"; subtitle = "Control y registro de ventas diarias" }
}

function Add-DynamicTitle {
    param(
        [string]$FilePath,
        [string]$Title,
        [string]$Subtitle
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "⚠️  Archivo no encontrado: $FilePath" -ForegroundColor Yellow
        return
    }
    
    $content = Get-Content $FilePath -Raw
    
    # Verificar si ya tiene el import
    if ($content -match "useSetPageTitle") {
        Write-Host "✅ Ya procesado: $FilePath" -ForegroundColor Green
        return
    }
    
    # Verificar si es un archivo React válido
    if (-not ($content -match "export default function" -or $content -match "export function")) {
        Write-Host "⚠️  No es un componente React válido: $FilePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔄 Procesando: $FilePath" -ForegroundColor Cyan
    
    # Agregar import después de las otras importaciones de React
    $importLine = "import { useSetPageTitle } from '@/shared/Context/page-title-context';"
    
    if ($content -match "import.*from 'react';") {
        $content = $content -replace "(import.*from 'react';)", "`$1`n$importLine"
    } elseif ($content -match "'use client';") {
        $content = $content -replace "('use client';)", "`$1`n`n$importLine"
    } else {
        $content = "$importLine`n`n$content"
    }
    
    # Agregar hook después de la declaración de la función
    $hookLine = "  // ✅ TÍTULO DINÁMICO DE LA PÁGINA`n  useSetPageTitle('$Title', '$Subtitle');"
    
    # Buscar el patrón de función y agregar el hook
    $functionPattern = "(export default function \w+\([^)]*\)\s*{)"
    if ($content -match $functionPattern) {
        $content = $content -replace $functionPattern, "`$1`n`n$hookLine"
    } else {
        # Intentar con export function
        $functionPattern2 = "(export function \w+\([^)]*\)\s*{)"
        if ($content -match $functionPattern2) {
            $content = $content -replace $functionPattern2, "`$1`n`n$hookLine"
        }
    }
    
    # Escribir el archivo modificado
    $content | Out-File -FilePath $FilePath -Encoding UTF8
    Write-Host "✅ Completado: $FilePath" -ForegroundColor Green
}

# Procesar todas las páginas
Write-Host "🚀 Iniciando actualización masiva de títulos..." -ForegroundColor Magenta

foreach ($pagePath in $PAGE_TITLES.Keys) {
    $fullPath = Join-Path $BASE_PATH $pagePath
    if ($pagePath -eq "page.tsx") {
        $fullPath = Join-Path $BASE_PATH "page.tsx"
    } else {
        $fullPath = Join-Path $BASE_PATH "$pagePath\page.tsx"
    }
    
    $pageInfo = $PAGE_TITLES[$pagePath]
    Add-DynamicTitle -FilePath $fullPath -Title $pageInfo.title -Subtitle $pageInfo.subtitle
}

Write-Host "`n🎉 ¡Actualización masiva completada!" -ForegroundColor Green
Write-Host "📝 Se han agregado títulos dinámicos a todas las páginas del dashboard." -ForegroundColor Green
