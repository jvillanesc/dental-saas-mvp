package com.dental.service;

import com.dental.domain.model.Staff;
import com.dental.domain.model.User;
import com.dental.dto.CreateStaffRequest;
import com.dental.dto.StaffDTO;
import com.dental.repository.StaffRepository;
import com.dental.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class StaffService {
    
    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public StaffService(StaffRepository staffRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public Flux<StaffDTO> getAllStaff(UUID tenantId) {
        return staffRepository.findByTenantIdAndNotDeleted(tenantId)
                .map(this::toDTO);
    }
    
    public Mono<StaffDTO> getStaffById(UUID id, UUID tenantId) {
        return staffRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
                .map(this::toDTO);
    }
    
    public Mono<StaffDTO> createStaff(UUID tenantId, CreateStaffRequest request) {
        Staff staff = new Staff();
        staff.setTenantId(tenantId);
        staff.setFirstName(request.getFirstName());
        staff.setLastName(request.getLastName());
        staff.setPhone(request.getPhone());
        staff.setEmail(request.getEmail());
        staff.setSpecialty(request.getSpecialty());
        staff.setLicenseNumber(request.getLicenseNumber());
        staff.setHireDate(request.getHireDate());
        staff.setActive(request.getActive() != null ? request.getActive() : true);
        staff.setCreatedAt(LocalDateTime.now());
        
        if (Boolean.TRUE.equals(request.getCreateUser()) && request.getUserEmail() != null && request.getUserPassword() != null) {
            return staffRepository.save(staff)
                    .flatMap(savedStaff -> createUserForStaff(tenantId, request)
                            .flatMap(user -> {
                                // Vincular staff con usuario
                                savedStaff.setUserId(user.getId());
                                // Vincular usuario con staff
                                user.setStaffId(savedStaff.getId());
                                return userRepository.save(user)
                                        .then(staffRepository.save(savedStaff));
                            }))
                    .map(this::toDTO);
        } else {
            return staffRepository.save(staff)
                    .map(this::toDTO);
        }
    }
    
    public Mono<StaffDTO> updateStaff(UUID id, UUID tenantId, StaffDTO dto) {
        return staffRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                .flatMap(staff -> {
                    staff.setFirstName(dto.getFirstName());
                    staff.setLastName(dto.getLastName());
                    staff.setPhone(dto.getPhone());
                    staff.setEmail(dto.getEmail());
                    staff.setSpecialty(dto.getSpecialty());
                    staff.setLicenseNumber(dto.getLicenseNumber());
                    staff.setHireDate(dto.getHireDate());
                    staff.setActive(dto.getActive());
                    staff.setUpdatedAt(LocalDateTime.now());
                    return staffRepository.save(staff);
                })
                .map(this::toDTO);
    }
    
    public Mono<Void> deleteStaff(UUID id, UUID tenantId) {
        return staffRepository.findByIdAndTenantIdAndNotDeleted(id, tenantId)
                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                .flatMap(staff -> {
                    staff.setDeletedAt(LocalDateTime.now());
                    return staffRepository.save(staff);
                })
                .then();
    }
    
    private Mono<User> createUserForStaff(UUID tenantId, CreateStaffRequest request) {
        User user = new User();
        user.setTenantId(tenantId);
        user.setEmail(request.getUserEmail());
        user.setPassword(passwordEncoder.encode(request.getUserPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getUserRole() != null ? request.getUserRole() : "DENTIST");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    private StaffDTO toDTO(Staff staff) {
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setUserId(staff.getUserId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setFullName(staff.getFirstName() + " " + staff.getLastName());
        dto.setPhone(staff.getPhone());
        dto.setEmail(staff.getEmail());
        dto.setSpecialty(staff.getSpecialty());
        dto.setLicenseNumber(staff.getLicenseNumber());
        dto.setHireDate(staff.getHireDate());
        dto.setActive(staff.getActive());
        return dto;
    }
}
