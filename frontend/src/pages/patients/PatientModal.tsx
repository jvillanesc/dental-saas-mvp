import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { patientService } from '../../services/patientService';
import { Patient, CreatePatientDTO } from '../../types/patient.types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  patient: Patient | null;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, patient }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePatientDTO>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePatientDTO>>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phone: patient.phone,
        email: patient.email,
        birthDate: patient.birthDate,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        birthDate: '',
      });
    }
    setErrors({});
  }, [patient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreatePatientDTO]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CreatePatientDTO> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
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
      if (patient) {
        await patientService.update(patient.id, formData);
        alert('Paciente actualizado exitosamente');
      } else {
        await patientService.create(formData);
        alert('Paciente creado exitosamente');
      }
      onClose(true);
    } catch (error: any) {
      console.error('Error saving patient:', error);
      alert(error.response?.data?.message || 'Error al guardar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={patient ? 'Editar Paciente' : 'Nuevo Paciente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Teléfono"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
        />

        <Input
          label="Fecha de Nacimiento"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          error={errors.birthDate}
          required
        />

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
            {loading ? 'Guardando...' : patient ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientModal;
