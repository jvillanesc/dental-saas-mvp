import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Appointment, APPOINTMENT_STATUSES } from '../../types/appointment.types';
import { appointmentService } from '../../services/appointmentService';

interface AppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onStatusChanged: () => void;
}

const AppointmentStatusModal: React.FC<AppointmentStatusModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onStatusChanged,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(appointment.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedStatus === appointment.status) {
      // No cambios
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await appointmentService.updateStatus(appointment.id, selectedStatus);
      onStatusChanged();
      onClose();
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Error al actualizar el estado de la cita';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          errorMessage = 'No autenticado. Por favor inicie sesión nuevamente.';
        } else if (err.response.status === 403) {
          errorMessage = 'No tiene permisos para modificar esta cita.';
        } else if (err.response.status === 404) {
          errorMessage = 'La cita no existe o fue eliminada.';
        } else if (err.response.status === 500) {
          errorMessage = 'Error interno del servidor. Verifique los logs del backend.';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Estado de Cita" size="md">
      <div className="space-y-4">
        {/* Appointment Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Paciente:</span>{' '}
            <span className="text-gray-900">{appointment.patientName || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Dentista:</span>{' '}
            <span className="text-gray-900">{appointment.dentistName || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Hora:</span>{' '}
            <span className="text-gray-900">
              {formatTime(appointment.startTime)} ({appointment.durationMinutes} min)
            </span>
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-3">
            Seleccione el nuevo estado:
          </div>
          <div className="space-y-2">
            {APPOINTMENT_STATUSES.map((status) => (
              <label
                key={status.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                htmlFor={`status-${status.value}`}
              >
                <input
                  id={`status-${status.value}`}
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <span className="ml-3 flex-1">
                  <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Aceptar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentStatusModal;
