# ==============================================================================
# Script para ejecutar el Backend Dental SaaS con JDK 21
# ==============================================================================
# Uso:
#   .\run-backend.ps1           → Build + Run (por defecto)
#   .\run-backend.ps1 -Build    → Solo compilación
#   .\run-backend.ps1 -Run      → Solo ejecución (sin rebuild)
#   .\run-backend.ps1 -Clean    → Limpiar build
# ==============================================================================
# NOTA: Este script requiere JDK 21 configurado en JAVA_HOME
#       o en gradle.properties.local
# ==============================================================================

param(
    [switch]$Build,
    [switch]$Run,
    [switch]$Clean
)

# ==============================================================================
# Priorizar gradle.properties.local sobre JAVA_HOME
# ==============================================================================

# Verificar si existe gradle.properties.local y extraer JDK path
if (Test-Path "gradle.properties.local") {
    $gradlePropsContent = Get-Content "gradle.properties.local" -Raw
    if ($gradlePropsContent -match "org\.gradle\.java\.home\s*=\s*(.+)") {
        $jdkPath = $matches[1].Trim()
        # Normalizar path (convertir / a \)
        $jdkPath = $jdkPath -replace "/", "\"
        
        if (Test-Path $jdkPath) {
            $env:JAVA_HOME = $jdkPath
            $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
            Write-Host "✅ Usando JDK configurado en gradle.properties.local" -ForegroundColor Green
        } else {
            Write-Host "⚠️  JDK en gradle.properties.local no existe: $jdkPath" -ForegroundColor Yellow
            Write-Host "   Ejecuta: ..\setup-java.ps1" -ForegroundColor Yellow
            exit 1
        }
    }
} elseif (-not $env:JAVA_HOME) {
    Write-Host "⚠️  JAVA_HOME no está configurado" -ForegroundColor Yellow
    Write-Host "   Ejecuta primero: ..\setup-java.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

# Banner
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🦷 Dental SaaS Backend Runner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📍 JDK: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host "🔧 Gradle: 8.5" -ForegroundColor Yellow
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