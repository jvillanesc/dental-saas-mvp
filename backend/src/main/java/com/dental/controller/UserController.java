package com.dental.controller;

import com.dental.dto.*;
import com.dental.security.JwtUtil;
import com.dental.security.TenantContext;
import com.dental.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
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
    
    private Mono<String> extractRole(String authHeader) {
        String token = authHeader.substring(7);
        return Mono.just(jwtUtil.getRoleFromToken(token));
    }
    
    private Mono<Boolean> isAdmin(String authHeader) {
        return extractRole(authHeader).map("ADMIN"::equals);
    }
    
    @GetMapping
    public Mono<ResponseEntity<List<UserDTO>>> getAllUsers(
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<List<UserDTO>>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMapMany(tenantId -> userService.getAllUsers(tenantId))
                            .collectList()
                            .map(ResponseEntity::ok);
                });
    }
    
    @PostMapping
    public Mono<ResponseEntity<UserDTO>> createUser(
            @RequestBody CreateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<UserDTO>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.createUser(tenantId, request)
                                    .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
                });
    }
    
    @PutMapping("/{id}")
    public Mono<ResponseEntity<UserDTO>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<UserDTO>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.updateUser(id, tenantId, request)
                                    .map(ResponseEntity::ok)
                                    .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
                });
    }
    
    @PutMapping("/{id}/password")
    public Mono<ResponseEntity<Void>> changePassword(
            @PathVariable UUID id,
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.changePassword(id, tenantId, request)
                                    .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
                });
    }
    
    @PutMapping("/{id}/deactivate")
    public Mono<ResponseEntity<Void>> deactivateUser(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.deactivateUser(id, tenantId)
                                    .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
                });
    }
    
    @PutMapping("/{id}/activate")
    public Mono<ResponseEntity<Void>> activateUser(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.activateUser(id, tenantId)
                                    .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build())));
                });
    }
    
    @PostMapping("/{userId}/link-staff/{staffId}")
    public Mono<ResponseEntity<Void>> linkStaff(
            @PathVariable UUID userId,
            @PathVariable UUID staffId,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.linkUserToStaff(userId, staffId, tenantId)
                                    .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
                });
    }
    
    @DeleteMapping("/{userId}/unlink-staff")
    public Mono<ResponseEntity<Void>> unlinkStaff(
            @PathVariable UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        return isAdmin(authHeader)
                .flatMap(isAdmin -> {
                    if (!isAdmin) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build());
                    }
                    return TenantContext.getTenantId()
                            .flatMap(tenantId -> userService.unlinkUserFromStaff(userId, tenantId)
                                    .then(Mono.just(ResponseEntity.ok().<Void>build()))
                                    .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build())));
                });
    }
}
