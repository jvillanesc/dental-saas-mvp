# 👥 HISTORIA DE USUARIO 05 - GESTIÓN DE USUARIOS

**Proyecto**: Dental SaaS MVP  
**Historia**: CRUD completo de Usuarios de Acceso al Sistema  
**Fecha**: 28 de enero de 2026  
**Versión**: 1.0

---

## 📖 Historia de Usuario

**Como** administrador del sistema  
**Quiero** gestionar usuarios de acceso (crear, listar, editar, desactivar)  
**Para** controlar quién puede acceder al sistema y asignar roles apropiados, respetando la arquitectura multi-tenant donde un staff puede o no tener usuario

---

## 🎯 Contexto Arquitectónico

### Relación Users ↔ Staff
```
┌─────────────────┐              ┌─────────────────┐
│     USERS       │              │     STAFF       │
│                 │              │                 │
│ id (PK)         │◄─────────────│ user_id (FK)    │ NULLABLE
│ tenant_id       │              │ tenant_id       │
│ email           │              │ first_name      │
│ password        │              │ last_name       │
│ role            │              │ specialty       │
│ staff_id (FK)   │─────────────►│ id (PK)         │ NULLABLE
│ active          │              │ active          │
└─────────────────┘              └─────────────────┘

REGLAS DE NEGOCIO:
✓ Un STAFF puede existir SIN usuario (personal que no accede al sistema)
✓ Un USER siempre tiene tenant_id (multi-tenancy)
✓ Si Staff tiene usuario, staff.user_id apunta al user
✓ Si User está vinculado a Staff, user.staff_id apunta al staff
✓ Al crear usuario desde Staff, se vinculan automáticamente
✓ Al crear usuario independiente, puede vincularse después
✓ Roles disponibles: ADMIN, DENTIST, ASSISTANT
```

---

## ✅ Criterios de Aceptación

### Backend
- [ ] Endpoint GET /api/users retorna usuarios del tenant logueado
- [ ] Endpoint POST /api/users crea nuevo usuario con password hasheado (BCrypt)
- [ ] Endpoint PUT /api/users/{id} actualiza usuario (sin cambiar password)
- [ ] Endpoint PUT /api/users/{id}/password permite cambiar password con validación
- [ ] Endpoint PUT /api/users/{id}/deactivate desactiva usuario (active=false)
- [ ] Endpoint PUT /api/users/{id}/activate reactiva usuario (active=true)
- [ ] Endpoint POST /api/users/{userId}/link-staff/{staffId} vincula user con staff
- [ ] Endpoint DELETE /api/users/{userId}/unlink-staff desvincula user de staff
- [ ] Validaciones: email único por tenant, password mínimo 8 caracteres
- [ ] Multi-tenancy: usuario solo ve/edita users de su tenant
- [ ] Permisos: solo ADMIN puede crear/editar usuarios

### Frontend
- [ ] Página UsersPage lista todos los usuarios del tenant
- [ ] Badge visual indicando: rol, estado (activo/inactivo), vinculación con staff
- [ ] Botón "Nuevo Usuario" abre modal (solo para ADMIN)
- [ ] Modal con formulario: email, password, firstName, lastName, role
- [ ] Select opcional "Vincular con Staff" al crear usuario
- [ ] Botón "Editar" abre modal con datos (no muestra password)
- [ ] Botón "Cambiar Contraseña" abre modal específico
- [ ] Botón "Desactivar/Activar" con confirmación
- [ ] Botón "Vincular con Staff" si no está vinculado
- [ ] Botón "Desvincular Staff" si está vinculado
- [ ] Filtros: por rol, por estado (activos/inactivos)
- [ ] Búsqueda por nombre o email

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────┐
│  UsersPage                         │
│  ├─ Filters (Role, Status, Search) │
│  ├─ Table                          │
│  │  ├─ Badge (Role)                │
│  │  ├─ Badge (Active/Inactive)     │
│  │  └─ Badge (Linked to Staff)     │
│  └─ Modals                         │
│     ├─ UserModal                   │
│     ├─ PasswordModal               │
│     ├─ LinkStaffModal              │
│     └─ ConfirmationModal           │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  userService.ts                    │
│  ├─ getUsers()                     │
│  ├─ createUser()                   │
│  ├─ updateUser()                   │
│  ├─ changePassword()               │
│  ├─ deactivateUser()               │
│  ├─ activateUser()                 │
│  ├─ linkStaff()                    │
│  └─ unlinkStaff()                  │
└────────────────────────────────────┘
         ↓ HTTP REST (JWT Bearer)
