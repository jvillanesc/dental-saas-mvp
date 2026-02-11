# 🔐 HISTORIA DE USUARIO 01 - AUTENTICACIÓN

**Proyecto**: Dental SaaS MVP  
**Historia**: Autenticación y Autorización con JWT  
**Fecha**: 25 de enero de 2026  
**Versión**: 2.0

---

## 📖 Historia de Usuario

**Como** usuario del sistema (ADMIN, DENTIST o ASSISTANT)  
**Quiero** iniciar sesión con mi email y contraseña  
**Para** acceder a las funcionalidades del sistema según mi rol

---

## ✅ Criterios de Aceptación

### Backend
- [ ] Login endpoint acepta email + password y retorna JWT
- [ ] JWT contiene: userId, tenantId, role, expiración (8 horas)
- [ ] Validación de BCrypt para passwords
- [ ] Endpoint protegidos requieren JWT válido
- [ ] Multi-tenancy: usuario solo accede a datos de su tenant
- [ ] Context reactivo con TenantContext

### Frontend
- [ ] Página de login funcional
- [ ] AuthContext guarda token + user data en localStorage
- [ ] Interceptor Axios agrega JWT a todas las requests
- [ ] Rutas protegidas redirigen a /login si no hay token
- [ ] Dashboard muestra datos del usuario logueado
- [ ] Botón de logout limpia localStorage y redirige

---

## 🏗️ Arquitectura

```
┌──────────────────┐
│  Login.tsx       │ ──┐
│  (email/pass)    │   │
└──────────────────┘   │
                       │ POST /api/auth/login
                       ↓
┌──────────────────────────────────────────┐
│  Backend: AuthController.login()         │
│  ├─ Buscar user por email                │
│  ├─ Validar password con BCrypt          │
│  ├─ Generar JWT con tenantId             │
│  └─ Retornar { token, user }             │
└──────────────────────────────────────────┘
                       ↓
┌──────────────────┐
│  AuthContext     │
│  ├─ Guardar token│
│  ├─ Guardar user │
│  └─ setAuthToken│
└──────────────────┘
                       ↓
┌──────────────────────────────────────────┐
│  Todas las requests llevan:              │
│  Authorization: Bearer <JWT_TOKEN>       │
└──────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Entidad User

**Ubicación**: `backend/src/main/java/com/dental/domain/model/User.java`

```java
package com.dental.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("users")
public class User {
    @Id
    private UUID id;

    @Column("tenant_id")
    private UUID tenantId;

    private String email;
    private String password;

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    private String role; // ADMIN, DENTIST, ASSISTANT

    private Boolean active;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("staff_id")
    private UUID staffId; // Relación opcional con Staff
}
```

---

### 2. Repository

**Ubicación**: `backend/src/main/java/com/dental/repository/UserRepository.java`

```java
package com.dental.repository;

import com.dental.domain.model.User;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    
    Mono<User> findByEmail(String email);
    
    @Query("SELECT * FROM users WHERE tenant_id = :tenantId AND email = :email AND active = true")
    Mono<User> findByTenantIdAndEmail(UUID tenantId, String email);
}
```

---

### 3. DTOs

**Ubicación**: `backend/src/main/java/com/dental/dto/LoginRequest.java`

```java
package com.dental.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

**Ubicación**: `backend/src/main/java/com/dental/dto/LoginResponse.java`

```java
package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UserDTO user;
}
```

**Ubicación**: `backend/src/main/java/com/dental/dto/UserDTO.java`

```java
package com.dental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private UUID tenantId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
```

---

### 4. JWT Utility

**Ubicación**: `backend/src/main/java/com/dental/util/JwtUtil.java`

```java
package com.dental.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "mySecretKeyForJWTTokenGenerationMustBe256BitsLong12345678901234567890";
    private static final long EXPIRATION_TIME = 8 * 60 * 60 * 1000; // 8 horas

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(UUID userId, UUID tenantId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("tenantId", tenantId.toString());
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public UUID extractTenantId(String token) {
        Claims claims = extractClaims(token);
        return UUID.fromString(claims.get("tenantId", String.class));
    }

    public UUID extractUserId(String token) {
        Claims claims = extractClaims(token);
        return UUID.fromString(claims.get("userId", String.class));
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

### 5. AuthService

**Ubicación**: `backend/src/main/java/com/dental/service/AuthService.java`

```java
package com.dental.service;

import com.dental.domain.model.User;
import com.dental.dto.LoginRequest;
import com.dental.dto.LoginResponse;
import com.dental.dto.UserDTO;
import com.dental.repository.UserRepository;
import com.dental.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Mono<LoginResponse> login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        return userRepository.findByEmail(request.getEmail())
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    if (!user.getActive()) {
                        return Mono.error(new RuntimeException("Usuario inactivo"));
                    }

                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        log.warn("Invalid password for user: {}", user.getEmail());
                        return Mono.error(new RuntimeException("Contraseña incorrecta"));
                    }

                    String token = jwtUtil.generateToken(user.getId(), user.getTenantId(), user.getRole());
                    UserDTO userDTO = new UserDTO(
                            user.getId(),
                            user.getTenantId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole()
                    );

                    log.info("Login successful for user: {}, tenantId: {}", user.getEmail(), user.getTenantId());
                    return Mono.just(new LoginResponse(token, userDTO));
                });
    }
}
```

---

### 6. AuthController

**Ubicación**: `backend/src/main/java/com/dental/controller/AuthController.java`

```java
package com.dental.controller;

