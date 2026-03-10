import React, { useState, useEffect } from 'react';
import { medicalHistoryService } from '../../services/medicalHistoryService';
import { MedicalHistory, CreateMedicalHistoryDTO } from '../../types/medicalHistory.types';
import Button from '../../components/common/Button';

interface Props {
  patientId: string;
}

const MedicalHistoryTab: React.FC<Props> = ({ patientId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateMedicalHistoryDTO>({
    familyHistory: '',
    personalHistory: '',
    additionalComments: '',
    highBloodPressure: false,
    lowBloodPressure: false,
    hepatitis: false,
    gastritis: false,
    ulcers: false,
    hiv: false,
    diabetes: false,
    asthma: false,
    smoker: false,
    bloodDiseases: false,
    bloodDiseasesDetail: '',
    cardiacProblems: false,
    cardiacProblemsDetail: '',
    otherDisease: false,
    otherDiseaseDetail: '',
    dailyBrushing: undefined,
    bleedingGums: false,
    bleedingGumsDetail: '',
    abnormalBleeding: false,
    abnormalBleedingDetail: '',
    teethGrinding: false,
    teethGrindingDetail: '',
    mouthDiscomfort: false,
    mouthDiscomfortDetail: '',
    allergies: false,
    allergiesDetail: '',
    recentSurgery: false,
    recentSurgeryDetail: '',
    permanentMedication: false,
    permanentMedicationDetail: ''
  });

  useEffect(() => {
    loadMedicalHistory();
  }, [patientId]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const data = await medicalHistoryService.getByPatientId(patientId);
      if (data) {
        setFormData({
          familyHistory: data.familyHistory || '',
          personalHistory: data.personalHistory || '',
          additionalComments: data.additionalComments || '',
          highBloodPressure: data.highBloodPressure || false,
          lowBloodPressure: data.lowBloodPressure || false,
          hepatitis: data.hepatitis || false,
          gastritis: data.gastritis || false,
          ulcers: data.ulcers || false,
          hiv: data.hiv || false,
          diabetes: data.diabetes || false,
          asthma: data.asthma || false,
          smoker: data.smoker || false,
          bloodDiseases: data.bloodDiseases || false,
          bloodDiseasesDetail: data.bloodDiseasesDetail || '',
          cardiacProblems: data.cardiacProblems || false,
          cardiacProblemsDetail: data.cardiacProblemsDetail || '',
          otherDisease: data.otherDisease || false,
          otherDiseaseDetail: data.otherDiseaseDetail || '',
          dailyBrushing: data.dailyBrushing,
          bleedingGums: data.bleedingGums || false,
          bleedingGumsDetail: data.bleedingGumsDetail || '',
          abnormalBleeding: data.abnormalBleeding || false,
          abnormalBleedingDetail: data.abnormalBleedingDetail || '',
          teethGrinding: data.teethGrinding || false,
          teethGrindingDetail: data.teethGrindingDetail || '',
          mouthDiscomfort: data.mouthDiscomfort || false,
          mouthDiscomfortDetail: data.mouthDiscomfortDetail || '',
          allergies: data.allergies || false,
          allergiesDetail: data.allergiesDetail || '',
          recentSurgery: data.recentSurgery || false,
          recentSurgeryDetail: data.recentSurgeryDetail || '',
          permanentMedication: data.permanentMedication || false,
          permanentMedicationDetail: data.permanentMedicationDetail || ''
        });
      }
    } catch (error) {
      console.error('Error loading medical history:', error);
      alert('Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await medicalHistoryService.createOrUpdate(patientId, formData);
      alert('Historial médico guardado exitosamente');
    } catch (error) {
      console.error('Error saving medical history:', error);
      alert('Error al guardar el historial médico');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CreateMedicalHistoryDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Condiciones Médicas - Checkboxes simples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">¿Tiene o ha tenido?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.highBloodPressure}
              onChange={(e) => updateField('highBloodPressure', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Presión alta</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.lowBloodPressure}
              onChange={(e) => updateField('lowBloodPressure', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Presión baja</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hepatitis}
              onChange={(e) => updateField('hepatitis', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Hepatitis</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.gastritis}
              onChange={(e) => updateField('gastritis', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Gastritis</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.ulcers}
              onChange={(e) => updateField('ulcers', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Úlceras</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hiv}
              onChange={(e) => updateField('hiv', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">VIH</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.diabetes}
              onChange={(e) => updateField('diabetes', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Diabetes</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.asthma}
              onChange={(e) => updateField('asthma', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Asma</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smoker}
              onChange={(e) => updateField('smoker', e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">¿Fuma?</span>
          </label>
        </div>
      </div>

      {/* Conditions with Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Condiciones Adicionales</h3>

        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.bloodDiseases}
                onChange={(e) => updateField('bloodDiseases', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enfermedades sanguíneas</span>
            </label>
            {formData.bloodDiseases && (
              <input
                type="text"
                value={formData.bloodDiseasesDetail}
                onChange={(e) => updateField('bloodDiseasesDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.cardiacProblems}
                onChange={(e) => updateField('cardiacProblems', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Problemas cardíacos</span>
            </label>
            {formData.cardiacProblems && (
              <input
                type="text"
                value={formData.cardiacProblemsDetail}
                onChange={(e) => updateField('cardiacProblemsDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.otherDisease}
                onChange={(e) => updateField('otherDisease', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Padece de alguna otra enfermedad?</span>
            </label>
            {formData.otherDisease && (
              <input
                type="text"
                value={formData.otherDiseaseDetail}
                onChange={(e) => updateField('otherDiseaseDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Hábitos dentales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Hábitos Dentales</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cuántas veces al día se cepilla los dientes?
            </label>
            <input
              type="number"
              value={formData.dailyBrushing || ''}
              onChange={(e) => updateField('dailyBrushing', e.target.value ? Number.parseInt(e.target.value) : undefined)}
              min="0"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.bleedingGums}
                onChange={(e) => updateField('bleedingGums', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Le sangra las encías?</span>
            </label>
            {formData.bleedingGums && (
              <input
                type="text"
                value={formData.bleedingGumsDetail}
                onChange={(e) => updateField('bleedingGumsDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.abnormalBleeding}
                onChange={(e) => updateField('abnormalBleeding', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Ha tenido hemorragias anormales después de una extracción?</span>
            </label>
            {formData.abnormalBleeding && (
              <input
                type="text"
                value={formData.abnormalBleedingDetail}
                onChange={(e) => updateField('abnormalBleedingDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.teethGrinding}
                onChange={(e) => updateField('teethGrinding', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Hace rechinar o aprieta los dientes?</span>
            </label>
            {formData.teethGrinding && (
              <input
                type="text"
                value={formData.teethGrindingDetail}
                onChange={(e) => updateField('teethGrindingDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.mouthDiscomfort}
                onChange={(e) => updateField('mouthDiscomfort', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Otras molestias en la boca</span>
            </label>
            {formData.mouthDiscomfort && (
              <input
                type="text"
                value={formData.mouthDiscomfortDetail}
                onChange={(e) => updateField('mouthDiscomfortDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Alergias y medicamentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alergias y Medicamentos</h3>

        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.allergies}
                onChange={(e) => updateField('allergies', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Alergias</span>
            </label>
            {formData.allergies && (
              <input
                type="text"
                value={formData.allergiesDetail}
                onChange={(e) => updateField('allergiesDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.recentSurgery}
                onChange={(e) => updateField('recentSurgery', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Ha tenido alguna operación grande en los últimos años?</span>
            </label>
            {formData.recentSurgery && (
              <input
                type="text"
                value={formData.recentSurgeryDetail}
                onChange={(e) => updateField('recentSurgeryDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.permanentMedication}
                onChange={(e) => updateField('permanentMedication', e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">¿Toma alguna medicación de manera permanente?</span>
            </label>
            {formData.permanentMedication && (
              <input
                type="text"
                value={formData.permanentMedicationDetail}
                onChange={(e) => updateField('permanentMedicationDetail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Especifique..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Antecedentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Antecedentes</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antecedentes familiares
          </label>
          <textarea
            value={formData.familyHistory}
            onChange={(e) => updateField('familyHistory', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describa antecedentes familiares relevantes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Antecedentes personales
          </label>
          <textarea
            value={formData.personalHistory}
            onChange={(e) => updateField('personalHistory', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describa antecedentes personales relevantes..."
          />
        </div>
      </div>

      {/* Comentario adicional */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario adicional
          </label>
          <textarea
            value={formData.additionalComments}
            onChange={(e) => updateField('additionalComments', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Información adicional relevante..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-6 border-t">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Historial'}
        </Button>
      </div>
    </form>
  );
};

export default MedicalHistoryTab;
