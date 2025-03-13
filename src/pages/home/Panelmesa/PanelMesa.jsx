import { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { mesamostrarporidsalon, mesaoEstadoocupado } from '../../../Api/Tasksalon';
import { useAuthStore, useidmesa } from '../../authStore';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Estilos con modificaciones para indicador sin animación
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem;
  background: white;
  width: 100%;
`;

const Item = styled.div`
  width: 5.5rem;
  height: 5.5rem;
  background: ${props => {
    switch (props.$estado) {
      case 'PENDIENTE':
        return 'linear-gradient(145deg, #A0A0A0 0%, #808080 100%)';
      case 'OCUPADO':
        return 'linear-gradient(145deg, #FF6B6B 0%, #FF4D4D 100%)';
      case 'LIBRE':
        return 'linear-gradient(145deg, #4CD964 0%, #40C057 100%)';
      case 'PREE CUENTA':
        return 'linear-gradient(145deg, #007AFF 0%, #0056B3 100%)';
      default:
        return 'linear-gradient(145deg, #A0A0A0 0%, #808080 100%)';
    }
  }};
  border-radius: ${props => props.$figura === 'green-circle' ? '50%' : '1.25rem'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  font-family: Arial, sans-serif;
  cursor: ${props => props.$loading ? 'wait' : 'pointer'};
  pointer-events: ${props => props.$loading ? 'none' : 'auto'};
  overflow: hidden;
  
  /* Sin transición ni efectos especiales para actualizaciones remotas */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Number = styled.span`
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  font-family: Arial, sans-serif;
  color: white;
  opacity: ${props => props.$loading ? 0.3 : 1};
  transition: opacity 0.2s ease;
  margin-bottom: 0.15rem;
`;

const WaiterName = styled.span`
  font-size: 0.8rem;
  font-weight: bold;
  font-family: Arial, sans-serif;
  color: white;
  opacity: ${props => props.$loading ? 0.3 : 1};
  transition: opacity 0.2s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$loading ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
`;

const CircleSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top-color: #FFD700;
  border-right-color: #FFD700;
  animation: spin 0.8s linear infinite;
  box-shadow: 
    0 0 10px #FFD700,
    0 0 20px rgba(255, 215, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.3);
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InnerCircle = styled.div`
  position: absolute;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: linear-gradient(145deg, #FFD700, #FFA500);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
`;

// Ocultar completamente el indicador de actualización para Socket.IO
const UpdateIndicator = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #00BFFF;
  opacity: ${props => props.$active ? 1 : 0};
  transition: ${props => props.$remote ? 'none' : 'opacity 0.3s ease'};
  box-shadow: 0 0 8px #00BFFF;
  animation: ${props => props.$active && !props.$remote ? 'pulse 1.5s infinite' : 'none'};
  display: ${props => props.$remote ? 'none' : 'block'};
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// Mensaje cuando no hay mesas
const EmptyState = styled.div`
  width: 100%;
  padding: 2rem;
  text-align: center;
  color: #666;
  font-family: Arial, sans-serif;
`;

// Caché global para persistir datos entre renderizados
const tablesBySalonCache = {};

// Exponer la caché global para que pueda ser limpiada desde Homepanel
if (typeof window !== 'undefined') {
  window.tablesBySalonCache = tablesBySalonCache;
}

// Datos de mesas de respaldo - Usados inmediatamente
const fallbackTables = [];

// Inicialización de Socket.IO diferida con worker
let socketInstance = null;
let socketInitializing = false;

// MEJORA: Inicialización de Socket.IO con Promise para mejor control
const initializeSocket = () => {
  // Only initialize once
  if (socketInstance || socketInitializing) return Promise.resolve();
  
  socketInitializing = true;
  
  return new Promise((resolve, reject) => {
    try {
      // Reemplazar con la URL de tu servidor Socket.IO
      socketInstance = io('http://localhost:3000', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      socketInstance.on('connect', () => {
        console.log('Socket.IO connected');
        socketInitializing = false;
        resolve();
      });
      
      // Handle connection errors
      socketInstance.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
        socketInitializing = false;
        reject(err);
      });
      
      // Register client ID
      socketInstance.emit('register', window.clientInstanceId || `client-${Date.now()}`);
      
      // Set timeout for initialization
      setTimeout(() => {
        if (socketInitializing) {
          socketInitializing = false;
          resolve(); // Resolve anyway to prevent blocking
        }
      }, 5000);
    } catch (error) {
      socketInitializing = false;
      reject(error);
    }
  });
};

// Backward compatibility with the old method
const initializeSocketAsync = () => {
  initializeSocket().catch(err => console.error('Failed to initialize Socket.IO:', err));
};

const Panelmesa = ({ id_salon, onViewChange, forceRefresh = false }) => {
  const navigate = useNavigate();
  const [loadingTable, setLoadingTable] = useState(null);
  const { setTableId } = useidmesa();
  const authData = useAuthStore((state) => state.authData);
  const [tables, setTables] = useState(tablesBySalonCache[id_salon] || fallbackTables); // Iniciar con datos disponibles
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [remoteUpdated, setRemoteUpdated] = useState({});
  const [isLoading, setIsLoading] = useState(!tablesBySalonCache[id_salon]); // Iniciar como false si hay datos en caché
  
  // Referencias
  const clientIdRef = useRef(window.clientInstanceId || `client-${Date.now()}`);
  const apiCallInProgress = useRef(false);
  const dataInitialized = useRef(Boolean(tablesBySalonCache[id_salon]));
  const forceRefreshProcessedRef = useRef(false);
  
  // Efecto para forzar la actualización cuando forceRefresh es true
  useEffect(() => {
    if (forceRefresh && !forceRefreshProcessedRef.current) {
      forceRefreshProcessedRef.current = true;
      
      // Borrar datos en caché para este salón específico
      delete tablesBySalonCache[id_salon];
      dataInitialized.current = false;
      
      // Forzar recarga desde la API
      if (!apiCallInProgress.current) {
        setIsLoading(true);
        apiCallInProgress.current = true;
        
        mesamostrarporidsalon({ id: id_salon })
          .then(response => {
            if (response?.data?.data?.length > 0) {
              tablesBySalonCache[id_salon] = response.data.data;
              setTables(response.data.data);
              dataInitialized.current = true;
            }
          })
          .catch(error => {
            console.error('Error al recargar mesas:', error);
          })
          .finally(() => {
            apiCallInProgress.current = false;
            setIsLoading(false);
          });
      }
    }
    
    // Cleanup para permitir futuros forceRefresh
    return () => {
      forceRefreshProcessedRef.current = false;
    };
  }, [forceRefresh, id_salon]);
  
  // MEJORA: Función para actualizar mesa localmente sin animaciones para actualizaciones remotas
  const updateTableLocally = useCallback((id_mesa, newState, mesero, isRemoteUpdate = false) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(table => 
        table.id_mesa === id_mesa 
          ? { 
              ...table, 
              Estado_de_disponibilidad: newState, 
              // Si el estado es LIBRE o el mesero es explícitamente una cadena vacía, borramos el mesero
              Mesero: (newState === "LIBRE" || mesero === '') ? '' : (mesero || table.Mesero)
            } 
          : table
      );
      
      // Synchronize with global cache
      if (tablesBySalonCache[id_salon]) {
        tablesBySalonCache[id_salon] = [...updatedTables];
      }
      
      return updatedTables;
    });
    
    // Solo mostrar indicador visual para actualizaciones locales, no para remotas
    if (!isRemoteUpdate) {
      setRecentlyUpdated(prev => ({ ...prev, [id_mesa]: true }));
      setTimeout(() => {
        setRecentlyUpdated(prev => ({ ...prev, [id_mesa]: false }));
      }, 1500);
    }
    // No se establece ningún estado visual para actualizaciones remotas
  }, [id_salon]);
  
  // Cargar datos sin bloquear la UI - OPTIMIZADO
  useEffect(() => {
    // Mostrar lo que hay en caché o fallbacks inmediatamente
    if (tablesBySalonCache[id_salon]) {
      setTables(tablesBySalonCache[id_salon]);
      dataInitialized.current = true;
      setIsLoading(false);
    } else {
      setTables(fallbackTables);
      setIsLoading(true);
    }
    
    // Iniciar Socket.IO en paralelo sin bloquear
    initializeSocketAsync();
    
    // Cargar datos reales en segundo plano solo si es necesario
    if (!dataInitialized.current && !apiCallInProgress.current) {
      apiCallInProgress.current = true;
      
      // Usar un setTimeout para darle prioridad al renderizado inicial
      setTimeout(async () => {
        try {
          const response = await mesamostrarporidsalon({ id: id_salon });
          
          if (response?.data?.data?.length > 0) {
            tablesBySalonCache[id_salon] = response.data.data;
            setTables(response.data.data);
            dataInitialized.current = true;
          }
        } catch (error) {
          console.error('Error al cargar mesas en segundo plano:', error);
        } finally {
          apiCallInProgress.current = false;
          setIsLoading(false);
        }
      }, 200); // Retrasar la carga para asegurar que la UI se muestre primero
    }
  }, [id_salon]);
  
  // MEJORA: Configuración de Socket.IO con mejor manejo de errores y reconexión
  useEffect(() => {
    if (!socketInstance) {
      // Try to initialize Socket.IO if not ready
      initializeSocket().catch(err => console.error('Failed to initialize Socket.IO:', err));
      return;
    }
    
    // Event handlers
    const handleUpdate = data => {
      if (data.id_navegador !== clientIdRef.current) {
        // Handle mesa_actualizar event (before update)
      }
    };
    
    const handleUpdated = data => {
      if (data.id_navegador !== clientIdRef.current) {
        updateTableLocally(data.id_mesa, data.estado, data.mesero, true);
      }
    };
    
    const handleError = data => {
      if (data.id_navegador !== clientIdRef.current) {
        console.error(`Error for table ${data.id_mesa}: ${data.error || 'Unknown error'}`);
        
        // Refresh data from server to ensure consistency
        if (!apiCallInProgress.current) {
          apiCallInProgress.current = true;
          mesamostrarporidsalon({ id: id_salon })
            .then(response => {
              if (response?.data?.data?.length > 0) {
                tablesBySalonCache[id_salon] = response.data.data;
                setTables(response.data.data);
              }
            })
            .catch(err => console.error('Error refreshing tables after error:', err))
            .finally(() => {
              apiCallInProgress.current = false;
            });
        }
      }
    };
    
    // Set up event listeners
    socketInstance.on('mesa_actualizar', handleUpdate);
    socketInstance.on('mesa_actualizada', handleUpdated);
    socketInstance.on('mesa_error', handleError);
    
    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      if (socketInstance && !socketInstance.connected) {
        console.warn('Socket.IO disconnected. Attempting to reconnect...');
        socketInstance.connect();
      }
    }, 10000);
    
    return () => {
      clearInterval(connectionCheck);
      if (socketInstance) {
        socketInstance.off('mesa_actualizar', handleUpdate);
        socketInstance.off('mesa_actualizada', handleUpdated);
        socketInstance.off('mesa_error', handleError);
      }
    };
  }, [updateTableLocally, clientIdRef, tables, id_salon]);
  
  // MEJORA: Manejar clic en mesa con mejor manejo de errores y estado
  const handleClick = useCallback((mesa) => {
    if (loadingTable !== null) return;
    
    // Store original state for potential rollback
    const originalState = mesa.Estado_de_disponibilidad;
    const originalMesero = mesa.Mesero;
    
    // Set loading state
    setLoadingTable(mesa.id_mesa);
    
    // 1. NAVEGACIÓN INMEDIATA - Ejecutamos esto primero para que la transición sea instantánea
    onViewChange('Cafetería', 'mesa-seleccionada');
    
    // 2. Actualizaciones de estado en segundo plano
    setTimeout(() => {
      // Guardar ID de mesa
      setTableId(mesa.id_mesa);
      
      // Optimistic update for better UX
      if (originalState === "LIBRE") {
        updateTableLocally(mesa.id_mesa, "PENDIENTE", authData[3], false);
      }
      
      // Llamar a la API solo si es necesario
      if (originalState === "LIBRE") {
        mesaoEstadoocupado({
          id_mesa: mesa.id_mesa,
          estado: originalState,
          mesero: authData[3],
          id_navegador: clientIdRef.current
        })
        .catch(error => {
          console.error(`Error updating table ${mesa.id_mesa}:`, error);
          
          // Rollback the optimistic update on error
          updateTableLocally(mesa.id_mesa, originalState, originalMesero, false);
        })
        .finally(() => {
          // Always clear loading state
          setLoadingTable(null);
        });
      } else {
        // If no API call needed, just clear loading state
        setLoadingTable(null);
      }
    }, 50);
  }, [loadingTable, setTableId, updateTableLocally, authData, onViewChange, clientIdRef]);
  
  // Truncar nombre
  const truncateName = (name, maxLength = 10) => {
    if (!name) return "";
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // Solo mostrar mensaje de carga si no hay datos en absoluto
  if (isLoading && (!tables || tables.length === 0)) {
    return (
      <Container>
        <EmptyState>Cargando mesas...</EmptyState>
      </Container>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <Container>
        <EmptyState>No hay mesas disponibles en este salón.</EmptyState>
      </Container>
    );
  }

  // Renderizar todo inmediatamente
  return (
    <Container>
      {tables.map((table, index) => {
        const hasWaiter = Boolean(table.Mesero);
        // Eliminamos la variable isRemoteUpdated ya que no queremos mostrar actualizaciones remotas
        
        return (
          <Item
            key={table.id_mesa || index}
            $estado={table.Estado_de_disponibilidad}
            $figura={table.figura}
            $loading={loadingTable === table.id_mesa}
            onClick={() => handleClick(table)}
          >
            <Number $loading={loadingTable === table.id_mesa}>
              {table.mesa}
            </Number>
            
            {hasWaiter && (
              <WaiterName $loading={loadingTable === table.id_mesa}>
                {truncateName(table.Mesero)}
              </WaiterName>
            )}
            
            <UpdateIndicator 
              $active={recentlyUpdated[table.id_mesa]} 
              $remote={false}
            />
            
            <LoadingOverlay $loading={loadingTable === table.id_mesa}>
              <CircleSpinner />
              <InnerCircle />
            </LoadingOverlay>
          </Item>
        );
      })}
    </Container>
  );
};

export default Panelmesa;