import com.dental.dto.LoginRequest;
import com.dental.dto.LoginResponse;
import com.dental.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - Email: {}", request.getEmail());
        
        return authService.login(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("Login error: {}", e.getMessage());
                    return Mono.just(ResponseEntity.status(401).build());
                });
    }
}
```

---

### 7. Security Configuration

**Ubicación**: `backend/src/main/java/com/dental/config/SecurityConfig.java`

```java
package com.dental.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/api/auth/**").permitAll()
                        .anyExchange().authenticated()
                )
                .build();
    }
}
```

---

### 8. JWT Filter (Filtro para validar JWT)

**Ubicación**: `backend/src/main/java/com/dental/config/JwtAuthenticationFilter.java`

```java
package com.dental.config;

import com.dental.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();

        // Permitir rutas públicas
        if (path.startsWith("/api/auth")) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                log.warn("Invalid token for path: {}", path);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            UUID tenantId = jwtUtil.extractTenantId(token);
            UUID userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);

            // Agregar tenantId al contexto reactivo
            exchange.getAttributes().put("tenantId", tenantId);
            exchange.getAttributes().put("userId", userId);
            exchange.getAttributes().put("role", role);

            log.debug("Authenticated request - User: {}, Tenant: {}, Role: {}", userId, tenantId, role);

        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }
}
```

---

### 9. TenantContext Utility

**Ubicación**: `backend/src/main/java/com/dental/util/TenantContext.java`

```java
package com.dental.util;

import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

public class TenantContext {

    public static Mono<UUID> getTenantId(ServerWebExchange exchange) {
        UUID tenantId = exchange.getAttribute("tenantId");
        if (tenantId == null) {
            return Mono.error(new RuntimeException("TenantId not found in context"));
        }
        return Mono.just(tenantId);
    }

    public static Mono<UUID> getUserId(ServerWebExchange exchange) {
        UUID userId = exchange.getAttribute("userId");
        if (userId == null) {
            return Mono.error(new RuntimeException("UserId not found in context"));
        }
        return Mono.just(userId);
    }
}
```

---

## ⚛️ IMPLEMENTACIÓN FRONTEND

### 1. Tipos TypeScript

**Ubicación**: `frontend/src/types/auth.types.ts`

```typescript
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}
```

---

### 2. AuthContext

**Ubicación**: `frontend/src/context/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, LoginRequest, User } from '../types/auth.types';
import { loginApi } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Cargar token y user desde localStorage al montar
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await loginApi(credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### 3. API Service

**Ubicación**: `frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Ubicación**: `frontend/src/services/authService.ts`

```typescript
import api from './api';
import { LoginRequest, LoginResponse } from '../types/auth.types';

export const loginApi = (credentials: LoginRequest) => {
  return api.post<LoginResponse>('/auth/login', credentials);
};
```

---

### 4. Login Page

**Ubicación**: `frontend/src/pages/Login.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Dental SaaS</h1>
        <h2 className="text-lg text-gray-600 text-center mb-8">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Usuario demo: admin@clinicaabc.com</p>
          <p>Contraseña: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

### 5. Protected Route Component

**Ubicación**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

### 6. Dashboard Page

**Ubicación**: `frontend/src/pages/Dashboard.tsx`

```typescript
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Dental SaaS</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Bienvenido, {user?.firstName} {user?.lastName}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol</p>
              <p className="font-medium">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenant ID</p>
              <p className="font-mono text-xs">{user?.tenantId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

### 7. App Routes

**Ubicación**: `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 🧪 Testing

### Backend - Probar Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinicaabc.com","password":"password123"}'
```

**Respuesta esperada**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@clinicaabc.com",
    "firstName": "Carlos",
    "lastName": "Administrador",
    "role": "ADMIN"
  }
}
```

### Frontend - Flujo de Login

1. Abrir http://localhost:3000/login
2. Ingresar:
   - Email: `admin@clinicaabc.com`
   - Password: `password123`
3. Click en "Ingresar"
4. Verificar redirección a /dashboard
5. Verificar que se muestre información del usuario
6. Click en "Cerrar Sesión"
7. Verificar redirección a /login

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear `User.java` entity
- [ ] Crear `UserRepository.java`
- [ ] Crear DTOs: `LoginRequest`, `LoginResponse`, `UserDTO`
- [ ] Crear `JwtUtil.java` para generar y validar tokens
- [ ] Crear `AuthService.java` con lógica de login
- [ ] Crear `AuthController.java` con endpoint `/api/auth/login`
- [ ] Crear `SecurityConfig.java` con BCrypt
- [ ] Crear `JwtAuthenticationFilter.java` para validar JWT
- [ ] Crear `TenantContext.java` utility
- [ ] Probar login con curl

### Frontend
- [ ] Crear `auth.types.ts` con interfaces
- [ ] Crear `AuthContext.tsx` con provider y hook
- [ ] Crear `api.ts` con interceptors
- [ ] Crear `authService.ts` con loginApi
- [ ] Crear `Login.tsx` page
- [ ] Crear `ProtectedRoute.tsx` component
- [ ] Crear `Dashboard.tsx` page
- [ ] Configurar routes en `App.tsx`
- [ ] Probar flujo completo de login/logout

---

## 🐛 Troubleshooting

### Error: "Usuario no encontrado"
**Causa**: Email incorrecto o no existe en DB  
**Solución**: Verificar que el usuario exista en la tabla users

### Error: "Contraseña incorrecta"
**Causa**: Password no coincide con hash BCrypt  
**Solución**: Usar hash correcto `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`

### Error: "401 Unauthorized" en requests protegidas
**Causa**: Token no válido o expirado  
**Solución**: Verificar que el token esté en el header `Authorization: Bearer <token>`

### Error: CORS en frontend
**Causa**: Backend no permite requests desde localhost:3000  
**Solución**: Agregar `@CrossOrigin` en controllers o configurar CORS globalmente

---

**🎯 Siguiente paso**: Ejecutar `sdd/historia-usuario-02-gestion-pacientes.md`
