package com.dental.dto;

public class DashboardStatsDTO {
    private Long totalPatients;
    private Long activeStaff;
    private Long appointmentsToday;
    private Long appointmentsPending;

    public DashboardStatsDTO(Long totalPatients, Long activeStaff, 
                             Long appointmentsToday, Long appointmentsPending) {
        this.totalPatients = totalPatients;
        this.activeStaff = activeStaff;
        this.appointmentsToday = appointmentsToday;
        this.appointmentsPending = appointmentsPending;
    }

    public Long getTotalPatients() {
        return totalPatients;
    }

    public Long getActiveStaff() {
        return activeStaff;
    }

    public Long getAppointmentsToday() {
        return appointmentsToday;
    }

    public Long getAppointmentsPending() {
        return appointmentsPending;
    }
}
