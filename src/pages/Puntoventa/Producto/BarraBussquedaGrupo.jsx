import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { useAuthStore, useidmesa, useProductStore } from '../../authStore';
import { io } from 'socket.io-client';
import { ventainsertar } from '../../../Api/TaskventaYdetalle';

// ESTILOS
const Container = styled.div`
  width: 100%;
  background: white;
  padding: 0rem 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
  justify-content: center;
  font-family: Arial, sans-serif;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  font-family: Arial, sans-serif;
`;

const Title = styled.span`
  color: #6366F1;
  font-family: Arial, sans-serif;
  font-size: 1rem;
  font-weight: bold;
`;

const Divider = styled.span`
  color: #9CA3AF;
  margin: 0 8px;
  font-family: Arial, sans-serif;
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
  font-family: Arial, sans-serif;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 8px 8px 28px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #E5E7EB;
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #6366F1;
  font-family: Arial, sans-serif;
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  width: 100%;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-family: Arial, sans-serif;
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: black;
  font-family: Arial, sans-serif;
  &:hover {
    background: #EEF2FF;
    padding-left: 1.5rem;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-family: Arial, sans-serif;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #EEF2FF;
  color: #6366F1;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: Arial, sans-serif;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: Arial, sans-serif;
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  color: #6366F1;
  font-size: 14px;
  font-family: Arial, sans-serif;
`;

