import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import UserManagementTable from './UserManagementTable';
import NewUserForm from './NewUserForm';
import { usuariomostrarporidempresa } from '../../../Api/Taskusuario';
import { useAuthStore } from '../../authStore';
import { cajamostrarporidempresa } from '../../../Api/TaskCajaYmovimiento';

// Contenedor principal
const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #f9fafb;
`;

// Panel izquierdo fijo
const LeftPanel = styled.div`
  width: 60%;
  padding: 24px;
  box-sizing: border-box;
`;

// Panel derecho fijo
const RightPanel = styled.div`
  width: 40%;
  padding: 24px;
  box-sizing: border-box;
  background-color: white;
  display: flex;
`;

// Contenedor para centrar el contenido en el panel derecho
const CenteredContent = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

// Placeholder para cuando no hay formulario activo
const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 450px;
  color: #6B7280;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
`;

const PlaceholderIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #E5E7EB;
`;

const PlaceholderTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const PlaceholderText = styled.p`
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
`;

// Componente principal de usuarios
const UsuarioPrincipal = () => {
  const authData = useAuthStore((state) => state.authData);
  const empresaId = useMemo(() => authData[1], [authData]);
  const [caja, setCaja] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para controlar si se muestra el formulario
  const [showForm, setShowForm] = useState(false);
  
  // Estado para almacenar el usuario que se está editando
  const [editingUser, setEditingUser] = useState(null);
  
  useEffect(() => {
    fetchUsuarios();
    fetchCajas();
  }, [empresaId]);

  const fetchUsuarios = async () => {
    try {
      const response = await usuariomostrarporidempresa({id_empresa: empresaId});
      setUsuarios(response.data.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const fetchCajas = async () => {
    try {
      const response = await cajamostrarporidempresa({id_empresa: empresaId});
      setCaja(response.data.data);
    } catch (error) {
      console.error("Error al cargar cajas:", error);
    }
  };

  // Manejador para añadir un nuevo usuario
  const handleAddUser = (newUser) => {
    // Agregar el nuevo usuario a la lista existente
    setUsuarios(prevUsuarios => [...prevUsuarios, newUser]);
    
    // Cerrar el formulario después de agregar
    setShowForm(false);
    setEditingUser(null);
  };
  
  // Manejador para actualizar un usuario existente
  const handleUpdateUser = (updatedUser) => {
    // Actualizar el usuario en la lista
    setUsuarios(prevUsuarios => 
      prevUsuarios.map(user => 
        user.id_usuario === updatedUser.id_usuario ? updatedUser : user
      )
    );
    
    // Cerrar el formulario después de actualizar
    setShowForm(false);
    setEditingUser(null);
  };

  // Manejador para eliminar un usuario
  const handleDeleteUser = (userId) => {
    // Actualizar el estado local después de eliminar
    setUsuarios(prevUsuarios => 
      prevUsuarios.filter(user => user.id_usuario !== userId)
    );
    
    // Si el usuario eliminado es el que se está editando, cerrar el formulario
    if (editingUser && editingUser.id_usuario === userId) {
      setShowForm(false);
      setEditingUser(null);
    }
  };

  // Función para mostrar el formulario de nuevo usuario
  const handleAddUserClick = () => {
    setEditingUser(null); // Asegurar que no estamos en modo edición
    setShowForm(true);
  };
  
  // Función para manejar el doble clic en un usuario
  const handleUserDoubleClick = (user) => {
    // Guardar el usuario seleccionado
    setEditingUser(user);
    // Mostrar el formulario
    setShowForm(true);
  };

  // Función para cerrar el formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <Container>
      <LeftPanel>
        <UserManagementTable 
          AddButtonProps={{ onClick: handleAddUserClick }}
          users={usuarios}
          caja={caja}
          onDeleteUser={handleDeleteUser}
          onUserDoubleClick={handleUserDoubleClick}
        />
      </LeftPanel>
      
      <RightPanel>
        <CenteredContent>
          {showForm ? (
            <NewUserForm 
              onClose={handleCloseForm} 
              id_empresa={empresaId} 
              caja={caja} 
              onAddEvent={handleAddUser}
              editUser={editingUser}
              onUpdateEvent={handleUpdateUser}
            />
          ) : (
            <PlaceholderContent>
              <PlaceholderIcon>👥</PlaceholderIcon>
              <PlaceholderTitle>Gestión de Usuarios</PlaceholderTitle>
              <PlaceholderText>
                Selecciona un usuario con doble clic para editarlo o haz clic en 
                "Añadir Usuario" para crear uno nuevo.
              </PlaceholderText>
            </PlaceholderContent>
          )}
        </CenteredContent>
      </RightPanel>
    </Container>
  );
};

export default UsuarioPrincipal;