┌────────────────────────────────────┐
│  Backend: UserController           │
│  ├─ GET /api/users                 │
│  ├─ POST /api/users                │
│  ├─ PUT /api/users/{id}            │
│  ├─ PUT /api/users/{id}/password   │
│  ├─ PUT /api/users/{id}/deactivate │
│  ├─ PUT /api/users/{id}/activate   │
│  ├─ POST /api/users/{id}/link-...  │
│  └─ DELETE /api/users/{id}/unlink..│
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  UserService (Business Logic)      │
│  ├─ Hashear password con BCrypt    │
│  ├─ Validar email único            │
│  ├─ Validar tenant_id match        │
│  ├─ Actualizar staff.user_id       │
│  └─ Actualizar user.staff_id       │
└────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. DTOs Necesarios

**UserDTO.java** (Response)
```java
package com.dental.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDTO {
    private UUID id;
    private UUID tenantId;
    private UUID staffId;
    private String staffName;  // Nombre completo si está vinculado
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean active;
    private LocalDateTime createdAt;
    
    // Constructor, getters, setters
}
```

**CreateUserRequest.java**
```java
package com.dental.dto;

import java.util.UUID;

public class CreateUserRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;  // ADMIN, DENTIST, ASSISTANT
    private UUID staffId; // Opcional para vincular al crear
    
    // Getters, setters
}
```

**UpdateUserRequest.java**
```java
package com.dental.dto;

public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String role;
    
    // NO incluye email ni password
    // Getters, setters
}
```

**ChangePasswordRequest.java**
```java
package com.dental.dto;

public class ChangePasswordRequest {
    private String newPassword;
    
    // Getter, setter
}
```

---

### 2. UserService.java

**Ubicación**: `backend/src/main/java/com/dental/service/UserService.java`

