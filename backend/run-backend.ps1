# ==============================================================================
# Script para ejecutar el Backend Dental SaaS con JDK 21
# ==============================================================================
# Uso:
#   .\run-backend.ps1           → Build + Run (por defecto)
#   .\run-backend.ps1 -Build    → Solo compilación
#   .\run-backend.ps1 -Run      → Solo ejecución (sin rebuild)
#   .\run-backend.ps1 -Clean    → Limpiar build
# ==============================================================================

param(
    [switch]$Build,
    [switch]$Run,
    [switch]$Clean
)

# Configurar JAVA_HOME para JDK 21
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Banner
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🦷 Dental SaaS Backend Runner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📍 JDK: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host "🔧 Gradle: 8.5" -ForegroundColor Yellow
Write-Host ""

# Verificar que JDK existe
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "❌ ERROR: No se encuentra Java en $env:JAVA_HOME" -ForegroundColor Red
    Write-Host "   Verifica que el JDK 21 esté instalado correctamente" -ForegroundColor Red
    exit 1
}

# Verificar versión de Java
Write-Host "☕ Verificando versión de Java..." -ForegroundColor Cyan
& "$env:JAVA_HOME\bin\java.exe" -version
Write-Host ""

# Si no se especifica ningún parámetro, hacer Build + Run
if (-not $Build -and -not $Run -and -not $Clean) {
    $Build = $true
    $Run = $true
}

# Limpiar build
if ($Clean) {
    Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Magenta
    .\gradlew.bat clean
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
    Write-Host ""
}

# Compilar
if ($Build) {
    Write-Host "🔨 Compilando proyecto..." -ForegroundColor Magenta
    .\gradlew.bat clean build -x test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ ERROR: La compilación falló" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Compilación exitosa" -ForegroundColor Green
    Write-Host ""
}

# Ejecutar
if ($Run) {
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Magenta
    Write-Host "📡 URL: http://localhost:8080" -ForegroundColor Yellow
    Write-Host "🛑 Para detener: Ctrl + C" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    .\gradlew.bat bootRun
}

# Si solo fue build, mostrar mensaje
if ($Build -and -not $Run) {
    Write-Host "💡 Para ejecutar el servidor, usa: .\run-backend.ps1 -Run" -ForegroundColor Cyan
    Write-Host ""
}