// COMPONENTE PRINCIPAL
const BarraBussquedaGrupo = ({onAddEvent}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { tableId } = useidmesa();
  const clientIdRef = useRef(window.clientInstanceId);
    const authData = useAuthStore((state) => state.authData);
    const authInfo = useMemo(() => ({
      userId: authData[0],
      empresaId: authData[1],
      mesero: authData[3]
    }), [authData]);
  // Estado para mostrar indicador de carga durante actualización
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Referencias para socket y estado del componente
  const socketRef = useRef(null);
  const clientId = useRef(window.clientInstanceId || Math.random().toString(36).substring(2, 15));
  const componentMounted = useRef(true);
  const pendingUpdateRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Flag para reconexiones
  const isReconnectingRef = useRef(false);
  
  // Zustand stores
  const { 
    products, 
    filteredProducts, 
    loading,
    initialized,
    initialize,
    fetchProducts, 
    filterProducts,
    reloadProducts
  } = useProductStore();
  
  const empresaId = useMemo(() => authData[1], [authData]);
  
  // Formatear precio con separador de miles
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  };

  // Función mejorada para actualizar productos con reintento - SOLO PARA EVENTOS
  const updateProductsWithRetry = useCallback((isManualUpdate = false) => {
    if (!empresaId) return;
    
    // Si NO es actualización manual y estamos en una recarga, NO actualizamos
    if (!isManualUpdate && document.visibilityState === 'hidden') {
      console.log('[Actualización] Omitiendo actualización automática en pestaña oculta');
      pendingUpdateRef.current = true;
      return;
    }
    
    console.log(`[Actualización] ${isManualUpdate ? 'Manual' : 'Por evento'} - Solicitando productos`);
    
    // Mostrar indicador de actualización
    setIsRefreshing(true);
    
    // Limpiar cualquier temporizador pendiente
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    // Llamar a reloadProducts con shouldSkipUpdate = false para forzar actualización
    reloadProducts(empresaId, false)
      .then((data) => {
        console.log('[Actualización] Productos actualizados correctamente:', data?.length || 0, 'productos');
        setLastUpdated(new Date());
      })
      .catch(error => {
        console.error('[Actualización] Error al actualizar productos:', error);
        
        // Reintento automático después de 3 segundos SOLO para actualizaciones manuales
        if (isManualUpdate) {
          console.log('[Actualización] Programando reintento en 3s...');
          updateTimeoutRef.current = setTimeout(() => {
            console.log('[Actualización] Reintentando actualización...');
            reloadProducts(empresaId, false);
          }, 3000);
        }
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [empresaId, reloadProducts]);

  // Función para configurar listeners de Socket.IO
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current || !empresaId) return;
    
    // Primero remover listeners para evitar duplicados
    socketRef.current.off('producto_actualizado');
    socketRef.current.off('debug_producto_actualizado');
    
    // Listener para eventos normales
    socketRef.current.on('producto_actualizado', (data) => {
      if (data && data.id_empresa && data.id_empresa.toString() === empresaId.toString()) {
        console.log('[Socket.IO] Producto actualizado recibido:', data);
        
        // Si la pestaña está oculta, marcar para actualizar cuando vuelva a ser visible
        if (document.visibilityState === 'hidden') {
          console.log('[Socket.IO] Pestaña oculta, marcando actualización como pendiente');
          pendingUpdateRef.current = true;
          return;
        }
        
        // Actualizar SOLO cuando recibamos un evento específico
        updateProductsWithRetry(false);
      }
    });
    
    // También escuchar el evento de depuración
    socketRef.current.on('debug_producto_actualizado', (data) => {
      console.log('[Socket.IO] Debug producto actualizado:', data);
      if (data && data.id_empresa && data.id_empresa.toString() === empresaId.toString()) {
        // Si la pestaña está oculta, marcar para actualizar cuando vuelva a ser visible
        if (document.visibilityState === 'hidden') {
          console.log('[Socket.IO] Debug - Pestaña oculta, marcando actualización como pendiente');
          pendingUpdateRef.current = true;
          return;
        }
        
        // Actualizar SOLO cuando recibamos un evento específico
        updateProductsWithRetry(false);
      }
    });
    
    // NO actualizar en reconexión, a menos que sea la primera conexión
    socketRef.current.on('reconnect', () => {
      console.log('[Socket.IO] Reconectado - Verificando si hay actualizaciones pendientes');
      
      // Solo actualizar si hay una actualización pendiente
      if (pendingUpdateRef.current) {
        console.log('[Socket.IO] Procesando actualización pendiente tras reconexión');
        updateProductsWithRetry(false);
        pendingUpdateRef.current = false;
      }
    });
    
  }, [empresaId, updateProductsWithRetry]);

  // Inicialización del componente
  useEffect(() => {
    if (!empresaId) return;
    
    // Inicializar el store
    initialize(empresaId);
    
    // Primera carga: usar caché si existe, solo cargar de API si no hay caché
    if (isFirstLoad) {
      setIsFirstLoad(false);
      
      // NUNCA forzar actualización, usar caché si existe
      fetchProducts(empresaId, false);
      
      console.log(`[Inicialización] Carga inicial - Usando caché si existe`);
    }
  }, [empresaId, initialize, fetchProducts, isFirstLoad]);
  
  // Configuración inicial de Socket.IO
  useEffect(() => {
    if (!empresaId) return;
    
    // Inicializar Socket.IO
    if (!socketRef.current) {
      try {
        console.log('[Socket.IO] Intentando conectar a http://localhost:3000');
        
        socketRef.current = io('http://localhost:3000', {
          reconnectionAttempts: 10,  // Aumentar intentos de reconexión
          reconnectionDelay: 1000,
          transports: ['websocket']
        });
        
        // Agregar eventos de depuración
        socketRef.current.on('connect_error', (err) => {
          console.error('[Socket.IO] Error de conexión:', err.message);
        });
        
        socketRef.current.on('disconnect', (reason) => {
          console.warn('[Socket.IO] Desconectado, razón:', reason);
          
          // Marcar reconexión
          isReconnectingRef.current = true;
          
          // Intento de reconexión manual 
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              console.log('[Socket.IO] Intentando reconexión manual...');
              socketRef.current.connect();
            }
          }, 2000);
        });
        
        // Registrar cliente
        socketRef.current.emit('register', clientId.current);
        console.log('[Socket.IO] Cliente registrado con ID:', clientId.current);
      } catch (err) {
        console.error('Error Socket.IO:', err);
      }
    }
    
    // Cleanup
    return () => {
      componentMounted.current = false;
      
      // Limpiar temporizadores
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Quitar todos los listeners
        socketRef.current.off('producto_actualizado');
        socketRef.current.off('debug_producto_actualizado');
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
  }, [empresaId]);
  
  // Eventos de conexión y sala
  useEffect(() => {
    if (!empresaId || !socketRef.current) return;
    
    // Evento connect
    socketRef.current.on('connect', () => {
      console.log('[Socket.IO] Conectado');
      // Join room for empresa
      const empresaRoom = `empresa_${empresaId}`;
      socketRef.current.emit('join_room', empresaRoom);
      console.log(`[Socket.IO] Unido a sala: ${empresaRoom}`);
      
      // Configurar listeners
      setupSocketListeners();
      
      // NO actualizar automáticamente en conexión inicial
      // Solo marcar como conectado
      isReconnectingRef.current = false;
    });
    
    // Configurar listeners inmediatamente si ya estamos conectados
    if (socketRef.current.connected) {
      setupSocketListeners();
    }
    
  }, [empresaId, setupSocketListeners]);

  // Detectar eventos de visibilidad para manejar pestañas/ventanas ocultas
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Visibilidad] Pestaña visible - socket listeners activos');
        
        // Importante: si hay actualizaciones pendientes, procesarlas ahora
        if (pendingUpdateRef.current && empresaId) {
          console.log('[Visibilidad] Procesando actualización pendiente al volver a pestaña visible');
          updateProductsWithRetry(false); // No es manual, pero procesar la actualización pendiente
          pendingUpdateRef.current = false;
        }
        
        if (socketRef.current && socketRef.current.connected) {
          setupSocketListeners();
        } else if (socketRef.current && !socketRef.current.connected) {
          // Intentar reconectar si está desconectado
          console.log('[Visibilidad] Socket desconectado, intentando reconectar...');
          socketRef.current.connect();
        }
      } else {
        console.log('[Visibilidad] Pestaña oculta - actualizaciones pausadas');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupSocketListeners, empresaId, updateProductsWithRetry]);

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    filterProducts(searchTerm);
  }, [searchTerm, filterProducts]);

  // NUEVO: Actualizar productos seleccionados cuando cambian los productos principales
  useEffect(() => {
    // Si hay productos seleccionados, actualizarlos con la información más reciente
    if (selectedProducts.length > 0 && products.length > 0) {
      // Crear nuevo array de productos seleccionados con datos actualizados
      const updatedSelectedProducts = selectedProducts.map(selected => {
        // Buscar el producto actualizado por id
        const updatedProduct = products.find(p => p.id_producto === selected.id_producto);
        // Si se encuentra, usar la versión actualizada, de lo contrario mantener la original
        return updatedProduct || selected;
      });
      
      // Verificar si hay cambios reales para evitar re-renders innecesarios
      const hasChanges = JSON.stringify(updatedSelectedProducts) !== JSON.stringify(selectedProducts);
      if (hasChanges) {
        console.log('[Actualización] Actualizando productos seleccionados con datos nuevos');
        setSelectedProducts(updatedSelectedProducts);
      }
    }
  }, [products, selectedProducts]);

  const handleSearch =async (e) => {
    setSearchTerm(e.target.value);
  };

  // Modificado para garantizar que el menú desaparezca después de seleccionar
  // Modified handleSelectProduct function without duplicate check
