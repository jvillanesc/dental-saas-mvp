import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { staffService } from '../../services/staffService';
import { Staff, CreateStaffDTO, SPECIALTIES } from '../../types/staff.types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  staff: Staff | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, staff }) => {
  const [loading, setLoading] = useState(false);
  const [createUser, setCreateUser] = useState(false);
  const [formData, setFormData] = useState<CreateStaffDTO>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialty: 'GENERAL',
    licenseNumber: '',
    hireDate: '',
    active: true,
    createUser: false,
    userEmail: '',
    userPassword: '',
    userRole: 'DENTIST',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateStaffDTO, string>>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        email: staff.email,
        specialty: staff.specialty,
        licenseNumber: staff.licenseNumber,
        hireDate: staff.hireDate,
        active: staff.active,
      });
      setCreateUser(false);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        specialty: 'GENERAL',
        licenseNumber: '',
        hireDate: new Date().toISOString().split('T')[0],
        active: true,
        createUser: false,
        userEmail: '',
        userPassword: '',
        userRole: 'DENTIST',
      });
      setCreateUser(false);
    }
    setErrors({});
  }, [staff, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name as keyof CreateStaffDTO]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setCreateUser(checked);
    setFormData((prev) => ({
      ...prev,
      createUser: checked,
      userEmail: checked ? prev.email : '',
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateStaffDTO, string>> = {};

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
    if (!formData.specialty) {
      newErrors.specialty = 'La especialidad es requerida';
    }
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'El número de licencia es requerido';
    }
    if (!formData.hireDate) {
      newErrors.hireDate = 'La fecha de contratación es requerida';
    }

    if (createUser && !staff) {
      if (!formData.userEmail?.trim()) {
        newErrors.userEmail = 'El email del usuario es requerido';
      }
      if (!formData.userPassword?.trim()) {
        newErrors.userPassword = 'La contraseña es requerida';
      } else if (formData.userPassword.length < 6) {
        newErrors.userPassword = 'La contraseña debe tener al menos 6 caracteres';
      }
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
      if (staff) {
        // Update: no incluir campos de usuario
        const { createUser, userEmail, userPassword, userRole, ...updateData } = formData;
        await staffService.update(staff.id, updateData);
        alert('Personal actualizado exitosamente');
      } else {
        await staffService.create(formData);
        alert('Personal creado exitosamente');
      }
      onClose(true);
    } catch (error: any) {
      console.error('Error saving staff:', error);
      alert(error.response?.data?.message || 'Error al guardar personal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={staff ? 'Editar Personal' : 'Nuevo Personal'}
      size="lg"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Especialidad"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
            error={errors.specialty}
            required
          />
          <Input
            label="Número de Licencia"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Contratación"
            name="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={handleChange}
            error={errors.hireDate}
            required
          />
          <div className="flex items-center pt-7">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Activo
            </label>
          </div>
        </div>

        {!staff && (
          <>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="createUser"
                  checked={createUser}
                  onChange={handleCreateUserChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="createUser" className="ml-2 block text-sm font-medium text-gray-900">
                  Crear usuario de sistema
                </label>
              </div>

              {createUser && (
                <div className="space-y-4 bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email de usuario"
                      name="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={handleChange}
                      error={errors.userEmail}
                      required
                    />
                    <Input
                      label="Contraseña"
                      name="userPassword"
                      type="password"
                      value={formData.userPassword}
                      onChange={handleChange}
                      error={errors.userPassword}
                      required
                    />
                  </div>
                  <Select
                    label="Rol"
                    name="userRole"
                    value={formData.userRole || 'DENTIST'}
                    onChange={handleChange}
                    options={[
                      { value: 'ADMIN', label: 'Administrador' },
                      { value: 'DENTIST', label: 'Dentista' },
                      { value: 'RECEPTIONIST', label: 'Recepcionista' },
                    ]}
                  />
                </div>
              )}
            </div>
          </>
        )}

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
            {loading ? 'Guardando...' : staff ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;
