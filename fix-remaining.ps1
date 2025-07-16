# Script mejorado para procesar todas las estructuras de componentes React
$PROBLEMATIC_PAGES = @(
    @{ path = "gestion-ordenes"; title = "Gestión de Órdenes"; subtitle = "Administración de pedidos y órdenes" }
    @{ path = "auditoria"; title = "Auditoría"; subtitle = "Registro de actividades del sistema" }
    @{ path = "registro-ventas"; title = "Registro de Ventas"; subtitle = "Control y registro de ventas diarias" }
    @{ path = "estadisticas\analisis-ventas"; title = "Análisis de Ventas"; subtitle = "Reportes detallados de ventas" }
    @{ path = "estadisticas\rendimiento-menu"; title = "Rendimiento del Menú"; subtitle = "Análisis de popularidad de productos" }
    @{ path = "estadisticas\tendencias"; title = "Tendencias"; subtitle = "Tendencias de ventas y comportamiento" }
    @{ path = "configuracion\horario-comercial"; title = "Horario Comercial"; subtitle = "Configuración de horarios de atención" }
)

function Add-DynamicTitle-Enhanced {
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
    
    Write-Host "🔄 Procesando: $FilePath" -ForegroundColor Cyan
    
    # Agregar import después de los imports de React
    $importLine = "import { useSetPageTitle } from '@/shared/Context/page-title-context';"
    
    if ($content -match "import.*from 'react';") {
        $content = $content -replace "(import.*from 'react';)", "`$1`n$importLine"
    } elseif ($content -match "'use client';") {
        $content = $content -replace "('use client';)", "`$1`n`n$importLine"
    } else {
        $content = "$importLine`n`n$content"
    }
    
    # Agregar hook - Buscar diferentes patrones de función
    $hookLine = "  // ✅ TÍTULO DINÁMICO DE LA PÁGINA`n  useSetPageTitle('$Title', '$Subtitle');"
    
    # Patrón 1: export default function
    if ($content -match "(export default function \w+\([^)]*\)\s*{)") {
        $content = $content -replace "(export default function \w+\([^)]*\)\s*{)", "`$1`n`n$hookLine"
    }
    # Patrón 2: function + export default separados
    elseif ($content -match "(function \w+\([^)]*\)\s*{)") {
        $content = $content -replace "(function \w+\([^)]*\)\s*{)", "`$1`n`n$hookLine"
    }
    # Patrón 3: const Component = () => {
    elseif ($content -match "(const \w+ = \([^)]*\)\s*=>\s*{)") {
        $content = $content -replace "(const \w+ = \([^)]*\)\s*=>\s*{)", "`$1`n`n$hookLine"
    }
    # Patrón 4: export function
    elseif ($content -match "(export function \w+\([^)]*\)\s*{)") {
        $content = $content -replace "(export function \w+\([^)]*\)\s*{)", "`$1`n`n$hookLine"
    }
    
    # Escribir el archivo modificado
    $content | Out-File -FilePath $FilePath -Encoding UTF8
    Write-Host "✅ Completado: $FilePath" -ForegroundColor Green
}

Write-Host "🚀 Procesando páginas problemáticas..." -ForegroundColor Magenta

foreach ($page in $PROBLEMATIC_PAGES) {
    $fullPath = "C:\APP\SPOON\src\app\dashboard\$($page.path)\page.tsx"
    Add-DynamicTitle-Enhanced -FilePath $fullPath -Title $page.title -Subtitle $page.subtitle
}

Write-Host "`n🎉 ¡Procesamiento completado!" -ForegroundColor Green
