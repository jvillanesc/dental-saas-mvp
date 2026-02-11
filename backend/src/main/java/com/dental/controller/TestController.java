package com.dental.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
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
}
