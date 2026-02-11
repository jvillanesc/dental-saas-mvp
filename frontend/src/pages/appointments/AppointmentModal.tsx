import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { staffService } from '../../services/staffService';
import { Appointment, CreateAppointmentDTO, APPOINTMENT_STATUSES } from '../../types/appointment.types';
import { Patient } from '../../types/patient.types';
import { Staff } from '../../types/staff.types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  appointment: Appointment | null;
  initialDateTime?: Date | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  initialDateTime,
}) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Staff[]>([]);
  const [formData, setFormData] = useState<CreateAppointmentDTO>({
    patientId: '',
    dentistId: '',
    startTime: '',
    durationMinutes: 30,
    status: 'SCHEDULED',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAppointmentDTO, string>>>({});

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      loadDentists();
    }
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        startTime: appointment.startTime.substring(0, 16),
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else {
      const defaultDateTime = initialDateTime || new Date();
      const dateTimeStr = new Date(
        defaultDateTime.getTime() - defaultDateTime.getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 16);

      setFormData({
        patientId: '',
        dentistId: '',
        startTime: dateTimeStr,
        durationMinutes: 30,
        status: 'SCHEDULED',
        notes: '',
      });
    }
    setErrors({});
  }, [appointment, initialDateTime, isOpen]);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadDentists = async () => {
    try {
      const data = await staffService.getDentists();
      setDentists(data);
    } catch (error) {
      console.error('Error loading dentists:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes'
        ? parseInt(value, 10)
        : value,
    }));

    if (errors[name as keyof CreateAppointmentDTO]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAppointmentDTO, string>> = {};

    if (!formData.patientId || formData.patientId === '') {
      newErrors.patientId = 'Debe seleccionar un paciente';
    }
    if (!formData.dentistId || formData.dentistId === '') {
      newErrors.dentistId = 'Debe seleccionar un dentista';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'La fecha y hora son requeridas';
    }
    if (!formData.durationMinutes || formData.durationMinutes < 15) {
      newErrors.durationMinutes = 'La duración debe ser al menos 15 minutos';
    }
    if (!formData.status) {
      newErrors.status = 'El estado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      // Convertir startTime a formato ISO completo
      const submitData = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
      };

      if (appointment) {
        await appointmentService.update(appointment.id, submitData);
        alert('Cita actualizada exitosamente');
      } else {
        await appointmentService.create(submitData);
        alert('Cita creada exitosamente');
      }
      onClose(true);
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      alert(error.response?.data?.message || 'Error al guardar cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={appointment ? 'Editar Cita' : 'Nueva Cita'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Paciente"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            options={[
              { value: 0, label: 'Seleccione un paciente' },
              ...patients.map((p) => ({
                value: p.id,
                label: `${p.firstName} ${p.lastName}`,
              })),
            ]}
            error={errors.patientId}
            required
          />

          <Select
            label="Dentista"
            name="dentistId"
            value={formData.dentistId}
            onChange={handleChange}
            options={[
              { value: 0, label: 'Seleccione un dentista' },
              ...dentists.map((d) => ({
                value: d.id,
                label: `${d.firstName} ${d.lastName} - ${d.specialty}`,
              })),
            ]}
            error={errors.dentistId}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha y Hora"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
          />

          <Input
            label="Duración (minutos)"
            name="durationMinutes"
            type="number"
            min="15"
            step="15"
            value={formData.durationMinutes}
            onChange={handleChange}
            error={errors.durationMinutes}
            required
          />

          <Select
            label="Estado"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={APPOINTMENT_STATUSES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            error={errors.status}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notas adicionales sobre la cita..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : appointment ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;
