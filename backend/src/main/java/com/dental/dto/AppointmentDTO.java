package com.dental.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AppointmentDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID dentistId;
    private String dentistName;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private String status;
    private String notes;

    public AppointmentDTO() {
    }

    public AppointmentDTO(UUID id, UUID patientId, String patientName, UUID dentistId, String dentistName, LocalDateTime startTime, Integer durationMinutes, String status, String notes) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.dentistId = dentistId;
        this.dentistName = dentistName;
        this.startTime = startTime;
        this.durationMinutes = durationMinutes;
        this.status = status;
        this.notes = notes;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public UUID getDentistId() {
        return dentistId;
    }

    public void setDentistId(UUID dentistId) {
        this.dentistId = dentistId;
    }

    public String getDentistName() {
        return dentistName;
    }

    public void setDentistName(String dentistName) {
        this.dentistName = dentistName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
