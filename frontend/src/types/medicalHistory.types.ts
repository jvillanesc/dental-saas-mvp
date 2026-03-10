export interface MedicalHistory {
  id: string;
  patientId: string;
  
  // Background
  familyHistory?: string;
  personalHistory?: string;
  additionalComments?: string;
  
  // Medical Conditions
  highBloodPressure: boolean;
  lowBloodPressure: boolean;
  hepatitis: boolean;
  gastritis: boolean;
  ulcers: boolean;
  hiv: boolean;
  diabetes: boolean;
  asthma: boolean;
  smoker: boolean;
  
  // Conditions with Details
  bloodDiseases: boolean;
  bloodDiseasesDetail?: string;
  cardiacProblems: boolean;
  cardiacProblemsDetail?: string;
  otherDisease: boolean;
  otherDiseaseDetail?: string;
  
  // Dental Habits
  dailyBrushing?: number;
  bleedingGums: boolean;
  bleedingGumsDetail?: string;
  abnormalBleeding: boolean;
  abnormalBleedingDetail?: string;
  teethGrinding: boolean;
  teethGrindingDetail?: string;
  mouthDiscomfort: boolean;
  mouthDiscomfortDetail?: string;
  
  // Allergies & Medications
  allergies: boolean;
  allergiesDetail?: string;
  recentSurgery: boolean;
  recentSurgeryDetail?: string;
  permanentMedication: boolean;
  permanentMedicationDetail?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalHistoryDTO {
  familyHistory?: string;
  personalHistory?: string;
  additionalComments?: string;
  highBloodPressure: boolean;
  lowBloodPressure: boolean;
  hepatitis: boolean;
  gastritis: boolean;
  ulcers: boolean;
  hiv: boolean;
  diabetes: boolean;
  asthma: boolean;
  smoker: boolean;
  bloodDiseases: boolean;
  bloodDiseasesDetail?: string;
  cardiacProblems: boolean;
  cardiacProblemsDetail?: string;
  otherDisease: boolean;
  otherDiseaseDetail?: string;
  dailyBrushing?: number;
  bleedingGums: boolean;
  bleedingGumsDetail?: string;
  abnormalBleeding: boolean;
  abnormalBleedingDetail?: string;
  teethGrinding: boolean;
  teethGrindingDetail?: string;
  mouthDiscomfort: boolean;
  mouthDiscomfortDetail?: string;
  allergies: boolean;
  allergiesDetail?: string;
  recentSurgery: boolean;
  recentSurgeryDetail?: string;
  permanentMedication: boolean;
  permanentMedicationDetail?: string;
}
