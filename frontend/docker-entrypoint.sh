#!/bin/bash
set -e

# ── Validar variable requerida ─────────────────────────────────────────────
if [ -z "$BACKEND_URL" ]; then
  echo "⚠️  ADVERTENCIA: BACKEND_URL no está definido."
  echo "   Las llamadas a /api fallarán. Establece BACKEND_URL en las variables de entorno."
  export BACKEND_URL="http://localhost:8080"
fi

# ── Limpiar trailing slash de BACKEND_URL ─────────────────────────────────
BACKEND_URL="${BACKEND_URL%/}"

# ── Asegurar que BACKEND_URL tenga protocolo (http:// o https://) ─────────
if [[ "$BACKEND_URL" != http://* ]] && [[ "$BACKEND_URL" != https://* ]]; then
  BACKEND_URL="http://$BACKEND_URL"
fi

export BACKEND_URL

# ── Usar el puerto inyectado por la plataforma o 80 por defecto ───────────
export PORT="${PORT:-80}"

echo "🚀 Frontend iniciando..."
echo "   PORT        = $PORT"
echo "   BACKEND_URL = $BACKEND_URL"

# ── Reemplazar variables en la plantilla de nginx ────────────────────────
envsubst '${PORT} ${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "✅ Configuración de nginx generada."

# ── Ejecutar el comando original (nginx) ─────────────────────────────────
exec "$@"
