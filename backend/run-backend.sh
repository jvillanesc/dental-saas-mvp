#!/bin/bash
# ==============================================================================
# Script para ejecutar el Backend Dental SaaS con JDK 21
# ==============================================================================
# Uso:
#   ./run-backend.sh           → Build + Run (por defecto)
#   ./run-backend.sh build     → Solo compilación
#   ./run-backend.sh run       → Solo ejecución (sin rebuild)
#   ./run-backend.sh clean     → Limpiar build
# ==============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  🦷 Dental SaaS Backend Runner${NC}"
echo -e "${CYAN}========================================${NC}"

# Detectar Java
if [ -n "$JAVA_HOME" ]; then
    echo -e "${YELLOW}📍 JDK: $JAVA_HOME${NC}"
    JAVA_CMD="$JAVA_HOME/bin/java"
else
    JAVA_CMD="java"
    echo -e "${YELLOW}📍 JDK: usando java del PATH${NC}"
fi

echo -e "${YELLOW}🔧 Gradle: 8.5${NC}"
echo ""

# Verificar Java
echo -e "${CYAN}☕ Verificando versión de Java...${NC}"
$JAVA_CMD -version
echo ""

# Determinar acción
ACTION=${1:-all}

case $ACTION in
    clean)
        echo -e "${MAGENTA}🧹 Limpiando proyecto...${NC}"
        ./gradlew clean
        echo -e "${GREEN}✅ Limpieza completada${NC}"
        ;;
    build)
        echo -e "${MAGENTA}🔨 Compilando proyecto...${NC}"
        ./gradlew clean build -x test
        echo ""
        echo -e "${GREEN}✅ Compilación exitosa${NC}"
        echo ""
        echo -e "${CYAN}💡 Para ejecutar el servidor, usa: ./run-backend.sh run${NC}"
        ;;
    run)
        echo -e "${MAGENTA}🚀 Iniciando servidor...${NC}"
        echo -e "${YELLOW}📡 URL: http://localhost:8080${NC}"
        echo -e "${YELLOW}🛑 Para detener: Ctrl + C${NC}"
        echo ""
        echo -e "${CYAN}========================================${NC}"
        echo ""
        ./gradlew bootRun
        ;;
    all|*)
        echo -e "${MAGENTA}🔨 Compilando proyecto...${NC}"
        ./gradlew clean build -x test
        echo ""
        echo -e "${GREEN}✅ Compilación exitosa${NC}"
        echo ""
        echo -e "${MAGENTA}🚀 Iniciando servidor...${NC}"
        echo -e "${YELLOW}📡 URL: http://localhost:8080${NC}"
        echo -e "${YELLOW}🛑 Para detener: Ctrl + C${NC}"
        echo ""
        echo -e "${CYAN}========================================${NC}"
        echo ""
        ./gradlew bootRun
        ;;
esac
