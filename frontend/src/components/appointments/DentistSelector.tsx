import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { Staff } from '../../types/staff.types';
import Select from '../common/Select';

interface DentistSelectorProps {
  value: string | null;
  onChange: (dentistId: string | null) => void;
  className?: string;
}

const DentistSelector: React.FC<DentistSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [dentists, setDentists] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dentistsWithoutUser, setDentistsWithoutUser] = useState<number>(0);

  useEffect(() => {
    loadDentists();
  }, []);

  const loadDentists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getActive();
      
      // Filter for dentists - exclude assistants and hygienists
      const allDentists = data.filter(staff => {
        const specialty = staff.specialty.toLowerCase();
        return !specialty.includes('asistente') && 
               !specialty.includes('higienista') &&
               !specialty.includes('recepcion');
      });
      
      // Count dentists without userId
      const withoutUser = allDentists.filter(d => !d.userId || d.userId === '').length;
      setDentistsWithoutUser(withoutUser);
      
      // Only show dentists with userId (linked to a user account)
      const dentistList = allDentists.filter(staff => {
        const hasUserId = staff.userId !== null && staff.userId !== undefined && staff.userId !== '';
        return hasUserId;
      });
      
      setDentists(dentistList);
    } catch (err) {
      console.error('Error loading dentists:', err);
      setError('Error al cargar dentistas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? null : selectedValue);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Cargando dentistas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        {error}
        <button 
          onClick={loadDentists}
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select
        label="Dentista"
        value={value || ''}
        onChange={handleChange}
        className="min-w-[250px]"
      >
        <option value="">Todos los dentistas</option>
        {dentists.map((dentist) => (
          <option key={dentist.id} value={dentist.userId}>
            Dr. {dentist.firstName} {dentist.lastName} - {dentist.specialty}
          </option>
        ))}
      </Select>
      {dentistsWithoutUser > 0 && (
        <p className="mt-1 text-xs text-amber-600">
          ⚠️ {dentistsWithoutUser} dentista(s) sin cuenta de usuario no se muestran
        </p>
      )}
      {dentists.length === 0 && (
        <p className="mt-1 text-sm text-gray-500">
          No hay dentistas activos disponibles
        </p>
      )}
    </div>
  );
};

export default DentistSelector;
