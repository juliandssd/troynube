import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Trash2, Edit, X, RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { useidmesa } from '../authStore';
import { detalleeditarnota, detalleeliminar, detallemostrar } from '../../Api/TaskventaYdetalle';
import { io } from 'socket.io-client';

// Styled Components completos
const Container = styled.div`
  width: 100%;
  height: 400px;
  background: #fff;
  position: relative;
  font-family: Arial, sans-serif;
`;

const ScrollArea = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #6366F1;
    border-radius: 3px;
  }
`;

const OrderCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: white;
  border: 1px solid ${props => props.$isSelected ? '#6366F1' : '#eee'};
  position: relative;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  }

  ${props => props.$isSelected && `
    background: #F5F6FF;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
  `}
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$isDelete ? '#FEE2E2' : '#EEF2FF'};
  color: ${props => props.$isDelete ? '#EF4444' : '#6366F1'};

  &:hover {
    background: ${props => props.$isDelete ? '#FEE2E2' : '#E0E7FF'};
    transform: scale(1.05);
  }
`;

const Details = styled.div`
  flex: 1;
  margin: 0 16px;
  min-width: 0;
`;

const Status = styled.div`
  color: #6366F1;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const Title = styled.div`
  color: #1F2937;
  font-size: 15px;
  font-weight: 500;
  margin: 2px 0;
`;

const Note = styled.div`
  color: #6B7280;
  font-size: 13px;
`;

const Quantity = styled.div`
  color: #6366F1;
  font-size: 20px;
  font-weight: 600;
  background: #EEF2FF;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 0 20px;
`;

const Price = styled.div`
  color: #6366F1;
  font-family: Arial, sans-serif;
  font-size: 15px;
  font-weight: 600;
  width: 100px;
  text-align: right;
  padding-right: 8px;
`;

const Editor = styled.div`
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-50%);
  width: 350px;
  background: white;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E5E7EB;
`;

const EditorTitle = styled.h3`
  margin: 0;
  color: #6366F1;
  font-size: 16px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: scale(1.05);
  }
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin: 8px 0 16px 0;
  resize: none;
  font-size: 14px;
  outline: none;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  overflow-y: auto;

  &:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #A1A1AA;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #6366F1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #4F46E5;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6B7280;
  padding: 20px;
  text-align: center;
  
  button {
    margin-top: 10px;
    padding: 6px 12px;
    background: #6366F1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
      background: #4F46E5;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #EF4444;
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80%;
  
  button {
    margin-top: 10px;
    padding: 6px 12px;
    background: #EF4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    
    &:hover {
      background: #DC2626;
    }
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: scale(1.05);
  }
`;

const DebugInfo = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 10px;
  max-width: 200px;
  overflow: hidden;
  z-index: 100;
  display: ${props => props.$visible ? 'block' : 'none'};
  
  button {
    background: #6366F1;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 3px 6px;
    margin-top: 5px;
    font-size: 9px;
    cursor: pointer;
    margin-right: 5px;
    
    &:hover {
      background: #4F46E5;
    }
  }
`;

// New styled components for confirmation dialog
const ConfirmationDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ConfirmationBox = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 350px;
  padding: 20px;
  text-align: center;
`;

const ConfirmationTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #EF4444;
  font-size: 16px;
  font-weight: 600;
`;

const ConfirmationMessage = styled.p`
  margin: 0 0 20px 0;
  color: #4B5563;
  font-size: 14px;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #DC2626;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: #F3F4F6;
  color: #4B5563;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #E5E7EB;
  }
`;

// New styled component for delete reason textarea
const DeleteReasonTextarea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin: 8px 0 16px 0;
  resize: none;
  font-size: 14px;
  outline: none;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  overflow-y: auto;

  &:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #A1A1AA;
  }
`;

// MODIFICADO: Eliminamos el registro global de IDs procesados para permitir duplicados
// Antes lo inicializábamos si no existía, ahora lo limpiamos completamente
window.processedOrderIds = new Set();
try {
  localStorage.removeItem('processedOrderIds');
} catch (e) {
}

// Caché simple para resultados de API
window.apiCache = window.apiCache || {
  data: {},
  timestamp: {},
  get: function(key) {
    // Verificar si existe y no ha expirado (5 minutos)
    if (this.data[key] && (Date.now() - this.timestamp[key] < 300000)) {
      return this.data[key];
    }
    return null;
  },
  set: function(key, data) {
    this.data[key] = data;
    this.timestamp[key] = Date.now();
    
    // También guardar en localStorage para persistencia
    try {
      localStorage.setItem(`apiCache_${key}`, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (e) {}
  },
  invalidate: function(key) {
    delete this.data[key];
    delete this.timestamp[key];
    try {
      localStorage.removeItem(`apiCache_${key}`);
    } catch (e) {}
  },
  // Método para cargar desde localStorage
  loadFromStorage: function(key) {
    try {
      const storedData = localStorage.getItem(`apiCache_${key}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Verificar que no haya expirado
        if (Date.now() - parsed.timestamp < 300000) { // 5 minutos
          this.data[key] = parsed.data;
          this.timestamp[key] = parsed.timestamp;
          return parsed.data;
        } else {
          // Si expiró, eliminar del localStorage
          localStorage.removeItem(`apiCache_${key}`);
        }
      }
    } catch (e) {}
    return null;
  }
};

// Asegurar que tenemos un ID de cliente
if (!window.clientInstanceId) {
  // Intentar recuperar ID de cliente desde localStorage
  const storedClientId = localStorage.getItem('clientInstanceId');
  if (storedClientId) {
    window.clientInstanceId = storedClientId;
  } else {
    window.clientInstanceId = Math.random().toString(36).substring(2, 15);
    // Guardar en localStorage para persistencia entre recargas
    localStorage.setItem('clientInstanceId', window.clientInstanceId);
  }
}

