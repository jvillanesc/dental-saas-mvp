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
    
    public Flux<UserDTO> getAllUsers(UUID tenantId) {
        return userRepository.findByTenantId(tenantId)
                .flatMap(this::toDTOWithStaffInfo);
    }
    
    public Mono<UserDTO> createUser(UUID tenantId, CreateUserRequest request) {
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
                    user.setStaffId(request.getStaffId());
                    
                    return userRepository.save(user)
                            .flatMap(savedUser -> {
                                if (savedUser.getStaffId() != null) {
                                    return linkUserToStaff(savedUser.getId(), savedUser.getStaffId(), tenantId)
                                            .then(toDTOWithStaffInfo(savedUser));
                                }
                                return toDTOWithStaffInfo(savedUser);
                            });
                });
    }
    
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
    
    public Mono<Void> deactivateUser(UUID id, UUID tenantId) {
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setActive(false);
                    return userRepository.save(user);
                })
                .then();
    }
    
    public Mono<Void> activateUser(UUID id, UUID tenantId) {
        return userRepository.findByIdAndTenantId(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    user.setActive(true);
                    return userRepository.save(user);
                })
                .then();
    }
    
    public Mono<Void> linkUserToStaff(UUID userId, UUID staffId, UUID tenantId) {
        return Mono.zip(
                userRepository.findByIdAndTenantId(userId, tenantId),
                staffRepository.findByIdAndTenantId(staffId, tenantId)
        ).flatMap(tuple -> {
            User user = tuple.getT1();
            Staff staff = tuple.getT2();
            
            user.setStaffId(staffId);
            staff.setUserId(userId);
            staff.setUpdatedAt(LocalDateTime.now());
            
            return userRepository.save(user)
                    .then(staffRepository.save(staff))
                    .then();
        });
    }
    
    public Mono<Void> unlinkUserFromStaff(UUID userId, UUID tenantId) {
        return userRepository.findByIdAndTenantId(userId, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Usuario no encontrado")))
                .flatMap(user -> {
                    UUID staffId = user.getStaffId();
                    if (staffId == null) {
                        return Mono.error(new RuntimeException("Usuario no está vinculado a staff"));
                    }
                    
                    user.setStaffId(null);
                    
                    return staffRepository.findById(staffId)
                            .flatMap(staff -> {
                                staff.setUserId(null);
                                staff.setUpdatedAt(LocalDateTime.now());
                                return staffRepository.save(staff);
                            })
                            .then(userRepository.save(user))
                            .then();
                });
    }
    
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
