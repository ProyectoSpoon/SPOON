$ErrorActionPreference = "Continue"

# 1. Delete Empty Files
$emptyFiles = @(
    "src/app/dashboard/carta/programacion-semanal/services/validador-programacion.ts",
    "src/app/dashboard/carta/styles/columnas.css",
    "src/app/dashboard/carta/styles/dialogos.css",
    "src/app/dashboard/carta/styles/formularios.css",
    "src/app/dashboard/carta/utils/exportacion.tsx",
    "src/app/dashboard/configuracion/usuarios/components/botones-accion.tsx",
    "src/app/dashboard/hooks/use-navegacion.ts",
    "src/styles/globals.cssNew-Item"
)

Write-Host "--- Deleting Empty Files ---"
foreach ($file in $emptyFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file"
    } else {
        Write-Host "Not Found (already deleted?): $file"
    }
}

# 2. Delete Backup and Residual Files
$backupFiles = @(
    "backups/backup_pre_migration_20250701_172050.sql",
    "scripts/init-db.sql.backup",
    "scripts/test-put-simple.js",
    "src/app/api/categorias/route.ts.backup-20250716-235747",
    "src/app/api/combinaciones/especiales/route.ts.backup-20250716-231517",
    "src/app/api/combinaciones/especiales/route.ts.backup-20250716-231709",
    "src/app/api/combinaciones/favoritos/route.ts.backup-20250716-231517",
    "src/app/api/combinaciones/favoritos/route.ts.backup-20250716-231709",
    "src/app/api/combinaciones/route.ts.backup-20250716-231517",
    "src/app/api/ingredientes/route.ts.backup-20250716-231517",
    "src/app/api/menu-dia/combinaciones/route.ts.backup-20250716-231517",
    "src/app/api/menu-dia/combinaciones/route.ts.backup-20250716-231709",
    "src/app/api/menu-dia/favoritos/route.ts.backup-20250716-231709",
    "src/app/api/menu-dia/favoritos/route.ts.backup-20250716-231855",
    "src/app/api/menu-dia/favoritos/route.ts.backup-20250717-001050",
    "src/app/api/productos/route.ts.backup-20250716-231517",
    "src/app/dashboard/carta/menu-dia/services/favoritos.service.ts.backup",
    "src/app/dashboard/components/BarraLateral.tsx.backup",
    "src/app/dashboard/estadisticas/components/AnalisisVentas/KPIsCards.tsx.backup",
    "src/app/login/page.tsx.backup",
    "src/config/database.ts.backup",
    "src/config/database.ts.backup.1751408679795",
    "src/context/authcontext.tsx.OLD",
    "src/lib/database.ts.backup.1751408679800"
)

Write-Host "`n--- Deleting Backup Files ---"
foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file"
    }
}

# 3. Delete Monitoreo Folder
Write-Host "`n--- Deleting Monitoreo Folder ---"
if (Test-Path "monitoreo") {
    Remove-Item "monitoreo" -Recurse -Force
    Write-Host "Deleted folder: monitoreo"
}

# 4. Move Markdown Files
$markdownMoves = @{
    "scripts/migration-analysis.md" = "docs/legacy/migration-analysis.md";
    "scripts/README-TEST-USER.md" = "docs/legacy/README-TEST-USER.md";
    "src/migration-validation-report.md" = "docs/legacy/migration-validation-report.md";
    "src/config/README_POSTGRES.md" = "docs/legacy/README_POSTGRES.md";
    "src/utils/README-MENU-CACHE.md" = "docs/legacy/README-MENU-CACHE.md";
    "monitoreo/GUIA-SIN-DOCKER.md" = "docs/legacy/GUIA-SIN-DOCKER.md" # This might be gone if monitoreo was deleted first, checking order
}

# Create docs/legacy if not exists
if (-not (Test-Path "docs/legacy")) {
    New-Item -ItemType Directory -Path "docs/legacy" -Force | Out-Null
    Write-Host "Created directory: docs/legacy"
}

Write-Host "`n--- Moving Markdown Files ---"
foreach ($src in $markdownMoves.Keys) {
    if (Test-Path $src) {
        Move-Item $src $markdownMoves[$src] -Force
        Write-Host "Moved: $src -> $($markdownMoves[$src])"
    } else {
        Write-Host "Source not found (maybe deleted with parent?): $src"
    }
}


# 5. Recursive Empty Directory Purge
Write-Host "`n--- Purging Empty Directories ---"
function Remove-EmptyDirectories {
    param ($path)
    Get-ChildItem $path -Recurse -Directory | Sort-Object FullName -Descending | ForEach-Object {
        if ((Get-ChildItem $_.FullName -Force | Measure-Object).Count -eq 0) {
            Remove-Item $_.FullName -Force
            Write-Host "Deleted empty directory: $($_.FullName)"
        }
    }
}

Remove-EmptyDirectories "src"
Remove-EmptyDirectories "scripts"
# Remove-EmptyDirectories "backups" # Keeping backups folder if empty? User said "No queremos una estructura de carpetas que no contenga nada."
Remove-EmptyDirectories "backups" 

Write-Host "`n--- Cleanup Complete ---"
