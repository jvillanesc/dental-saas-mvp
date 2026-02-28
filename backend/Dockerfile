# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración de Gradle primero (cache layer)
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle/ gradle/

# Dar permisos y eliminar CRLF (Windows line endings)
RUN sed -i 's/\r//' gradlew && chmod +x gradlew

# Descargar dependencias antes de copiar el código fuente (mejor cache)
RUN ./gradlew dependencies --no-daemon -q || true

# Copiar el código fuente
COPY src/ src/

# Compilar y empaquetar (sin tests)
RUN ./gradlew clean bootJar --no-daemon -x test

# ─────────────────────────────────────────────
# Stage 2: Runtime
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# Crear usuario no-root por seguridad
RUN addgroup -S dental && adduser -S dental -G dental

WORKDIR /app

# Copiar el jar desde el stage de build
COPY --from=builder /app/build/libs/*.jar app.jar

# Cambiar propietario
RUN chown dental:dental app.jar

USER dental

# Puerto expuesto (Railway/Docker inyectan $PORT, default 8080)
EXPOSE 8080

# Variables de entorno con defaults para desarrollo local
ENV JAVA_OPTS="-Xss512k -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
