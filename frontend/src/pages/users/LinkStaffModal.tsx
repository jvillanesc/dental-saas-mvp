import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { Staff } from '../../types/staff.types';

interface LinkStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (staffId: string) => void;
  staffList: Staff[];
  userName: string;
}

const LinkStaffModal: React.FC<LinkStaffModalProps> = ({ 
  isOpen, 
  onClose, 
  onLink, 
  staffList,
  userName 
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaffId) {
      onLink(selectedStaffId);
      setSelectedStaffId('');
    }
  };

  const handleClose = () => {
    setSelectedStaffId('');
    onClose();
  };

  // Filtrar staff que no tiene usuario asignado
  const availableStaff = staffList.filter(staff => !staff.userId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vincular a Staff">
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            Vincular usuario: <strong>{userName}</strong>
          </p>
        </div>

        {availableStaff.length === 0 ? (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            No hay personal disponible para vincular. Todo el staff ya tiene un usuario asignado.
          </div>
        ) : (
          <Select
            label="Seleccionar Personal"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            required
          >
            <option value="">Seleccione...</option>
            {availableStaff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.firstName} {staff.lastName} - {staff.specialty}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={!selectedStaffId || availableStaff.length === 0}
          >
            Vincular
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LinkStaffModal;
