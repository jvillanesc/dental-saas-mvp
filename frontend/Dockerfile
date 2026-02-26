# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar fuentes y compilar
COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with nginx
# ─────────────────────────────────────────────
FROM nginx:1.25-alpine

# Utilidades para envsubst (ya incluidos en nginx:alpine)
RUN apk add --no-cache bash

# Copiar el build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la plantilla de nginx (con ${BACKEND_URL} como variable)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copiar el script de entrada (y eliminar CRLF por si fue editado en Windows)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Puerto expuesto (Railway/AWS/DO inyectan $PORT)
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
