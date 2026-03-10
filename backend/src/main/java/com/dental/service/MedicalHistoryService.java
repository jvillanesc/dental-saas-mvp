package com.dental.service;

import com.dental.domain.model.MedicalHistory;
import com.dental.dto.CreateMedicalHistoryRequest;
import com.dental.dto.MedicalHistoryDTO;
import com.dental.repository.MedicalHistoryRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MedicalHistoryService {
    
    private final MedicalHistoryRepository medicalHistoryRepository;
    
    public MedicalHistoryService(MedicalHistoryRepository medicalHistoryRepository) {
        this.medicalHistoryRepository = medicalHistoryRepository;
    }
    
    public Mono<MedicalHistoryDTO> getByPatientId(UUID patientId, UUID tenantId) {
        return medicalHistoryRepository.findByTenantIdAndPatientIdAndNotDeleted(tenantId, patientId)
                .map(this::toDTO);
    }
    
    public Mono<MedicalHistoryDTO> createOrUpdate(UUID patientId, UUID tenantId, CreateMedicalHistoryRequest request) {
        return medicalHistoryRepository.findByTenantIdAndPatientIdAndNotDeleted(tenantId, patientId)
                .switchIfEmpty(Mono.defer(() -> {
                    // Crear nuevo registro SIN ID (la BD lo genera)
                    MedicalHistory newHistory = new MedicalHistory();
                    newHistory.setTenantId(tenantId);
                    newHistory.setPatientId(patientId);
                    newHistory.setCreatedAt(LocalDateTime.now());
                    return Mono.just(newHistory);
                }))
                .flatMap(history -> {
                    // Actualizar campos
                    history.setFamilyHistory(request.getFamilyHistory());
                    history.setPersonalHistory(request.getPersonalHistory());
                    history.setAdditionalComments(request.getAdditionalComments());
                    history.setHighBloodPressure(request.getHighBloodPressure());
                    history.setLowBloodPressure(request.getLowBloodPressure());
                    history.setHepatitis(request.getHepatitis());
                    history.setGastritis(request.getGastritis());
                    history.setUlcers(request.getUlcers());
                    history.setHiv(request.getHiv());
                    history.setDiabetes(request.getDiabetes());
                    history.setAsthma(request.getAsthma());
                    history.setSmoker(request.getSmoker());
                    history.setBloodDiseases(request.getBloodDiseases());
                    history.setBloodDiseasesDetail(request.getBloodDiseasesDetail());
                    history.setCardiacProblems(request.getCardiacProblems());
                    history.setCardiacProblemsDetail(request.getCardiacProblemsDetail());
                    history.setOtherDisease(request.getOtherDisease());
                    history.setOtherDiseaseDetail(request.getOtherDiseaseDetail());
                    history.setDailyBrushing(request.getDailyBrushing());
                    history.setBleedingGums(request.getBleedingGums());
                    history.setBleedingGumsDetail(request.getBleedingGumsDetail());
                    history.setAbnormalBleeding(request.getAbnormalBleeding());
                    history.setAbnormalBleedingDetail(request.getAbnormalBleedingDetail());
                    history.setTeethGrinding(request.getTeethGrinding());
                    history.setTeethGrindingDetail(request.getTeethGrindingDetail());
                    history.setMouthDiscomfort(request.getMouthDiscomfort());
                    history.setMouthDiscomfortDetail(request.getMouthDiscomfortDetail());
                    history.setAllergies(request.getAllergies());
                    history.setAllergiesDetail(request.getAllergiesDetail());
                    history.setRecentSurgery(request.getRecentSurgery());
                    history.setRecentSurgeryDetail(request.getRecentSurgeryDetail());
                    history.setPermanentMedication(request.getPermanentMedication());
                    history.setPermanentMedicationDetail(request.getPermanentMedicationDetail());
                    history.setUpdatedAt(LocalDateTime.now());
                    
                    return medicalHistoryRepository.save(history);
                })
                .doOnSuccess(history -> System.out.println("✅ Medical history saved: " + history.getId()))
                .doOnError(e -> System.err.println("❌ ERROR saving medical history: " + e.getMessage()))
                .map(this::toDTO);
    }
    
    public Mono<Void> delete(UUID patientId, UUID tenantId) {
        return medicalHistoryRepository.findByTenantIdAndPatientIdAndNotDeleted(tenantId, patientId)
                .switchIfEmpty(Mono.error(new RuntimeException("Medical history not found")))
                .flatMap(history -> {
                    history.setDeletedAt(LocalDateTime.now());
                    return medicalHistoryRepository.save(history);
                })
                .then();
    }
    
    private MedicalHistoryDTO toDTO(MedicalHistory history) {
        MedicalHistoryDTO dto = new MedicalHistoryDTO();
        dto.setId(history.getId());
        dto.setPatientId(history.getPatientId());
        dto.setFamilyHistory(history.getFamilyHistory());
        dto.setPersonalHistory(history.getPersonalHistory());
        dto.setAdditionalComments(history.getAdditionalComments());
        dto.setHighBloodPressure(history.getHighBloodPressure());
        dto.setLowBloodPressure(history.getLowBloodPressure());
        dto.setHepatitis(history.getHepatitis());
        dto.setGastritis(history.getGastritis());
        dto.setUlcers(history.getUlcers());
        dto.setHiv(history.getHiv());
        dto.setDiabetes(history.getDiabetes());
        dto.setAsthma(history.getAsthma());
        dto.setSmoker(history.getSmoker());
        dto.setBloodDiseases(history.getBloodDiseases());
        dto.setBloodDiseasesDetail(history.getBloodDiseasesDetail());
        dto.setCardiacProblems(history.getCardiacProblems());
        dto.setCardiacProblemsDetail(history.getCardiacProblemsDetail());
        dto.setOtherDisease(history.getOtherDisease());
        dto.setOtherDiseaseDetail(history.getOtherDiseaseDetail());
        dto.setDailyBrushing(history.getDailyBrushing());
        dto.setBleedingGums(history.getBleedingGums());
        dto.setBleedingGumsDetail(history.getBleedingGumsDetail());
        dto.setAbnormalBleeding(history.getAbnormalBleeding());
        dto.setAbnormalBleedingDetail(history.getAbnormalBleedingDetail());
        dto.setTeethGrinding(history.getTeethGrinding());
        dto.setTeethGrindingDetail(history.getTeethGrindingDetail());
        dto.setMouthDiscomfort(history.getMouthDiscomfort());
        dto.setMouthDiscomfortDetail(history.getMouthDiscomfortDetail());
        dto.setAllergies(history.getAllergies());
        dto.setAllergiesDetail(history.getAllergiesDetail());
        dto.setRecentSurgery(history.getRecentSurgery());
        dto.setRecentSurgeryDetail(history.getRecentSurgeryDetail());
        dto.setPermanentMedication(history.getPermanentMedication());
        dto.setPermanentMedicationDetail(history.getPermanentMedicationDetail());
        dto.setCreatedAt(history.getCreatedAt());
        dto.setUpdatedAt(history.getUpdatedAt());
        return dto;
    }
}