```java
package com.dental.service;

import com.dental.domain.model.Staff;
import com.dental.domain.model.User;
import com.dental.dto.*;
import com.dental.repository.UserRepository;
import com.dental.repository.StaffRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, 
                      StaffRepository staffRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // Listar usuarios del tenant con info de staff si aplica
    public Flux<UserDTO> getAllUsers(UUID tenantId) {
        return userRepository.findByTenantId(tenantId)
                .flatMap(this::toDTOWithStaffInfo);
    }
    
    // Crear usuario
    public Mono<UserDTO> createUser(UUID tenantId, CreateUserRequest request) {
        // Validar email único en tenant
        return userRepository.findByEmailAndTenantId(request.getEmail(), tenantId)
                .hasElement()
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new RuntimeException("Email ya existe en este tenant"));
                    }
                    
                    User user = new User();
                    user.setTenantId(tenantId);
                    user.setEmail(request.getEmail());
                    user.setPassword(passwordEncoder.encode(request.getPassword()));
                    user.setFirstName(request.getFirstName());
                    user.setLastName(request.getLastName());
                    user.setRole(request.getRole());
                    user.setActive(true);
                    user.setCreatedAt(LocalDateTime.now());
                    user.setStaffId(request.getStaffId()); // Puede ser null
                    
                    return userRepository.save(user)
                            .flatMap(savedUser -> {
                                // Si hay staffId, actualizar staff.user_id
                                if (savedUser.getStaffId() != null) {
                                    return linkUserToStaff(savedUser.getId(), savedUser.getStaffId(), tenantId)
                                            .then(toDTOWithStaffInfo(savedUser));
                                }
                                return toDTOWithStaffInfo(savedUser);
                            });
                });
    }
    
    // Actualizar usuario (sin password)
    public Mono<UserDTO> updateUser(UUID id, UUID tenantId, UpdateUserRequest request) {
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setFirstName(request.getFirstName());
                    user.setLastName(request.getLastName());
                    user.setRole(request.getRole());
                    return userRepository.save(user);
                })
                .flatMap(this::toDTOWithStaffInfo);
    }
    
    // Cambiar contraseña
    public Mono<Void> changePassword(UUID id, UUID tenantId, ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            return Mono.error(new RuntimeException("Password debe tener al menos 8 caracteres"));
        }
        
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    return userRepository.save(user);
                })
                .then();
    }
    
    // Desactivar usuario
    public Mono<Void> deactivateUser(UUID id, UUID tenantId) {
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setActive(false);
                    return userRepository.save(user);
                })
                .then();
    }
    
    // Activar usuario
    public Mono<Void> activateUser(UUID id, UUID tenantId) {
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setActive(true);
                    return userRepository.save(user);
                })
                .then();
    }
    
    // Vincular usuario con staff
    public Mono<Void> linkUserToStaff(UUID userId, UUID staffId, UUID tenantId) {
        return Mono.zip(
                userRepository.findByIdAndTenantId(userId, tenantId),
                staffRepository.findByIdAndTenantId(staffId, tenantId)
        ).flatMap(tuple -> {
            User user = tuple.getT1();
            Staff staff = tuple.getT2();
            
            // Actualizar user.staff_id
            user.setStaffId(staffId);
            
            // Actualizar staff.user_id
            staff.setUserId(userId);
            staff.setUpdatedAt(LocalDateTime.now());
            
            return userRepository.save(user)
                    .then(staffRepository.save(staff))
                    .then();
        });
    }
    
    // Desvincular usuario de staff
    public Mono<Void> unlinkUserFromStaff(UUID userId, UUID tenantId) {
        return userRepository.findByIdAndTenantId(userId, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    UUID staffId = user.getStaffId();
                    if (staffId == null) {
                        return Mono.error(new RuntimeException("Usuario no está vinculado a staff"));
                    }
                    
                    // Actualizar user.staff_id = null
                    user.setStaffId(null);
                    
                    return staffRepository.findById(staffId)
                            .flatMap(staff -> {
                                // Actualizar staff.user_id = null
                                staff.setUserId(null);
                                staff.setUpdatedAt(LocalDateTime.now());
                                return staffRepository.save(staff);
                            })
                            .then(userRepository.save(user))
                            .then();
                });
    }
    
    // Convertir a DTO con info de staff
    private Mono<UserDTO> toDTOWithStaffInfo(User user) {
        if (user.getStaffId() == null) {
            return Mono.just(toDTO(user, null));
        }
        
        return staffRepository.findById(user.getStaffId())
                .map(staff -> toDTO(user, staff.getFirstName() + " " + staff.getLastName()))
                .defaultIfEmpty(toDTO(user, null));
    }
    
    private UserDTO toDTO(User user, String staffName) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setTenantId(user.getTenantId());
        dto.setStaffId(user.getStaffId());
        dto.setStaffName(staffName);
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
```

---

### 3. UserController.java

**Ubicación**: `backend/src/main/java/com/dental/controller/UserController.java`

```java
package com.dental.controller;

import com.dental.dto.*;
import com.dental.security.JwtUtil;
import com.dental.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    @GetMapping
    public Mono<ResponseEntity<Flux<UserDTO>>> getAllUsers(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        // Solo ADMIN puede ver usuarios
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return Mono.just(ResponseEntity.ok(userService.getAllUsers(tenantId)));
    }
    
    @PostMapping
    public Mono<ResponseEntity<UserDTO>> createUser(
            @RequestBody CreateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.createUser(tenantId, request)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<UserDTO>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.updateUser(id, tenantId, request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }
    
    @PutMapping("/{id}/password")
    public Mono<ResponseEntity<Void>> changePassword(
            @PathVariable UUID id,
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.changePassword(id, tenantId, request)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @PutMapping("/{id}/deactivate")
    public Mono<ResponseEntity<Void>> deactivateUser(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.deactivateUser(id, tenantId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }
    
    @PutMapping("/{id}/activate")
    public Mono<ResponseEntity<Void>> activateUser(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.activateUser(id, tenantId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }
    
    @PostMapping("/{userId}/link-staff/{staffId}")
    public Mono<ResponseEntity<Void>> linkStaff(
            @PathVariable UUID userId,
            @PathVariable UUID staffId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.linkUserToStaff(userId, staffId, tenantId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
    
    @DeleteMapping("/{userId}/unlink-staff")
    public Mono<ResponseEntity<Void>> unlinkStaff(
            @PathVariable UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID tenantId = jwtUtil.getTenantIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);
        
        if (!"ADMIN".equals(role)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }
        
        return userService.unlinkUserFromStaff(userId, tenantId)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
}
```

