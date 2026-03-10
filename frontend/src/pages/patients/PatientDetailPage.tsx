import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types/patient.types';
import MedicalHistoryTab from './MedicalHistoryTab';

type Tab = 'historia' | 'odontograma' | 'ortodoncia';

const PatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('historia');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPatient();
  }, [patientId]);
  
  const loadPatient = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      const data = await patientService.getById(patientId);
      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Error al cargar información del paciente');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Paciente no encontrado</p>
          <button
            onClick={() => navigate('/patients')}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/patients')}
                className="text-blue-600 hover:text-blue-800 mb-2 text-sm font-medium"
              >
                ← Volver a Pacientes
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {patient.email} • {patient.phone}
              </p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-t-lg border-b border-gray-200 shadow-sm">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('historia')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historia'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historia Clínica
            </button>
            <button
              onClick={() => setActiveTab('odontograma')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Odontograma
            </button>
            <button
              onClick={() => setActiveTab('ortodoncia')}
              className="py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Ortodoncia
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {activeTab === 'historia' && <MedicalHistoryTab patientId={patientId!} />}
          {activeTab === 'odontograma' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Odontograma - Próximamente...</p>
              <p className="text-sm mt-2">Esta funcionalidad estará disponible en una futura versión</p>
            </div>
          )}
          {activeTab === 'ortodoncia' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Ortodoncia - Próximamente...</p>
              <p className="text-sm mt-2">Esta funcionalidad estará disponible en una futura versión</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDetailPage;
