import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user.types';
import { Staff } from '../../types/staff.types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: CreateUserDTO | UpdateUserDTO) => void;
  user?: User;
  staffList: Staff[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, staffList }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ASSISTANT',
    staffId: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        staffId: user.staffId || ''
      });
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'ASSISTANT',
        staffId: ''
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user) {
      // Modo edición - solo enviar firstName, lastName, role
      const updateData: UpdateUserDTO = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };
      onSave(updateData);
    } else {
      // Modo creación - enviar todos los campos
      const createData: CreateUserDTO = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        ...(formData.staffId && { staffId: formData.staffId })
      };
      onSave(createData);
    }
  };

  // Filtrar staff que no tienen usuario asignado o que es el staff actual del usuario
  const availableStaff = staffList.filter(staff => 
    !staff.userId || (user && staff.userId === user.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <form onSubmit={handleSubmit}>
        {!user && (
          <>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Mínimo 8 caracteres"
            />
          </>
        )}
        
        <Input
          label="Nombre"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        
        <Input
          label="Apellido"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        
        <Select
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        >
          <option value="ADMIN">Administrador</option>
          <option value="DENTIST">Dentista</option>
          <option value="ASSISTANT">Asistente</option>
        </Select>

        {!user && (
          <Select
            label="Vincular a Staff (opcional)"
            value={formData.staffId}
            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
          >
            <option value="">Sin vincular</option>
            {availableStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.firstName} {staff.lastName} - {staff.specialty}
              </option>
            ))}
          </Select>
        )}

        {user && user.email && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Email: <strong>{user.email}</strong></p>
            <p className="text-xs text-gray-500 mt-1">
              El email no se puede modificar. Use "Cambiar Contraseña" para actualizar la contraseña.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {user ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