---

### 4. Actualizar UserRepository

**Ubicación**: `backend/src/main/java/com/dental/repository/UserRepository.java`

```java
package com.dental.repository;

import com.dental.domain.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByEmail(String email);
    Flux<User> findByTenantId(UUID tenantId);
    Mono<User> findByIdAndTenantId(UUID id, UUID tenantId);
    Mono<User> findByEmailAndTenantId(String email, UUID tenantId);
}
```

---

## 🎨 IMPLEMENTACIÓN FRONTEND

### 1. Tipos TypeScript

**Ubicación**: `frontend/src/types/user.types.ts`

```typescript
export interface User {
  id: string;
  tenantId: string;
  staffId?: string;
  staffName?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
  active: boolean;
  createdAt: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
  staffId?: string;
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DENTIST' | 'ASSISTANT';
}

export interface ChangePasswordDTO {
  newPassword: string;
}

export const USER_ROLES = [
  { value: 'ADMIN', label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
  { value: 'DENTIST', label: 'Dentista', color: 'bg-blue-100 text-blue-800' },
  { value: 'ASSISTANT', label: 'Asistente', color: 'bg-green-100 text-green-800' },
] as const;
```

---

### 2. Servicio de Usuarios

**Ubicación**: `frontend/src/services/userService.ts`

