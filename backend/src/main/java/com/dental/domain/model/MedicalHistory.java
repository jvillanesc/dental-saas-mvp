package com.dental.domain.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("medical_history")
public class MedicalHistory {
    @Id
    private UUID id;
    private UUID tenantId;
    private UUID patientId;
    
    // Background History
    private String familyHistory;
    private String personalHistory;
    private String additionalComments;
    
    // Medical Conditions (Boolean)
    private Boolean highBloodPressure;
    private Boolean lowBloodPressure;
    private Boolean hepatitis;
    private Boolean gastritis;
    private Boolean ulcers;
    private Boolean hiv;
    private Boolean diabetes;
    private Boolean asthma;
    private Boolean smoker;
    
    // Conditions with Details
    private Boolean bloodDiseases;
    private String bloodDiseasesDetail;
    private Boolean cardiacProblems;
    private String cardiacProblemsDetail;
    private Boolean otherDisease;
    private String otherDiseaseDetail;
    
    // Dental Habits
    private Integer dailyBrushing;
    private Boolean bleedingGums;
    private String bleedingGumsDetail;
    private Boolean abnormalBleeding;
    private String abnormalBleedingDetail;
    private Boolean teethGrinding;
    private String teethGrindingDetail;
    private Boolean mouthDiscomfort;
    private String mouthDiscomfortDetail;
    
    // Allergies & Medications
    private Boolean allergies;
    private String allergiesDetail;
    private Boolean recentSurgery;
    private String recentSurgeryDetail;
    private Boolean permanentMedication;
    private String permanentMedicationDetail;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public MedicalHistory() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public String getFamilyHistory() {
        return familyHistory;
    }

    public void setFamilyHistory(String familyHistory) {
        this.familyHistory = familyHistory;
    }

    public String getPersonalHistory() {
        return personalHistory;
    }

    public void setPersonalHistory(String personalHistory) {
        this.personalHistory = personalHistory;
    }

    public String getAdditionalComments() {
        return additionalComments;
    }

    public void setAdditionalComments(String additionalComments) {
        this.additionalComments = additionalComments;
    }

    public Boolean getHighBloodPressure() {
        return highBloodPressure;
    }

    public void setHighBloodPressure(Boolean highBloodPressure) {
        this.highBloodPressure = highBloodPressure;
    }

    public Boolean getLowBloodPressure() {
        return lowBloodPressure;
    }

    public void setLowBloodPressure(Boolean lowBloodPressure) {
        this.lowBloodPressure = lowBloodPressure;
    }

    public Boolean getHepatitis() {
        return hepatitis;
    }

    public void setHepatitis(Boolean hepatitis) {
        this.hepatitis = hepatitis;
    }

    public Boolean getGastritis() {
        return gastritis;
    }

    public void setGastritis(Boolean gastritis) {
        this.gastritis = gastritis;
    }

    public Boolean getUlcers() {
        return ulcers;
    }

    public void setUlcers(Boolean ulcers) {
        this.ulcers = ulcers;
    }

    public Boolean getHiv() {
        return hiv;
    }

    public void setHiv(Boolean hiv) {
        this.hiv = hiv;
    }

    public Boolean getDiabetes() {
        return diabetes;
    }

    public void setDiabetes(Boolean diabetes) {
        this.diabetes = diabetes;
    }

    public Boolean getAsthma() {
        return asthma;
    }

    public void setAsthma(Boolean asthma) {
        this.asthma = asthma;
    }

    public Boolean getSmoker() {
        return smoker;
    }

    public void setSmoker(Boolean smoker) {
        this.smoker = smoker;
    }

    public Boolean getBloodDiseases() {
        return bloodDiseases;
    }

    public void setBloodDiseases(Boolean bloodDiseases) {
        this.bloodDiseases = bloodDiseases;
    }

    public String getBloodDiseasesDetail() {
        return bloodDiseasesDetail;
    }

    public void setBloodDiseasesDetail(String bloodDiseasesDetail) {
        this.bloodDiseasesDetail = bloodDiseasesDetail;
    }

