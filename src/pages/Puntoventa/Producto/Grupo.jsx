// ButtonComponent.jsx
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../../authStore';
import { useGroupStore } from '../../authStore';
import { io } from 'socket.io-client';

// Styled Components
const ButtonContainer = styled.div`
  width: 100%; 
`;

const ButtonGroup = styled.div`
  background-color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem; 
`;

const StyledButton = styled.button`
  padding: 0.5rem 3rem;
  height: 40px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
  background-color: ${props => props.isSelected ? '#ef4444' : '#84cc16'};
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  user-select: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.isSelected ? '#dc2626' : '#65a30d'};
  } 
`;

// Indicador de carga
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  color: #6366F1;
  font-size: 14px;
`;

const ButtonComponent = ({ setid_grupo }) => {
  // Get authentication data
  const authData = useAuthStore((state) => state.authData);
  const empresaId = useMemo(() => authData[1], [authData]);
  
  // Referencias para socket y estado del componente
  const socketRef = useRef(null);
  const clientId = useRef(window.clientInstanceId || Math.random().toString(36).substring(2, 15));
  const componentMounted = useRef(true);
  
  // Get group data and actions from Zustand store
  const { 
    groups, 
    selectedGroupId,
    loading, 
    fetchGroups, 
    setSelectedGroup,
    reloadGroups
  } = useGroupStore();
  
  // Función para configurar listeners de Socket.IO
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current || !empresaId) return;
    
    // Primero remover listeners para evitar duplicados
    socketRef.current.off('grupo_actualizado');
    socketRef.current.off('debug_grupo_actualizado');
    
    // Listener para eventos normales
    socketRef.current.on('grupo_actualizado', (data) => {
      if (data && data.id_empresa && data.id_empresa.toString() === empresaId.toString()) {
        reloadGroups(empresaId);
      }
    });
    
    // También escuchar el evento de depuración
    socketRef.current.on('debug_grupo_actualizado', (data) => {
      if (data && data.id_empresa && data.id_empresa.toString() === empresaId.toString()) {
        reloadGroups(empresaId);
      }
    });
  }, [empresaId, reloadGroups]);
  
  // Configuración inicial y Socket.IO
  useEffect(() => {
    if (!empresaId) return;
    
    // Cargar datos iniciales
    fetchGroups(empresaId);
    
    // Inicializar Socket.IO
    if (!socketRef.current) {
      try {
        socketRef.current = io('http://localhost:3000', {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket']
        });
        
        // Registrar cliente
        socketRef.current.emit('register', clientId.current);
      } catch (err) {
        console.error('Error Socket.IO:', err);
      }
    }
    
    // Cleanup
    return () => {
      componentMounted.current = false;
      
      if (socketRef.current) {
        // Quitar todos los listeners
        socketRef.current.off('grupo_actualizado');
        socketRef.current.off('debug_grupo_actualizado');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
        
        // Si empresaId existe, abandonar la sala
        if (empresaId) {
          socketRef.current.emit('leave_room', `empresa_${empresaId}`);
        }
      }
    };
  }, [empresaId, fetchGroups]);
  
  // Eventos de conexión y sala
  useEffect(() => {
    if (!empresaId || !socketRef.current) return;
    
    // Evento connect
    socketRef.current.on('connect', () => {
      // Join room for empresa
      const empresaRoom = `empresa_${empresaId}`;
      socketRef.current.emit('join_room', empresaRoom);
      
      // Configurar listeners
      setupSocketListeners();
    });
    
    // Evento reconnect
    socketRef.current.on('reconnect', () => {
      // Reunirse a la sala al reconectar
      const empresaRoom = `empresa_${empresaId}`;
      socketRef.current.emit('join_room', empresaRoom);
      
      // Volver a configurar listeners
      setupSocketListeners();
    });
    
    // Configurar listeners inmediatamente si ya estamos conectados
    if (socketRef.current.connected) {
      setupSocketListeners();
    }
    
  }, [empresaId, setupSocketListeners]);
  
  // Manejo de clics en botones
  const handleButtonClick = useCallback((e, id) => {
    e.preventDefault();
    setSelectedGroup(id);
    setid_grupo(id);
  }, [setid_grupo, setSelectedGroup]);
  
  // Renderizado con estado de carga
  if (loading) {
    return <LoadingIndicator>Cargando grupos...</LoadingIndicator>;
  }
  
  // Renderizado normal
  return (
    <ButtonContainer>
      <ButtonGroup>
        {groups.map((button) => (
          <StyledButton
            key={button.id_grupo}
            isSelected={selectedGroupId === button.id_grupo}
            onClick={(e) => handleButtonClick(e, button.id_grupo)}
          >
            {button.Grupo}
          </StyledButton>
        ))}
      </ButtonGroup>
    </ButtonContainer>
  );
};

export default React.memo(ButtonComponent);