```typescript
import api from './api';
import { User, CreateUserDTO, UpdateUserDTO, ChangePasswordDTO } from '../types/user.types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  changePassword: async (id: string, data: ChangePasswordDTO): Promise<void> => {
    await api.put(`/users/${id}/password`, data);
  },

  deactivate: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/deactivate`);
  },

  activate: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/activate`);
  },

  linkStaff: async (userId: string, staffId: string): Promise<void> => {
    await api.post(`/users/${userId}/link-staff/${staffId}`);
  },

  unlinkStaff: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/unlink-staff`);
  },
};
```

---

### 3. Página de Usuarios

**Ubicación**: `frontend/src/pages/users/UsersPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User, USER_ROLES } from '../../types/user.types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import UserModal from './UserModal';
import PasswordModal from './PasswordModal';
import LinkStaffModal from './LinkStaffModal';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLinkStaffModalOpen, setIsLinkStaffModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtro por búsqueda (nombre o email)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    // Filtro por rol
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filtro por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter((u) => u.active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((u) => !u.active);
    }

    setFilteredUsers(filtered);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleLinkStaff = (user: User) => {
    setSelectedUser(user);
    setIsLinkStaffModalOpen(true);
  };

  const handleToggleActive = async (user: User) => {
    const action = user.active ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Está seguro de ${action} este usuario?`)) return;

    try {
      if (user.active) {
        await userService.deactivate(user.id);
      } else {
        await userService.activate(user.id);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar estado del usuario');
    }
  };

  const handleUnlinkStaff = async (user: User) => {
    if (!window.confirm('¿Está seguro de desvincular este usuario del staff?')) return;

    try {
      await userService.unlinkStaff(user.id);
      loadUsers();
    } catch (error) {
      console.error('Error unlinking staff:', error);
      alert('Error al desvincular staff');
    }
  };

  const getRoleBadge = (role: string) => {
    const roleInfo = USER_ROLES.find((r) => r.value === role);
    return roleInfo ? (
      <span className={`px-2 py-1 text-xs rounded-full ${roleInfo.color}`}>
        {roleInfo.label}
      </span>
    ) : null;
  };

  if (loading) {
    return <div className="p-6">Cargando usuarios...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleNewUser}>Nuevo Usuario</Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          label="Buscar"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nombre o email..."
        />
        <Select
          label="Rol"
          name="role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Todos los roles</option>
          {USER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
        <Select
          label="Estado"
          name="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Staff Vinculado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.staffName ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{user.staffName}</span>
                      <button
                        onClick={() => handleUnlinkStaff(user)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Desvincular
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLinkStaff(user)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Vincular Staff
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleChangePassword(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Cambiar Contraseña
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`${
                      user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Modales */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={(refresh) => {
          setIsUserModalOpen(false);
          if (refresh) loadUsers();
        }}
        user={selectedUser}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={(refresh) => {
          setIsPasswordModalOpen(false);
          if (refresh) loadUsers();
        }}
        user={selectedUser}
      />

      <LinkStaffModal
        isOpen={isLinkStaffModalOpen}
        onClose={(refresh) => {
          setIsLinkStaffModalOpen(false);
          if (refresh) loadUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;
```

---

### 4. Modal de Usuario

**Ubicación**: `frontend/src/pages/users/UserModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { userService } from '../../services/userService';
import { staffService } from '../../services/staffService';
import { User, CreateUserDTO, UpdateUserDTO, USER_ROLES } from '../../types/user.types';
import { Staff } from '../../types/staff.types';

interface UserModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ASSISTANT',
    staffId: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserDTO, string>>>({});

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      if (user) {
        setFormData({
          email: user.email,
          password: '', // No se carga el password
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          staffId: user.staffId,
        });
      } else {
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'ASSISTANT',
          staffId: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const loadStaff = async () => {
    try {
      const data = await staffService.getAll();
      // Filtrar solo staff sin usuario asignado
      const availableStaff = data.filter((s) => !s.userId || (user && s.userId === user.id));
      setStaffList(availableStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'staffId' && value === '' ? undefined : value,
    }));

    if (errors[name as keyof CreateUserDTO]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserDTO, string>> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!user && formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      if (user) {
        // Actualizar (sin password)
        const updateData: UpdateUserDTO = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        };
        await userService.update(user.id, updateData);
      } else {
        // Crear
        await userService.create(formData);
      }
      onClose(true);
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={!!user} // No se puede cambiar email en edición
        />

        {!user && (
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="Mínimo 8 caracteres"
          />
        )}

        <Input
          label="Nombre"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />

        <Input
          label="Apellido"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />

        <Select
          label="Rol"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          {USER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>

        {!user && (
          <Select
            label="Vincular con Staff (Opcional)"
            name="staffId"
            value={formData.staffId || ''}
            onChange={handleChange}
          >
            <option value="">Sin vincular</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.firstName} {staff.lastName} - {staff.specialty}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
```

---

### 5. Modal de Cambio de Contraseña

**Ubicación**: `frontend/src/pages/users/PasswordModal.tsx`

```typescript
import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { userService } from '../../services/userService';
import { User } from '../../types/user.types';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  user: User | null;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      await userService.changePassword(user.id, { newPassword: password });
      alert('Contraseña cambiada exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={`Cambiar Contraseña - ${user?.firstName} ${user?.lastName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nueva Contraseña"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          required
          placeholder="Mínimo 8 caracteres"
        />

        <Input
          label="Confirmar Contraseña"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          required
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;
```

---

### 6. Modal de Vincular Staff

**Ubicación**: `frontend/src/pages/users/LinkStaffModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { userService } from '../../services/userService';
import { staffService } from '../../services/staffService';
import { User } from '../../types/user.types';
import { Staff } from '../../types/staff.types';

interface LinkStaffModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  user: User | null;
}

const LinkStaffModal: React.FC<LinkStaffModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      setSelectedStaffId('');
    }
  }, [isOpen]);

  const loadStaff = async () => {
    try {
      const data = await staffService.getAll();
      // Filtrar solo staff sin usuario asignado
      const availableStaff = data.filter((s) => !s.userId);
      setStaffList(availableStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaffId || !user) return;

    try {
      setLoading(true);
      await userService.linkStaff(user.id, selectedStaffId);
      alert('Usuario vinculado exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error linking staff:', error);
      alert('Error al vincular staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title={`Vincular Staff - ${user?.firstName} ${user?.lastName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Seleccionar Staff"
          name="staffId"
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          required
        >
          <option value="">Seleccione...</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.firstName} {staff.lastName} - {staff.specialty}
            </option>
          ))}
        </Select>

        {staffList.length === 0 && (
          <div className="text-sm text-gray-500">
            No hay personal disponible para vincular (todos ya tienen usuario asignado)
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || staffList.length === 0}>
            {loading ? 'Vinculando...' : 'Vincular'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LinkStaffModal;
```

---

### 7. Actualizar Rutas

**Ubicación**: `frontend/src/App.tsx`

Agregar la ruta de usuarios:

```typescript
import UsersPage from './pages/users/UsersPage';

// ...en las rutas protegidas:
<Route path="/users" element={<UsersPage />} />
```

---

### 8. Actualizar Dashboard

**Ubicación**: `frontend/src/pages/Dashboard.tsx`

Agregar link a gestión de usuarios:

```typescript
<Link to="/users" className="text-primary-600 hover:text-primary-800">
  Gestión de Usuarios
</Link>
```

---

## ✅ Validación y Pruebas

### Escenarios de Prueba

1. **Crear usuario sin vincular a staff**
   - Crear usuario ADMIN
   - Verificar que aparece en la lista
   - Verificar que muestra "Vincular Staff"

2. **Crear usuario vinculando a staff**
   - Seleccionar staff disponible
   - Crear usuario
   - Verificar que staff muestra el nombre del staff vinculado
   - Verificar que staff ya no aparece en lista de disponibles

3. **Editar usuario**
   - Cambiar nombre, rol
   - Verificar que NO se puede cambiar email
   - Verificar que NO se puede cambiar password desde este modal

4. **Cambiar contraseña**
   - Probar con menos de 8 caracteres (debe fallar)
   - Probar con contraseñas que no coinciden (debe fallar)
   - Cambiar correctamente
   - Cerrar sesión e iniciar con nueva contraseña

5. **Desactivar/Activar usuario**
   - Desactivar usuario
   - Intentar login (debe fallar)
   - Activar usuario
   - Intentar login (debe funcionar)

6. **Vincular staff después de crear**
   - Crear usuario sin staff
   - Click en "Vincular Staff"
   - Seleccionar staff disponible
   - Verificar vinculación

7. **Desvincular staff**
   - Usuario con staff vinculado
   - Click en "Desvincular"
   - Verificar que staff.user_id = null
   - Verificar que staff vuelve a aparecer como disponible

8. **Multi-tenancy**
   - Login con tenant A
   - Ver usuarios de tenant A
   - Login con tenant B
   - Verificar que solo ve usuarios de tenant B

9. **Permisos (solo ADMIN)**
   - Login como DENTIST o ASSISTANT
   - Intentar acceder a /users
   - Verificar error 403 Forbidden

---

## 📚 Notas Técnicas

### Seguridad
- Passwords siempre hasheados con BCrypt
- Solo ADMIN puede gestionar usuarios
- Multi-tenancy estricto en todos los endpoints
- Validación de email único por tenant

### Relaciones
- User.staff_id → Staff.id (nullable)
- Staff.user_id → User.id (nullable)
- Vinculación bidireccional se actualiza en ambas tablas

### Consideraciones
- NO se permite eliminar usuarios (solo desactivar)
- NO se retorna el password en ningún endpoint
- Cambio de password es operación separada
- Staff sin usuario puede seguir existiendo (ej: personal externo)

---

## 🎯 Resultado Esperado

Al completar esta historia de usuario:

✅ Administrador puede crear usuarios con roles específicos  
✅ Usuarios pueden vincularse a personal médico  
✅ Contraseñas se manejan de forma segura  
✅ Sistema multi-tenant respetado  
✅ Permisos basados en rol implementados  
✅ UI intuitiva con badges y filtros  
✅ Operaciones de vinculación/desvinculación funcionando  

---

**Fin del Documento**
