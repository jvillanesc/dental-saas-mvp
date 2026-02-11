package com.dental.service;

import com.dental.domain.model.User;
import com.dental.dto.LoginRequest;
import com.dental.dto.LoginResponse;
import com.dental.repository.TenantRepository;
import com.dental.repository.UserRepository;
import com.dental.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class AuthService {
    
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthService(UserRepository userRepository, TenantRepository tenantRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    public Mono<LoginResponse> login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        return userRepository.findByEmail(request.getEmail())
                .doOnNext(user -> log.info("User found: {}", user.getEmail()))
                .doOnNext(user -> log.info("Password match: {}", passwordEncoder.matches(request.getPassword(), user.getPassword())))
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("Invalid credentials for email: {}", request.getEmail());
                    return Mono.error(new RuntimeException("Invalid credentials"));
                }))
                .flatMap(user -> {
                    log.info("Login successful for user: {}", user.getEmail());
                    String token = jwtUtil.generateToken(
                            user.getId(),
                            user.getTenantId(),
                            user.getEmail(),
                            user.getRole()
                    );
                    
                    return tenantRepository.findById(user.getTenantId())
                            .map(tenant -> new LoginResponse(
                                    token,
                                    user.getId(),
                                    user.getTenantId(),
                                    tenant.getName(),
                                    user.getEmail(),
                                    user.getFirstName(),
                                    user.getLastName(),
                                    user.getRole()
                            ))
                            .defaultIfEmpty(new LoginResponse(
                                    token,
                                    user.getId(),
                                    user.getTenantId(),
                                    "Clínica",
                                    user.getEmail(),
                                    user.getFirstName(),
                                    user.getLastName(),
                                    user.getRole()
                            ));
                });
    }
}
