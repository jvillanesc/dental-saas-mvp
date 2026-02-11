package com.dental.controller;

import com.dental.dto.DashboardStatsDTO;
import com.dental.security.TenantContext;
import com.dental.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public Mono<DashboardStatsDTO> getStats() {
        return TenantContext.getTenantId()
                .flatMap(tenantId -> dashboardService.getStatsForTenant(tenantId));
    }
}
