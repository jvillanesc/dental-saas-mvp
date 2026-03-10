package com.dental.controller;

import com.dental.security.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    private static final Logger log = LoggerFactory.getLogger(TestController.class);
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @PostMapping("/check-password")
    public Mono<Map<String, Object>> checkPassword(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String hashedPassword = request.get("hash");
        
        boolean matches = passwordEncoder.matches(plainPassword, hashedPassword);
        
        Map<String, Object> response = new HashMap<>();
        response.put("matches", matches);
        response.put("plainPassword", plainPassword);
        response.put("hash", hashedPassword);
        
        return Mono.just(response);
    }
    
    @PostMapping("/generate-hash")
    public Mono<Map<String, String>> generateHash(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String hash = passwordEncoder.encode(plainPassword);
        
        Map<String, String> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("hash", hash);
        
        return Mono.just(response);
    }
    
    @GetMapping("/tenant-context")
    public Mono<Map<String, Object>> checkTenantContext() {
        return TenantContext.getTenantId()
            .map(tenantId -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("tenantId", tenantId.toString());
                response.put("message", "Tenant context established successfully");
                return response;
            })
            .onErrorResume(e -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("tenantId", null);
                response.put("error", e.getMessage());
                response.put("message", "Tenant context not found - JWT token required");
                return Mono.just(response);
            });
    }
}
