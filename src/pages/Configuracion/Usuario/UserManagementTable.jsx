import React, { useState } from 'react';
import styled from 'styled-components';
import { UserPlus, Check, X, Trash2, AlertTriangle } from 'lucide-react';
import { usuarioeliminar } from '../../../Api/Taskusuario';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: 'Inter', sans-serif;
  background-color: white;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #EEF2FF;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #4F46E5;
`;

const AddButton = styled.button`
  background-color: #6366F1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #4F46E5;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #EEF2FF;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #EEF2FF;
  border-bottom: 1px solid #E0E7FF;
`;

const TableHeadCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  color: #6366F1;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.tr`
  background-color: ${props => props.isAdmin ? '#EEF2FF' : 'white'};
  border-bottom: 1px solid #EEF2FF;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isAdmin ? '#E0E7FF' : '#F9FAFB'};
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  color: #374151;
  white-space: nowrap;
`;

const UserEmail = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  background-color: ${props => 
    props.status === 'active' ? '#DEF7EC' : '#FDE2E1'};
  color: ${props => 
    props.status === 'active' ? '#03543E' : '#981B1B'};
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  background-color: ${props => {
    if (props.role === 'Admin') return '#EEF2FF';
    if (props.role === 'Editor') return '#DBEAFE';
    return '#F3F4F6';
  }};
  color: ${props => {
    if (props.role === 'Admin') return '#6366F1';
    if (props.role === 'Editor') return '#1E40AF';
    return '#374151';
  }};
`;

const DeleteButton = styled.button`
  background-color: ${props => props.disabled ? '#F3F4F6' : '#FEE2E2'};
  color: ${props => props.disabled ? '#9CA3AF' : '#B91C1C'};
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  opacity: ${props => props.disabled ? '0.6' : '1'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#F3F4F6' : '#FCA5A5'};
  }
  
  &:active {
    background-color: ${props => props.disabled ? '#F3F4F6' : '#EF4444'};
    color: ${props => props.disabled ? '#9CA3AF' : 'white'};
    transform: ${props => props.disabled ? 'none' : 'scale(0.97)'};
  }
`;

// Componentes para el modal de confirmación
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: #6B7280;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  background-color: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #E5E7EB;
  }
`;

const ConfirmButton = styled.button`
  background-color: #EF4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #DC2626;
  }
`;

const UserManagementTable = ({ 
  AddButtonProps = {},
  users: initialUsers = [],
  caja,
  handleAddEvent,
  onDeleteUser,
  onUserDoubleClick // Nueva prop para manejar doble clic
}) => {
  // Estado interno para los usuarios que se muestran en la tabla
  const [tableUsers, setTableUsers] = useState(initialUsers);
  
  // Actualizamos nuestro estado interno si cambia la prop
  React.useEffect(() => {
    setTableUsers(initialUsers);
  }, [initialUsers]);
  
  // Estado para controlar el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userNameToDelete, setUserNameToDelete] = useState('');

  // Función para abrir el modal de confirmación
  const handleOpenDeleteModal = (e, userId, userName, userRole) => {
    e.stopPropagation(); // Prevenir que el evento llegue a la fila (evitar doble clic)
    
    // No permitir eliminación de usuarios ADMIN
    if (userRole === 'ADMIN') {
      console.log("No se puede eliminar un usuario ADMIN");
      return;
    }
    
    console.log("Abriendo modal para eliminar usuario:", userId, userName);
    setUserToDelete(userId);
    setUserNameToDelete(userName || 'seleccionado');
    setShowDeleteModal(true);
  };

  // Función para cerrar el modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setUserNameToDelete('');
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = async() => {
    if (userToDelete) {
      // Verificar que el usuario a eliminar no sea ADMIN
      const userToDeleteObj = tableUsers.find(user => user.id_usuario === userToDelete);
      if (userToDeleteObj && userToDeleteObj.Rol === 'ADMIN') {
        console.error("No se puede eliminar un usuario con rol ADMIN");
        handleCloseDeleteModal();
        return;
      }
      const response = await usuarioeliminar({id_usuario:userToDelete});
      if (response.data.data > 0) {
        // Eliminar el usuario de la tabla (actualización visual inmediata)
        setTableUsers(prevUsers => prevUsers.filter(user => user.id_usuario !== userToDelete));
        
        // Si existe la función onDeleteUser la ejecutamos para actualizar el backend/estado del padre
        if (typeof onDeleteUser === 'function') {
          onDeleteUser(userToDelete);
        } else {
          console.log(`Usuario con ID ${userToDelete} eliminado de la tabla (sin implementación de backend)`);
        }
        
        handleCloseDeleteModal();
      }
    }
  };

  // Manejador de doble clic en una fila de usuario
  const handleRowDoubleClick = (user) => {
    if (typeof onUserDoubleClick === 'function') {
      onUserDoubleClick(user);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Gestión de Usuarios</Title>
        <AddButton {...AddButtonProps}>
          <UserPlus size={16} />
          Añadir Usuario
        </AddButton>
      </Header>
      
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TableHeadCell>Usuario</TableHeadCell>
              <TableHeadCell>Estado</TableHeadCell>
              <TableHeadCell>Rol</TableHeadCell>
              <TableHeadCell>Nombre</TableHeadCell>
              <TableHeadCell>Último Login</TableHeadCell>
              <TableHeadCell>Acciones</TableHeadCell>
            </tr>
          </TableHead>
          <tbody>
            {tableUsers.map((user) => (
              <TableRow 
                key={user.id_usuario} 
                isAdmin={user.Rol === 'ADMIN'}
                onDoubleClick={() => handleRowDoubleClick(user)}
              >
                <TableCell>
                  <UserEmail>{user.usuario}</UserEmail>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.Rol}>
                    {user.Estado === 'ACTIVO' ? 
                      <Check size={14} style={{ marginRight: '4px' }} /> : 
                      <X size={14} style={{ marginRight: '4px' }} />
                    }
                    {user.Estado === 'ACTIVO' ? 'ACTIVO' : 'Inactivo'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.Rol}>
                    {user.Rol}
                  </RoleBadge>
                </TableCell>
                <TableCell>{user.Nombre}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  {user.Rol === 'ADMIN' ? (
                    <div title="Los usuarios administradores no pueden ser eliminados">
                      <DeleteButton 
                        disabled={true}
                      >
                        <Trash2 size={16} />
                      </DeleteButton>
                    </div>
                  ) : (
                    <DeleteButton 
                      onClick={(e) => handleOpenDeleteModal(e, user.id_usuario, user.Nombre, user.Rol)}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </DeleteButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <AlertTriangle size={24} color="#EF4444" />
              <ModalTitle>Confirmar eliminación</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userNameToDelete}</strong>?</p>
              <p>Esta acción no se puede deshacer.</p>
            </ModalBody>
            <ModalButtons>
              <CancelButton onClick={handleCloseDeleteModal}>
                Cancelar
              </CancelButton>
              <ConfirmButton onClick={handleConfirmDelete}>
                Eliminar
              </ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default UserManagementTable;