const handleSelectProduct = async(product) => {
  // Add product to selected products without checking for duplicates
  setSelectedProducts([...selectedProducts, product]);
  
  // Send the data
try {
  const data = {
    id_mesa: tableId,
    id_usuario: authInfo.userId,
    id_empresa: authInfo.empresaId,
    id_producto: product.id_producto,
    mesero: authInfo.mesero,
    Descripcion: product.Descripcion,
    venta: product.precio_de_venta,
    client_id: clientIdRef.current
  };
    const response = await ventainsertar(data);
    if (response?.data?.data) {
      const [id_detalle, id_venta, cant, estado, id_producto, descripcion, venta] = response.data.data;
      
      // Crear objeto de nueva orden
      const newOrder = {
        id_detalle: id_detalle,
        id_venta: id_venta,
        Cant: cant,
        Estado: estado,
        id_producto: id_producto,
        producto: descripcion,
        venta: venta,
        note: "",
        _timestamp: Date.now()
      };
      
      // OPTIMIZADO: Enviar sin retardos
      if (onAddEvent) {
        onAddEvent(newOrder);
      }
    }
  if (onAddEvent) {
    onAddEvent(newOrder);
  }
} catch (error) {
  
}
  
  // Clear the search term and refocus the input
  setTimeout(() => {
    setSearchTerm('');
    // Focus the input after clearing the search term
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, 0);
};

  const removeProduct = (productToRemove) => {
    setSelectedProducts(selectedProducts.filter(
      product => product.id_producto !== productToRemove.id_producto
    ));
  };

  // Renderizado con estado de carga
  if (loading && !products.length) {
    return <LoadingIndicator>Cargando productos...</LoadingIndicator>;
  }

  return (
    <Container>
      <HeaderWrapper>
        <SearchBar>
          <Title>GRUPOS</Title>
          <Divider>|</Divider>
          <SearchContainer>
            <SearchInputWrapper>
              <SearchIconWrapper>
                <Search size={16} />
              </SearchIconWrapper>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Buscar producto"
                ref={searchInputRef}
              />
            </SearchInputWrapper>

            {searchTerm && filteredProducts.length > 0 && (
              <SuggestionsContainer>
                {filteredProducts.map((product) => (
                  <SuggestionItem
                    key={product.id_producto}
                    onClick={() => handleSelectProduct(product)}
                  >
                    {product.Descripcion}<strong>{formatPrice(product.PrecioVenta || 0)}</strong>
                  </SuggestionItem>
                ))}
              </SuggestionsContainer>
            )}
          </SearchContainer>
        </SearchBar>
      </HeaderWrapper>
    </Container>
  );
};

// Exportamos sin React.memo para asegurar que siempre se actualice cuando cambien los props
export default BarraBussquedaGrupo;