    public Boolean getCardiacProblems() {
        return cardiacProblems;
    }

    public void setCardiacProblems(Boolean cardiacProblems) {
        this.cardiacProblems = cardiacProblems;
    }

    public String getCardiacProblemsDetail() {
        return cardiacProblemsDetail;
    }

    public void setCardiacProblemsDetail(String cardiacProblemsDetail) {
        this.cardiacProblemsDetail = cardiacProblemsDetail;
    }

    public Boolean getOtherDisease() {
        return otherDisease;
    }

    public void setOtherDisease(Boolean otherDisease) {
        this.otherDisease = otherDisease;
    }

    public String getOtherDiseaseDetail() {
        return otherDiseaseDetail;
    }

    public void setOtherDiseaseDetail(String otherDiseaseDetail) {
        this.otherDiseaseDetail = otherDiseaseDetail;
    }

    public Integer getDailyBrushing() {
        return dailyBrushing;
    }

    public void setDailyBrushing(Integer dailyBrushing) {
        this.dailyBrushing = dailyBrushing;
    }

    public Boolean getBleedingGums() {
        return bleedingGums;
    }

    public void setBleedingGums(Boolean bleedingGums) {
        this.bleedingGums = bleedingGums;
    }

    public String getBleedingGumsDetail() {
        return bleedingGumsDetail;
    }

    public void setBleedingGumsDetail(String bleedingGumsDetail) {
        this.bleedingGumsDetail = bleedingGumsDetail;
    }

    public Boolean getAbnormalBleeding() {
        return abnormalBleeding;
    }

    public void setAbnormalBleeding(Boolean abnormalBleeding) {
        this.abnormalBleeding = abnormalBleeding;
    }

    public String getAbnormalBleedingDetail() {
        return abnormalBleedingDetail;
    }

    public void setAbnormalBleedingDetail(String abnormalBleedingDetail) {
        this.abnormalBleedingDetail = abnormalBleedingDetail;
    }

    public Boolean getTeethGrinding() {
        return teethGrinding;
    }

    public void setTeethGrinding(Boolean teethGrinding) {
        this.teethGrinding = teethGrinding;
    }

    public String getTeethGrindingDetail() {
        return teethGrindingDetail;
    }

    public void setTeethGrindingDetail(String teethGrindingDetail) {
        this.teethGrindingDetail = teethGrindingDetail;
    }

    public Boolean getMouthDiscomfort() {
        return mouthDiscomfort;
    }

    public void setMouthDiscomfort(Boolean mouthDiscomfort) {
        this.mouthDiscomfort = mouthDiscomfort;
    }

    public String getMouthDiscomfortDetail() {
        return mouthDiscomfortDetail;
    }

    public void setMouthDiscomfortDetail(String mouthDiscomfortDetail) {
        this.mouthDiscomfortDetail = mouthDiscomfortDetail;
    }

    public Boolean getAllergies() {
        return allergies;
    }

    public void setAllergies(Boolean allergies) {
        this.allergies = allergies;
    }

    public String getAllergiesDetail() {
        return allergiesDetail;
    }

    public void setAllergiesDetail(String allergiesDetail) {
        this.allergiesDetail = allergiesDetail;
    }

    public Boolean getRecentSurgery() {
        return recentSurgery;
    }

    public void setRecentSurgery(Boolean recentSurgery) {
        this.recentSurgery = recentSurgery;
    }

    public String getRecentSurgeryDetail() {
        return recentSurgeryDetail;
    }

    public void setRecentSurgeryDetail(String recentSurgeryDetail) {
        this.recentSurgeryDetail = recentSurgeryDetail;
    }

    public Boolean getPermanentMedication() {
        return permanentMedication;
    }

    public void setPermanentMedication(Boolean permanentMedication) {
        this.permanentMedication = permanentMedication;
    }

    public String getPermanentMedicationDetail() {
        return permanentMedicationDetail;
    }

    public void setPermanentMedicationDetail(String permanentMedicationDetail) {
        this.permanentMedicationDetail = permanentMedicationDetail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
