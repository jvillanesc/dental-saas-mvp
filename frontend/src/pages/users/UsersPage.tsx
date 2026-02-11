import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import UserModal from './UserModal';
import PasswordModal from './PasswordModal';
import LinkStaffModal from './LinkStaffModal';
import { userService } from '../../services/userService';
import { staffService } from '../../services/staffService';
import { User, CreateUserDTO, UpdateUserDTO, ChangePasswordDTO, USER_ROLES } from '../../types/user.types';
import { Staff } from '../../types/staff.types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLinkStaffModalOpen, setIsLinkStaffModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    loadUsers();
    loadStaff();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await staffService.getAll();
      setStaffList(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.staffName && user.staffName.toLowerCase().includes(searchLower))
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status === 'active') {
      filtered = filtered.filter(user => user.active);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(user => !user.active);
    }

    setFilteredUsers(filtered);
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleLinkStaff = (user: User) => {
    setSelectedUser(user);
    setIsLinkStaffModalOpen(true);
  };

  const handleSave = async (userData: CreateUserDTO | UpdateUserDTO) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, userData as UpdateUserDTO);
      } else {
        await userService.create(userData as CreateUserDTO);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar usuario';
      alert(errorMessage);
    }
  };

  const handleSavePassword = async (data: ChangePasswordDTO) => {
    if (!selectedUser) return;
    
    try {
      await userService.changePassword(selectedUser.id, data);
      setIsPasswordModalOpen(false);
      alert('Contraseña actualizada correctamente');
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      alert(errorMessage);
    }
  };

  const handleLinkStaffSubmit = async (staffId: string) => {
    if (!selectedUser) return;
    
    try {
      await userService.linkStaff(selectedUser.id, staffId);
      setIsLinkStaffModalOpen(false);
      loadUsers();
      loadStaff();
    } catch (error: any) {
      console.error('Error linking staff:', error);
      const errorMessage = error.response?.data?.message || 'Error al vincular personal';
      alert(errorMessage);
    }
  };

  const handleUnlinkStaff = async (user: User) => {
    if (!confirm(`¿Desvincular a ${user.firstName} ${user.lastName} del personal?`)) return;
    
    try {
      await userService.unlinkStaff(user.id);
      loadUsers();
      loadStaff();
    } catch (error) {
      console.error('Error unlinking staff:', error);
      alert('Error al desvincular personal');
    }
  };

  const handleToggleActive = async (user: User) => {
    const action = user.active ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${action} a ${user.firstName} ${user.lastName}?`)) return;
    
    try {
      if (user.active) {
        await userService.deactivate(user.id);
      } else {
        await userService.activate(user.id);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(`Error al ${action} usuario`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <Button variant="primary" onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Nombre, email o personal..."
          />
          <Select
            label="Rol"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="DENTIST">Dentista</option>
            <option value="ASSISTANT">Asistente</option>
          </Select>
          <Select
            label="Estado"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron usuarios</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personal Vinculado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${USER_ROLES[user.role as keyof typeof USER_ROLES]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {USER_ROLES[user.role as keyof typeof USER_ROLES]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.staffName ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{user.staffName}</span>
                          <button
                            onClick={() => handleUnlinkStaff(user)}
                            className="text-xs text-red-600 hover:text-red-800"
                            title="Desvincular"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLinkStaff(user)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Vincular
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Cambiar Contraseña"
                        >
                          Contraseña
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                          title={user.active ? 'Desactivar' : 'Activar'}
                        >
                          {user.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        staffList={staffList}
      />

      {selectedUser && (
        <>
          <PasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSave={handleSavePassword}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          />
          <LinkStaffModal
            isOpen={isLinkStaffModalOpen}
            onClose={() => setIsLinkStaffModalOpen(false)}
            onLink={handleLinkStaffSubmit}
            staffList={staffList}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          />
        </>
      )}
    </div>
  );
};

export default UsersPage;