// Limpieza de caché por si está corrupta
const clearCacheForTable = (tableId) => {
  try {
    window.apiCache.invalidate(`orders_${tableId}`);
    localStorage.removeItem(`apiCache_orders_${tableId}`);
    
    // Limpiar también rastreo de duplicados
    localStorage.removeItem('processedOrderIds');
    window.processedOrderIds = new Set();
    
    return true;
  } catch (e) {
    return false;
  }
};

// OrderItem Component optimizado con confirmación para eliminar y campo de motivo
const OrderItem = React.memo(({ 
  order, 
  onDelete, 
  onEdit, 
  onSaveNote, 
  isEditing, 
  externalQuantity,
  isSelected,
  onSelect 
}) => {
  const clientIdRef = useRef(window.clientInstanceId);
  const textareaRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const { tableId } = useidmesa();
  
  // Verificar si el ítem está en estado EN ESPERA
  const isWaiting = order.Estado === 'EN ESPERA';

  // Memoizar los cálculos
  const { displayQuantity, total } = useMemo(() => {
    const qty = typeof externalQuantity !== 'undefined' ? externalQuantity : order.Cant;
    const price = parseFloat(order.venta) || 0;
    const quantity = parseInt(qty) || 0;
    return {
      displayQuantity: qty,
      total: price * quantity
    };
  }, [externalQuantity, order.Cant, order.venta]);

  // Handlers optimizados
  const handleSave = useCallback(() => {
    if (textareaRef.current) {
      onSaveNote(order.id_detalle, textareaRef.current.value);
    }
  }, [order.id_detalle, onSaveNote]);

  const handleDeleteClick = useCallback(async(e) => {
    e.stopPropagation();
    
    // Check if order status is "EN ESPERA" - if so, delete directly
    if (isWaiting) {
      const id = await btndetalleproductoeliminar(order.id_detalle, order.id_venta, order.Estado);
      if (id === 1) {
        onDelete(order.id_detalle);
      }
    } else {
      // For other statuses, show confirmation dialog with reason field
      setShowConfirmation(true);
      setDeleteReason(''); // Reset reason when opening dialog
    }
  }, [order.id_detalle, order.id_venta, order.Estado, isWaiting, onDelete]);

  const handleConfirmDelete = useCallback(async() => {
    // Check if reason is provided when status is not "EN ESPERA"
    if (!isWaiting && !deleteReason.trim()) {
      // Don't proceed if no reason is provided
      return;
    }
    
    const id = await btndetalleproductoeliminar(
      order.id_detalle,
      order.id_venta,
      order.Estado,
      deleteReason // Pass the reason to the delete function
    );
    
    if (id === 1) {
      setShowConfirmation(false);
      onDelete(order.id_detalle, deleteReason); // Pass reason to parent handler
    }
  }, [order.id_detalle, order.id_venta, order.Estado, isWaiting, deleteReason, onDelete]);

  const btndetalleproductoeliminar = async(id_detalle, id_venta, estado, motivo = '') => {
    try {
      const response = await detalleeliminar({
        id: id_detalle, 
        id_navegador: clientIdRef.current,
        id_venta: id_venta,
        estado: estado,
        id_mesa: tableId,
        motivo: motivo // Add reason parameter to API call
      });
      return response.data.data;
    } catch (error) {
      return 0;
    }
  }

  const handleCancelDelete = useCallback(() => {
    setShowConfirmation(false);
    setDeleteReason('');
  }, []);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    // Silenciosamente ignorar si no está EN ESPERA
    if (isWaiting) {
      onEdit(order.id_detalle);
    }
    // No hacer nada si está ENVIADO
  }, [order.id_detalle, isWaiting, onEdit]);

  const handleClick = useCallback((e) => {
    // Prevent click propagation when clicking buttons
    if (e.target.closest('.action-buttons')) {
      return;
    }
    
    // Silenciosamente ignorar si no está EN ESPERA
    if (isWaiting) {
      onSelect(order.id_detalle);
    }
    // No hacer nada si está ENVIADO
  }, [order.id_detalle, isWaiting, onSelect]);

  // Handle reason change
  const handleReasonChange = useCallback((e) => {
    setDeleteReason(e.target.value);
  }, []);

  return (
    <>
      <OrderCard 
        $isSelected={isSelected} 
        onClick={handleClick}
      >
        <Actions className="action-buttons">
          <ActionButton 
            $isDelete 
            onClick={handleDeleteClick}
            type="button"
          >
            <Trash2 size={18} />
          </ActionButton>
          {/* Changed condition: only show edit button for "EN ESPERA" status */}
          {isWaiting && (
            <ActionButton 
              onClick={handleEdit}
              type="button"
            >
              <Edit size={18} />
            </ActionButton>
          )}
        </Actions>

        <Details>
          <Status>{order.Estado}</Status>
          <Title>{order.producto}</Title>
          {order.note && <Note>Nota: {order.note}</Note>}
        </Details>

        <Quantity>{displayQuantity}</Quantity>
        <Price>${total.toLocaleString()}</Price>

        {isEditing && (
          <Editor>
            <EditorHeader>
              <EditorTitle>Editar Nota</EditorTitle>
              <CloseButton onClick={() => onEdit(null)} type="button">
                <X size={16} />
              </CloseButton>
            </EditorHeader>
            <EditorTextarea
              ref={textareaRef}
              defaultValue={order.note}
              placeholder="Agregar nota..."
              autoFocus
              maxLength={200}
            />
            <SaveButton onClick={handleSave} type="button">
              Guardar
            </SaveButton>
          </Editor>
        )}
      </OrderCard>

      {/* Confirmation Dialog with Reason Field */}
      {showConfirmation && (
        <ConfirmationDialog>
          <ConfirmationBox>
            <ConfirmationTitle>¿Eliminar orden?</ConfirmationTitle>
            <ConfirmationMessage>
              Esta orden ya ha sido ENVIADA. ¿Está seguro que desea eliminarla?
            </ConfirmationMessage>
            
            {/* Add reason textarea for ENVIADO items */}
            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label style={{ 
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '5px',
                color: '#4B5563'
              }}>
                Motivo de eliminación: *
              </label>
              <DeleteReasonTextarea
                value={deleteReason}
                onChange={handleReasonChange}
                placeholder="Por favor, ingrese el motivo por el cual está eliminando este producto..."
                autoFocus
                maxLength={200}
                required
              />
            </div>

            <ConfirmationButtons>
              <CancelButton onClick={handleCancelDelete}>
                Cancelar
              </CancelButton>
              <ConfirmButton 
                onClick={handleConfirmDelete}
                disabled={!isWaiting && !deleteReason.trim()}
                style={{ 
                  opacity: (!isWaiting && !deleteReason.trim()) ? 0.5 : 1,
                  cursor: (!isWaiting && !deleteReason.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                Eliminar
              </ConfirmButton>
            </ConfirmationButtons>
          </ConfirmationBox>
        </ConfirmationDialog>
      )}
    </>
  );
});

OrderItem.displayName = 'OrderItem';

// OrderList Component con corrección de duplicados y soporte para razón de eliminación
const OrderList = ({ 
  quantities = {}, 
  onOrderSelect, 
  selectedOrderId, 
  onOrdersChange,
  newOrder,
  orders: externalOrders,
  manualOrderUpdate,
  onAddEvent,
  updateOrdersManually
}) => {
  const { tableId } = useidmesa();
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false); // Para modo debug
  const [debugInfo, setDebugInfo] = useState({});
  const hasInitiallyLoaded = useRef(false);
  const socketRef = useRef(null); // Changed from pusherRef to socketRef
  const clientId = useRef(window.clientInstanceId || Math.random().toString(36).substring(2, 15));
  const isPageReload = useRef(true);
  const deletedItemsRef = useRef(new Set()); // Para almacenar IDs de elementos eliminados
  const locallyModifiedRef = useRef(new Set()); // Para almacenar IDs de elementos modificados localmente
  
  // Ya NO usamos un registro de órdenes procesadas
  const processedOrders = useRef(new Set());
  
  // Agregamos un registro de IDs recientes para prevenir duplicados inmediatos
  const recentlyAddedItems = useRef(new Map());

  // Function to notify about order updates
  const notifyOrdersUpdated = useCallback((updatedOrders) => {
    // Dispatch a general update event
    const updateEvent = new CustomEvent('ordersUpdated', {
      detail: {
        orders: updatedOrders,
        tableId
      }
    });
    window.dispatchEvent(updateEvent);
    
    // Update cache
    if (tableId) {
      window.apiCache.set(`orders_${tableId}`, updatedOrders);
    }
    
    // Notify parent component if needed
    if (onOrdersChange) {
      onOrdersChange(updatedOrders);
    }
  }, [tableId, onOrdersChange]);
  
  // Función auxiliar para cargar datos frescos de la API
  const fetchFreshData = useCallback(async (skipCache = false) => {
    if (!tableId) {
      setError('Error: No hay mesa seleccionada');
      return;
    }
    
    try {
      setError(null);
      
      // Si se solicita saltar la caché, limpiarla primero
      if (skipCache) {
        clearCacheForTable(tableId);
      }
      
      const response = await detallemostrar({ id_mesa: tableId });
      
      // Validación más estricta de la respuesta
      if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data.data)) {
          const responseData = response.data.data;
          
          // Filtrar elementos eliminados
          const filteredData = responseData.filter(item => 
            !deletedItemsRef.current.has(item.id_detalle?.toString())
          );
          
          // Ya NO registramos las órdenes como procesadas para evitar duplicados
          
          // Verificar que no sea un array vacío
          if (filteredData.length > 0) {
            // IMPORTANTE: Ordenar los datos para que los más nuevos estén primero
            // Asumiendo que IDs más altos son más recientes
            const sortedData = [...filteredData].sort((a, b) => 
              parseInt(b.id_detalle) - parseInt(a.id_detalle)
            );
            
            // Guardar en caché solo si hay datos
            window.apiCache.set(`orders_${tableId}`, sortedData);
            
            setOrders(sortedData);

            // Notify about orders update
            notifyOrdersUpdated(sortedData);
            
            // Si hay un item seleccionado pero no está EN ESPERA, deseleccionarlo
            if (selectedOrderId) {
              const selectedOrder = sortedData.find(order => order.id_detalle === selectedOrderId);
              if (selectedOrder && selectedOrder.Estado !== 'EN ESPERA') {
                onOrderSelect(null);
              }
            }
          } else {
            setOrders([]);
            
            // Notify about empty orders
            notifyOrdersUpdated([]);
          }
        } else {
          setError('Error: Formato de respuesta inválido');
          
          // Intentar recuperar de localStorage como último recurso
          const cachedData = window.apiCache.loadFromStorage(`orders_${tableId}`);
          if (cachedData && cachedData.length > 0) {
            // Filtrar elementos eliminados
            const filteredData = cachedData.filter(item => 
              !deletedItemsRef.current.has(item.id_detalle?.toString())
            );
            
            setOrders(filteredData);
            notifyOrdersUpdated(filteredData);
          }
        }
      } 
    } catch (err) {
      setError(`Error: ${err.message || 'No se pudo cargar los datos'}`);
      
      // Intentar recuperar de localStorage como último recurso
      const cachedData = window.apiCache.loadFromStorage(`orders_${tableId}`);
      if (cachedData && cachedData.length > 0) {
        // Filtrar elementos eliminados
        const filteredData = cachedData.filter(item => 
          !deletedItemsRef.current.has(item.id_detalle?.toString())
        );
        
        setOrders(filteredData);
        notifyOrdersUpdated(filteredData);
      }
    } finally {
      hasInitiallyLoaded.current = true;
      isPageReload.current = false;
    }
  }, [tableId, selectedOrderId, onOrderSelect, notifyOrdersUpdated]);
  
  // Important: Define handleRefresh BEFORE handleClearCache
  const handleRefresh = useCallback(() => {
    if (tableId) {
      setError(null);
      fetchFreshData(true);
    }
  }, [tableId, fetchFreshData]);

  // Nuevo: Limpiar duplicados
  const handleClearDuplicates = useCallback(() => {
    // Limpiar todos los registros que impiden duplicados
    try {
      localStorage.removeItem('processedOrderIds');
      window.processedOrderIds = new Set();
      processedOrders.current.clear();
      recentlyAddedItems.current.clear();
    } catch (e) {
    }
  }, []);

  // Limpiar caché y listas de elementos eliminados/modificados
  const handleClearCache = useCallback(() => {
    if (tableId) {
      clearCacheForTable(tableId);
      
      // Limpiar registros
      try {
        localStorage.removeItem(`deleted_orders_${tableId}`);
        localStorage.removeItem(`modified_orders_${tableId}`);
        deletedItemsRef.current.clear();
        locallyModifiedRef.current.clear();
        processedOrders.current.clear();
        recentlyAddedItems.current.clear();
      } catch (e) {
      }
      
      // También limpiar duplicados
      handleClearDuplicates();
      
      handleRefresh();
    }
  }, [tableId, handleRefresh, handleClearDuplicates]);

  // Cargar datos iniciales - MODIFICADO para eliminar verificaciones de duplicados
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!tableId) return;

    try {
      // Si tenemos órdenes manuales y no es recarga de página, usarlas
      if (manualOrderUpdate && manualOrderUpdate.length > 0 && !isPageReload.current) {
        // Filtrar elementos eliminados
        const filteredData = manualOrderUpdate.filter(item => 
          !deletedItemsRef.current.has(item.id_detalle?.toString())
        );
        
        setOrders(filteredData);
        notifyOrdersUpdated(filteredData);
        hasInitiallyLoaded.current = true;
        return;
      }
      
      // En caso de recarga, intentar primero recuperar desde localStorage
      if (isPageReload.current) {
        const cachedData = window.apiCache.loadFromStorage(`orders_${tableId}`);
        if (cachedData && cachedData.length > 0) {
          // Filtrar elementos eliminados
          const filteredData = cachedData.filter(item => 
            !deletedItemsRef.current.has(item.id_detalle?.toString())
          );
          
          setOrders(filteredData);
          notifyOrdersUpdated(filteredData);
          hasInitiallyLoaded.current = true;
          
          // Ya no es una recarga una vez que cargamos los datos
          isPageReload.current = false;
          
          // Aún así, actualizar en segundo plano
          setTimeout(() => {
            fetchFreshData();
          }, 100);
          
          return;
        }
      }
      
      // Verificar caché en memoria
      if (!forceRefresh && !isPageReload.current) {
        const cachedData = window.apiCache.get(`orders_${tableId}`);
        if (cachedData && cachedData.length > 0) {
          // Filtrar elementos eliminados
          const filteredData = cachedData.filter(item => 
            !deletedItemsRef.current.has(item.id_detalle?.toString())
          );
          
          setOrders(filteredData);
          notifyOrdersUpdated(filteredData);
          hasInitiallyLoaded.current = true;
          return;
        }
      }

      // Si llegamos aquí, necesitamos cargar datos frescos
      fetchFreshData(forceRefresh);
      
    } catch (err) {
      setError(`Error: ${err.message || 'Error desconocido al cargar datos'}`);
    }
  }, [tableId, manualOrderUpdate, fetchFreshData, notifyOrdersUpdated]);
  
  // MODIFICADO: handleAddEvent con mejor compatibilidad con ButtonComponent
  const handleAddEvent = useCallback((newEvent) => {
    // Verificaciones básicas
    if (!newEvent || !newEvent.id_detalle) {
      return;
    }
    
    const orderId = newEvent.id_detalle.toString();
    
    // Verificar si está marcado como eliminado (única verificación importante)
    if (deletedItemsRef.current.has(orderId)) {
      return;
    }
    
    // Añadir timestamp interno si no existe ya
    const eventWithTimestamp = {
      ...newEvent,
      _timestamp: newEvent._timestamp || Date.now(), // Asegurar un timestamp para React keys
      Estado: newEvent.Estado || 'EN ESPERA' // Asegurar que nuevos items siempre empiezan como EN ESPERA
    };
    
    // Actualizar la lista de órdenes - nuevas órdenes AL PRINCIPIO
    setOrders(prevOrders => {
      // Sólo verificamos si el elemento ya está en la primera posición
      const existingIndex = prevOrders.findIndex(o => o.id_detalle === orderId);
      
      if (existingIndex === 0) {
        // Si ya está en primera posición con timestamp reciente (menos de 1 segundo), evitamos duplicado
        const existingItem = prevOrders[0];
        const now = Date.now();
        if (existingItem._timestamp && now - existingItem._timestamp < 1000) {
          return prevOrders;
        }
      }
      
      // En cualquier otro caso, añadimos al principio (incluso si existe más abajo en la lista)
      const updatedOrders = [eventWithTimestamp, ...prevOrders];
      
      // Notify about orders update
      notifyOrdersUpdated(updatedOrders);
      
      // Also dispatch a specific add event
      const addEvent = new CustomEvent('orderAdded', {
        detail: {
          orders: updatedOrders,
          addedOrder: eventWithTimestamp,
          tableId
        }
      });
      window.dispatchEvent(addEvent);
      
      return updatedOrders;
    });
    
    // Actualizar caché en segundo plano
    setTimeout(() => {
      if (tableId) {
        const cachedData = window.apiCache.get(`orders_${tableId}`) || [];
        window.apiCache.set(`orders_${tableId}`, [eventWithTimestamp, ...cachedData]);
      }
    }, 0);
  }, [tableId, notifyOrdersUpdated]);

  // MODIFICADO: handleOrderSelect para que solo permita seleccionar ítems EN ESPERA
  const handleOrderSelect = useCallback((id) => {
    // Si no hay ID, simplemente deseleccionamos
    if (!id) {
      onOrderSelect(null);
      return;
    }
    
    // Buscar el orden correspondiente al ID
    const selectedOrder = orders.find(order => order.id_detalle === id);
    
    // Solo permitir selección si el ítem está en estado "EN ESPERA"
    if (selectedOrder && selectedOrder.Estado === 'EN ESPERA') {
      onOrderSelect(id);
    } else {
      // Si el ítem está en estado "ENVIADO" u otro, simplemente ignorar (sin mensaje)
      onOrderSelect(null);
    }
  }, [orders, onOrderSelect]);

  // FIXED: handleSaveNoteNube que recibe los parámetros correctos
  const handleSaveNoteNube = useCallback(async(id, note) => {
    if (!id) return;
    
    
    const orderId = id.toString();
    // Actualización UI inmediata
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => 
        order.id_detalle === id ? { ...order, note } : order
      );
      
      // Notify about orders update
      notifyOrdersUpdated(updatedOrders);
      
      // Also dispatch a specific modification event
      const modifyEvent = new CustomEvent('orderModified', {
        detail: {
          orders: updatedOrders,
          modifiedId: id,
          tableId
        }
      });
      window.dispatchEvent(modifyEvent);
      
      return updatedOrders;
    });
    
    // Cerrar editor inmediatamente
    setEditingId(null);
    
    // Marcar como modificado localmente
    locallyModifiedRef.current.add(orderId);
    
    // Guardar en localStorage
    try {
      const tableModifiedKey = `modified_orders_${tableId}`;
      const currentModified = JSON.parse(localStorage.getItem(tableModifiedKey) || '[]');
      if (!currentModified.includes(orderId)) {
        currentModified.push(orderId);
        localStorage.setItem(tableModifiedKey, JSON.stringify(currentModified));
      }
    } catch (e) {}
  }, [tableId, notifyOrdersUpdated]);

  // FIXED: handleSocketDelete que tiene la lógica para manejar eliminaciones (renamed from handlePusherDelete)
  const handleSocketDelete = useCallback((data) => {
    if (!data.id_detalle) {
      return;
    }
    
    
    // Eliminar el ítem de la lista de órdenes
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.filter(order => 
        order.id_detalle != data.id_detalle
      );
    
      // Notify about orders update
      notifyOrdersUpdated(updatedOrders);
      
      // Also dispatch a specific delete event
      const deleteEvent = new CustomEvent('orderDeleted', {
        detail: {
          orders: updatedOrders,
          deletedId: data.id_detalle,
          tableId
        }
      });
      window.dispatchEvent(deleteEvent);
      
      return updatedOrders;
    });
    
    // Marcar como eliminado para prevenir reapariciones
    deletedItemsRef.current.add(data.id_detalle.toString());
    
    // Guardar en localStorage
    try {
      const tableDeletedKey = `deleted_orders_${tableId}`;
      const currentDeleted = JSON.parse(localStorage.getItem(tableDeletedKey) || '[]');
      if (!currentDeleted.includes(data.id_detalle.toString())) {
        currentDeleted.push(data.id_detalle.toString());
        localStorage.setItem(tableDeletedKey, JSON.stringify(currentDeleted));
      }
    } catch (e) {}
  }, [tableId, notifyOrdersUpdated]);

  // MODIFIED: handleSocketUpdate sin verificaciones de duplicados extremas (renamed from handlePusherUpdate)
  const handleSocketUpdate = useCallback((data) => {
    // Si no hay un id_detalle válido, ignorar
    if (!data.id_detalle) {
      return;
    }
    
    const orderId = data.id_detalle.toString();
    
    // Si el elemento ya fue eliminado localmente, ignorar
    if (deletedItemsRef.current.has(orderId)) {
      return;
    }
    
    // Si el elemento fue modificado localmente, ignorar 
    if (locallyModifiedRef.current.has(orderId)) {
      return;
    }
    
    // Verificar que el client_id sea diferente al nuestro
    if (data.client_id && data.client_id === clientId.current.toString()) {
      return;
    }
    
    // Verificar duplicación reciente (en los últimos 2 segundos) para actualizaciones
    const now = Date.now();
    if (recentlyAddedItems.current.has(orderId)) {
      const timeAdded = recentlyAddedItems.current.get(orderId);
      if (now - timeAdded < 2000) { // 2 segundos
        return;
      }
    }
    
    // Actualizar el registro de procesamiento reciente
    recentlyAddedItems.current.set(orderId, now);

    setOrders(prevOrders => {
      try {
        // Verificar si es un nuevo elemento
        const existingItemIndex = prevOrders.findIndex(
          order => order.id_detalle == data.id_detalle
        );

        // Crear una copia del array para no mutar el estado directamente
        let updatedOrders = [...prevOrders];
        
        if (existingItemIndex === -1) {
          // Nueva orden remota
          const newOrder = {
            id_detalle: data.id_detalle,
            Estado: data.estado || "EN ESPERA",
            producto: data.descripcion,
            Cant: 1,
            venta: data.venta || 0,
            note: data.nota || "",
            _timestamp: now
          };
          
          // Añadir al principio para mantener nuevos elementos arriba
          updatedOrders = [newOrder, ...prevOrders];
          
          // Notify about orders update
          notifyOrdersUpdated(updatedOrders);
          
          // Also dispatch a specific add event
          const addEvent = new CustomEvent('orderAdded', {
            detail: {
              orders: updatedOrders,
              addedOrder: newOrder,
              tableId
            }
          });
          window.dispatchEvent(addEvent);
          
          return updatedOrders;
        } else {
          const existingOrder = prevOrders[existingItemIndex];
          let hasChanges = false;
          let updatedOrder = { ...existingOrder, _timestamp: now };
          
          // Solo actualizar los campos que cambien
          if (data.estado && data.estado !== existingOrder.Estado) {
            updatedOrder.Estado = data.estado;
            hasChanges = true;
            
            // Si estado cambia a ENVIADO y este item estaba seleccionado, deseleccionar
            if (data.estado != 'EN ESPERA' && selectedOrderId === existingOrder.id_detalle) {
              // Deseleccionar en el siguiente tick para evitar problemas con el estado actual
              setTimeout(() => {
                onOrderSelect(null);
              }, 0);
            }
          }
          
          if (data.nota !== undefined && data.nota !== existingOrder.note) {
            updatedOrder.note = data.nota;
            hasChanges = true;
          }
          
          if (hasChanges) {
            // Verificar si debemos mover el elemento al principio
            if (existingItemIndex > 0) {
              // Primero remover el elemento existente
              updatedOrders.splice(existingItemIndex, 1);
              // Luego añadirlo al principio
              updatedOrders.unshift(updatedOrder);
            } else {
              // Si ya está en la primera posición, solo actualizar
              updatedOrders[existingItemIndex] = updatedOrder;
            }
            
            // Notify about orders update
            notifyOrdersUpdated(updatedOrders);
            
            // Also dispatch a specific modification event
            const modifyEvent = new CustomEvent('orderModified', {
              detail: {
                orders: updatedOrders,
                modifiedId: data.id_detalle,
                tableId
              }
            });
            window.dispatchEvent(modifyEvent);
            
            return updatedOrders;
          } else {
            // No hay cambios necesarios
            return prevOrders;
          }
        }
      } catch (error) {
        return prevOrders;
      }
    });
  }, [selectedOrderId, onOrderSelect, tableId, notifyOrdersUpdated]);

  // NUEVO: Handler para actualizar cantidades - FUERA del useEffect
  const handleQuantityUpdate = useCallback((data) => {
    // Verificar que tengamos los datos necesarios
    if (!data.id_detalle || data.cantidad === undefined) {
      return;
    }
    
    const orderId = data.id_detalle.toString();
    
    // Si el elemento ya fue eliminado localmente, ignorar
    if (deletedItemsRef.current.has(orderId)) {
      return;
    }
    
    // Actualizar el orden localmente
    setOrders(prevOrders => {
      try {
        // Buscar el elemento existente
        const existingItemIndex = prevOrders.findIndex(
          order => order.id_detalle == data.id_detalle
        );
        
        if (existingItemIndex === -1) {
          return prevOrders;
        }
        
        // Crear una copia del array para no mutar el estado directamente
        const updatedOrders = [...prevOrders];
        
        // Actualizar la cantidad del elemento
        updatedOrders[existingItemIndex] = {
          ...updatedOrders[existingItemIndex],
          Cant: data.cantidad,
          _timestamp: Date.now() // Actualizar timestamp
        };
        
        // Notify about orders update
        notifyOrdersUpdated(updatedOrders);
        
        // Also dispatch a specific modification event
        const modifyEvent = new CustomEvent('orderModified', {
          detail: {
            orders: updatedOrders,
            modifiedId: data.id_detalle,
            tableId
          }
        });
        window.dispatchEvent(modifyEvent);
        
        return updatedOrders;
      } catch (error) {
        return prevOrders;
      }
    });
  }, [notifyOrdersUpdated, tableId]);

  // FIXED: Replace Pusher with Socket.IO for real-time events
  useEffect(() => {
    // Initialize Socket.IO only once
    if (!socketRef.current) {
      try {
        // Replace with your actual server URL
        socketRef.current = io('http://localhost:3000', {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket']
        });
        
        // Register this client
        socketRef.current.emit('register', clientId.current);
      } catch (error) {
        console.error('Error initializing Socket.IO:', error);
      }
    }
    
    // Only set up event listeners if we have a valid tableId and socket connection
    if (tableId && socketRef.current) {
      // Listen for update events
      socketRef.current.on('credito_actualizado', (data) => {
        // Verify this event is for our table and from another client
        if (data.mesa == tableId && 
            (!data.client_id || data.client_id !== clientId.current.toString())) {
          handleSocketUpdate(data);
        }
      });
      
      // Listen for note edit events
      socketRef.current.on('producto_editado', (data) => {
        // Verify this is from another client
        if (data.client_id && data.client_id !== clientId.current.toString()) {
          if (data.id_detalle && data.nota !== undefined) {
            handleSaveNoteNube(parseInt(data.id_detalle, 10), data.nota);
          }
        }
      });
      
      // Listen for delete events
      socketRef.current.on('producto_eliminado', (data) => {
        // Verify this is from another client
        if (!data.client_id || data.client_id !== clientId.current.toString()) {
          handleSocketDelete(data);
        }
      });
      
      // Listen for quantity change events
      socketRef.current.on('producto_cantidad', (data) => {
        // Verify this is from another client
        if (!data.client_id || data.client_id !== clientId.current.toString()) {
          handleQuantityUpdate(data);
        }
      });
      
      // Handle connection errors
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
      
      // Handle reconnection
      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
      });
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        // Remove all event listeners
        socketRef.current.off('credito_actualizado');
        socketRef.current.off('producto_editado');
        socketRef.current.off('producto_eliminado');
        socketRef.current.off('producto_cantidad');
        socketRef.current.off('connect_error');
        socketRef.current.off('reconnect');
      }
    };
  }, [
    tableId, 
    handleSocketUpdate, 
    handleSocketDelete, 
    handleSaveNoteNube, 
    handleQuantityUpdate
  ]);

  // handleDelete with anti-duplicates and reason support
  const handleDelete = useCallback((id, reason = '') => {
    if (!id) return;
    
    const orderId = id.toString();
    
    // Actualización UI inmediata
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.filter(order => order.id_detalle !== id);
      
      // Notify about orders update
      notifyOrdersUpdated(updatedOrders);
      
      // Also dispatch a specific delete event
      const deleteEvent = new CustomEvent('orderDeleted', {
        detail: {
          orders: updatedOrders,
          deletedId: id,
          tableId
        }
      });
      window.dispatchEvent(deleteEvent);
      
      return updatedOrders;
    });
    
    // Actualizar selección si necesario
    if (selectedOrderId === id) {
      onOrderSelect(null);
    }
    
    // Marcar como eliminado para prevenir reapariciones
    deletedItemsRef.current.add(orderId);
    
    // Guardar en localStorage
    try {
      const tableDeletedKey = `deleted_orders_${tableId}`;
      const currentDeleted = JSON.parse(localStorage.getItem(tableDeletedKey) || '[]');
      if (!currentDeleted.includes(orderId)) {
        currentDeleted.push(orderId);
        localStorage.setItem(tableDeletedKey, JSON.stringify(currentDeleted));
      }
      
      // También guardar la razón si existe
      if (reason) {
        const deleteReasonsKey = `delete_reasons_${tableId}`;
        const currentReasons = JSON.parse(localStorage.getItem(deleteReasonsKey) || '{}');
        currentReasons[orderId] = reason;
        localStorage.setItem(deleteReasonsKey, JSON.stringify(currentReasons));
      }
    } catch (e) {}
  }, [selectedOrderId, onOrderSelect, tableId, notifyOrdersUpdated]);

  // Handlers para edición - MODIFICADO para restringir a items EN ESPERA
  const handleEdit = useCallback((id) => {
    if (!id) {
      setEditingId(null);
      return;
    }
    
    const orderId = id.toString();
    const orderToEdit = orders.find(order => order.id_detalle === id);
    
    // Solo permitir edición si el ítem está en estado EN ESPERA
    if (!orderToEdit || orderToEdit.Estado !== 'EN ESPERA') {
      return; // Silenciosamente, no hacer nada
    }
    
    // Actualización UI inmediata
    setEditingId(id);
    
    // Marcar como modificado localmente
    locallyModifiedRef.current.add(orderId);
    
    // Guardar en localStorage
    try {
      const tableModifiedKey = `modified_orders_${tableId}`;
      const currentModified = JSON.parse(localStorage.getItem(tableModifiedKey) || '[]');
      if (!currentModified.includes(orderId)) {
        currentModified.push(orderId);
        localStorage.setItem(tableModifiedKey, JSON.stringify(currentModified));
      }
    } catch (e) {}
  }, [tableId, orders]);

  // handleSaveNote con anti-duplicados
  const handleSaveNote = useCallback(async(id, note) => {
    if (!id) return;
    
    const orderId = id.toString();
    
    // Verificar que el ítem esté EN ESPERA
    const orderToEdit = orders.find(order => order.id_detalle === id);
    if (!orderToEdit || orderToEdit.Estado !== 'EN ESPERA') {
      setEditingId(null);
      return; // Silenciosamente, no hacer nada
    }
    
    const response = await detalleeditarnota({id: orderId, nota: note});
    if (response.data.data === 1) {
      // Actualización UI inmediata
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order.id_detalle === id ? { ...order, note } : order
        );
        
        // Notify about orders update
        notifyOrdersUpdated(updatedOrders);
        
        // Also dispatch a specific modification event
        const modifyEvent = new CustomEvent('orderModified', {
          detail: {
            orders: updatedOrders,
            modifiedId: id,
            tableId
          }
        });
        window.dispatchEvent(modifyEvent);
        
        return updatedOrders;
      });
      
      // Cerrar editor inmediatamente
      setEditingId(null);
      
      // Marcar como modificado localmente
      locallyModifiedRef.current.add(orderId);
      
      // Guardar en localStorage
      try {
        const tableModifiedKey = `modified_orders_${tableId}`;
        const currentModified = JSON.parse(localStorage.getItem(tableModifiedKey) || '[]');
        if (!currentModified.includes(orderId)) {
          currentModified.push(orderId);
          localStorage.setItem(tableModifiedKey, JSON.stringify(currentModified));
        }
      } catch (e) {}
    }
  }, [orders, tableId, notifyOrdersUpdated]);
  
  // Modo debug (activado con clic en la esquina)
  const handleDebugToggle = () => {
    setShowDebug(prev => !prev);
    
    // Actualizar información de depuración
    setDebugInfo({
      tableId,
      orderCount: orders?.length || 0,
      hasLoaded: hasInitiallyLoaded.current,
      clientId: clientId.current,
      cacheStatus: window.apiCache?.data ? 'Existe' : 'Vacía',
      deletedCount: deletedItemsRef.current.size,
      processedCount: processedOrders.current.size,
      recentlyAddedItems: recentlyAddedItems.current.size,
      globalProcessedCount: window.processedOrderIds ? window.processedOrderIds.size : 0,
      timestamp: new Date().toLocaleTimeString(),
      duplicatesStatus: "Compatible con botones" // Nuevo estado
    });
  };

  // Limpiar cualquier registro anti-duplicados al montar el componente
  useEffect(() => {
    // Limpiar duplicados al inicio
    handleClearDuplicates();
    
    // Inicializar registro de items recientes
    recentlyAddedItems.current = new Map();
    
    // Configurar un limpiador periódico para el mapa de items recientes
    const intervalId = setInterval(() => {
      const now = Date.now();
      for (const [id, timestamp] of recentlyAddedItems.current.entries()) {
        if (now - timestamp > 60000) { // Eliminar entradas más antiguas de 1 minuto
          recentlyAddedItems.current.delete(id);
        }
      }
    }, 30000); // Limpiar cada 30 segundos
    
    return () => {
      clearInterval(intervalId);
    };
  }, [handleClearDuplicates]);

  // Cargar elementos eliminados desde localStorage
  useEffect(() => {
    if (tableId) {
      try {
        // Cargar elementos eliminados
        const tableDeletedKey = `deleted_orders_${tableId}`;
        const deletedItems = JSON.parse(localStorage.getItem(tableDeletedKey) || '[]');
        deletedItems.forEach(id => deletedItemsRef.current.add(id.toString()));
        
        // Cargar elementos modificados localmente
        const tableModifiedKey = `modified_orders_${tableId}`;
        const modifiedItems = JSON.parse(localStorage.getItem(tableModifiedKey) || '[]');
        modifiedItems.forEach(id => locallyModifiedRef.current.add(id.toString()));
      } catch (e) {
      }
    }
  }, [tableId]);
  
  // Actualizar cuando cambia tableId
  useEffect(() => {
    if (tableId) {
      hasInitiallyLoaded.current = false;
      setError(null);
      fetchOrders(true);
    } else {
      setError('Error: No hay mesa seleccionada');
    }
  }, [tableId, fetchOrders]);
  
  // Actualización manual
  useEffect(() => {
    if (manualOrderUpdate && manualOrderUpdate.length > 0) {
      // Filtrar elementos eliminados
      const filteredData = manualOrderUpdate.filter(item => 
        !deletedItemsRef.current.has(item.id_detalle?.toString())
      );
      
      // Añadir timestamps a todos los elementos para consistencia
      const timestampedData = filteredData.map(item => ({
        ...item,
        _timestamp: Date.now()
      }));
      
      setOrders(timestampedData);
      notifyOrdersUpdated(timestampedData);
      
      // Actualizar caché con las órdenes actualizadas
      if (tableId) {
        window.apiCache.set(`orders_${tableId}`, timestampedData);
      }
      
      // Ya no estamos cargando
      hasInitiallyLoaded.current = true;
    }
  }, [manualOrderUpdate, tableId, notifyOrdersUpdated]);
  
  // MODIFICADO: Efecto para newOrder con mejor compatibilidad con ButtonComponent
  useEffect(() => {
    if (newOrder && newOrder.id_detalle) {
      
      // Procesar de inmediato sin verificaciones de duplicados
      // El ButtonComponent ya previene clics duplicados
      if (!manualOrderUpdate || manualOrderUpdate.length === 0) {
        handleAddEvent(newOrder);
      }
    }
  }, [newOrder, handleAddEvent, manualOrderUpdate]);

  // Renderizado
  const content = useMemo(() => {
    if (error) {
      return (
        <ErrorMessage>
          {error}
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleRefresh}>Reintentar</button>
          </div>
        </ErrorMessage>
      );
    }

    if (!orders?.length) {
      return (
        <EmptyState>
          <p>No hay órdenes para mostrar</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleRefresh}>Recargar datos</button>
          </div>
        </EmptyState>
      );
    }

    return (
      <ScrollArea>
        {orders.map((order, index) => {
          // Generar una clave única y estable para cada orden
          const uniqueKey = `order-${order.id_detalle}-${order._timestamp || index}`;
          
          return (
            <OrderItem
              key={uniqueKey}
              order={order}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSaveNote={handleSaveNote}
              isEditing={editingId === order.id_detalle}
              externalQuantity={quantities[order.id_detalle]}
              isSelected={selectedOrderId === order.id_detalle}
              onSelect={handleOrderSelect}
            />
          );
        })}
      </ScrollArea>
    );
  }, [
    error,
    orders,
    editingId,
    quantities,
    selectedOrderId,
    handleDelete,
    handleEdit,
    handleSaveNote,
    handleOrderSelect,
    handleRefresh
  ]);

  return (
    <Container>
      {content}
      <RefreshButton onClick={handleRefresh} title="Recargar datos">
        <RefreshCw size={16} />
      </RefreshButton>
      
      {/* Título con clic para activar modo debug */}
      <div 
        onClick={handleDebugToggle} 
        style={{ position: 'absolute', top: 5, left: 5, padding: '5px', cursor: 'pointer', zIndex: 10 }}
      >
        {showDebug ? '🔍' : ''}
      </div>
      
      {/* Panel de depuración */}
      <DebugInfo $visible={showDebug}>
        <div>Mesa: {debugInfo.tableId || 'No seleccionada'}</div>
        <div>Órdenes: {debugInfo.orderCount}</div>
        <div>Cargado: {debugInfo.hasLoaded ? 'Sí' : 'No'}</div>
        <div>Cliente: {debugInfo.clientId?.substring(0, 6)}</div>
        <div>Caché: {debugInfo.cacheStatus}</div>
        <div>Eliminados: {debugInfo.deletedCount || 0}</div>
        <div>Recientes: {debugInfo.recentlyAddedItems || 0}</div>
        <div>Duplicados: {debugInfo.duplicatesStatus}</div>
        <div>Hora: {debugInfo.timestamp}</div>
        <div>
          <button onClick={handleClearCache}>Limpiar Caché</button>
          <button onClick={handleClearDuplicates}>Limpiar Duplicados</button>
        </div>
      </DebugInfo>
    </Container>
  );
};

// Exportar como componente memorizado
export default React.memo(OrderList);