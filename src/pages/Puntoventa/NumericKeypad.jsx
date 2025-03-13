import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { detalleeditarcantidad } from '../../Api/TaskventaYdetalle';

const KeypadContainer = styled.div`
  width: 240px;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
`;

const DisplayContainer = styled.div`
  margin-bottom: 0.75rem;
`;

const NumberDisplay = styled.div`
  width: 100%;
  padding: 0.75rem 0.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #6366F1;
`;

const TypeDisplay = styled.div`
  width: 100%;
  text-align: center;
  font-size: 0.875rem;
  color: #6366F1;
  opacity: 0.8;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.375rem;
`;

const Button = styled.button`
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: ${props => {
    if (props.selected) return '#6366F1';
    return '#F5F6FF';
  }};
  color: ${props => props.selected ? 'white' : '#6366F1'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  opacity: ${props => props.isSpecialButton && !props.selected ? 0.6 : 1};
  
  &:hover {
    background-color: ${props => props.selected ? '#4F46E5' : '#EEF2FF'};
  }
  
  &:disabled {
    visibility: hidden;
  }
`;

const NumericKeypad = ({ onQuantityChange, initialQuantity = '', selectedOrderId = null }) => {
  const [display, setDisplay] = useState('0');
  const [selectedButton, setSelectedButton] = useState('Cant');
  const [prevOrderId, setPrevOrderId] = useState(null);
  const [lastSentValue, setLastSentValue] = useState('0');
  const clientIdRef = useRef(window.clientInstanceId);
  
  // Referencia para manejar estado de guardado
  const savingRef = useRef(false);
  
  // Función para enviar datos al backend con manejo de estado
  const saveToBackend = async (id, value) => {
    // Evitar envíos duplicados o innecesarios
    if (!id || value === lastSentValue || savingRef.current) return;
    
    savingRef.current = true;
    console.log(`Guardando inmediatamente: Item=${id}, Valor=${value}`);
    
    try {
      const response = await detalleeditarcantidad({id: id, cantidad: value, id_navegador: clientIdRef.current});
      setLastSentValue(value);
      console.log("Guardado exitoso");
      
      // Dispatch a socket-like event for the OrderList component
      const quantityUpdateEvent = new CustomEvent('producto_cantidad', {
        detail: {
          id_detalle: id,
          cantidad: value,
          client_id: clientIdRef.current
        }
      });
      window.dispatchEvent(quantityUpdateEvent);
      
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      savingRef.current = false;
    }
  };
  
  // Broadcast quantity change to all components
  const broadcastQuantityChange = (id, value) => {
    if (!id) return;
    
    // Create and dispatch custom event with quantity change information
    const quantityEvent = new CustomEvent('quantityChanged', {
      detail: {
        selectedOrderId: id,
        quantity: parseInt(value, 10) || 0
      }
    });
    window.dispatchEvent(quantityEvent);
    
    // Also dispatch a direct update for ReceiptDisplay
    const updateEvent = new CustomEvent('quantityUpdate', {
      detail: {
        id_detalle: id,
        cantidad: parseInt(value, 10) || 0
      }
    });
    window.dispatchEvent(updateEvent);
  };
  
  // Efecto para cuando cambia el ítem seleccionado - sin retrasos
  useEffect(() => {
    // Si hay un cambio de ID y había un ID previo, guardar INMEDIATAMENTE los datos
    if (prevOrderId !== null && selectedOrderId !== prevOrderId && display !== '0') {
      console.log(`Cambio de ítem: guardando datos AHORA del ítem anterior (${prevOrderId})`);
      saveToBackend(prevOrderId, display);
      broadcastQuantityChange(prevOrderId, display);
    }
    
    // Forzar el reinicio del display a '0' sin cambiar la cantidad real
    if (selectedOrderId !== prevOrderId) {
      console.log("Ítem seleccionado cambiado, reiniciando SOLO el display visual");
      setDisplay('0');
    }
    
    // Actualizar el ID previo y resetear lastSentValue
    setPrevOrderId(selectedOrderId);
    setLastSentValue('0');
  }, [selectedOrderId, prevOrderId, display]);
  
  // Efecto para guardar al desmontar el componente
  useEffect(() => {
    return () => {
      // Guardar datos pendientes al cerrar/desmontar el componente
      if (selectedOrderId && display !== lastSentValue && display !== '0') {
        console.log("Desmontando componente: guardando datos pendientes");
        saveToBackend(selectedOrderId, display);
        broadcastQuantityChange(selectedOrderId, display);
      }
    };
  }, [selectedOrderId, display, lastSentValue]);
  
  // Maneja los clics en botones y guarda INMEDIATAMENTE cada cambio
  const handleButtonClick = (value) => {
    if (value === 'Borrar') {
      // Resetear a cero y guardar inmediatamente
      setDisplay('0');
      onQuantityChange && onQuantityChange('0');
      
      if (selectedOrderId) {
        // Guardar el '0' inmediatamente
        saveToBackend(selectedOrderId, '0');
        // Broadcast the change immediately
        broadcastQuantityChange(selectedOrderId, '0');
      }
    } else if (value === '<-') {
      setDisplay(prev => {
        const newValue = prev.slice(0, -1);
        // Si se borran todos los dígitos, volver a 0
        const finalValue = newValue === '' ? '0' : newValue;
        onQuantityChange && onQuantityChange(finalValue);
        
        // Guardar inmediatamente sin esperas
        if (selectedOrderId) {
          saveToBackend(selectedOrderId, finalValue);
          // Broadcast the change immediately
          broadcastQuantityChange(selectedOrderId, finalValue);
        }
        
        return finalValue;
      });
    } else if (['Prec', 'Cant', 'Desc'].includes(value)) {
      setSelectedButton(value);
    } else {
      // Para botones numéricos
      setDisplay(prev => {
        // Si solo hay un 0, reemplazarlo en lugar de añadir
        const newValue = prev === '0' ? value : prev + value;
        onQuantityChange && onQuantityChange(newValue);
        
        // Guardar inmediatamente cada digito
        if (selectedOrderId) {
          saveToBackend(selectedOrderId, newValue);
          // Broadcast the change immediately
          broadcastQuantityChange(selectedOrderId, newValue);
        }
        
        return newValue;
      });
    }
  };
  
  const buttons = [
    ['1', '2', '3', 'Prec'],
    ['4', '5', '6', 'Cant'],
    ['7', '8', '9', 'Desc'],
    ['Borrar', '0', '<-', ''],
  ];
  
  const isSpecialButton = (btn) => ['Prec', 'Cant', 'Desc'].includes(btn);
  
  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
  };
  
  return (
    <KeypadContainer>
      <DisplayContainer>
        <NumberDisplay>
          {formatNumber(display)}
        </NumberDisplay>
      </DisplayContainer>
      <ButtonGrid>
        {buttons.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((btn, btnIndex) => (
              <Button
                key={`${rowIndex}-${btnIndex}`}
                onClick={() => handleButtonClick(btn)}
                selected={selectedButton === btn}
                isSpecialButton={isSpecialButton(btn)}
                disabled={!btn}
              >
                {btn}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </ButtonGrid>
    </KeypadContainer>
  );
};

export default NumericKeypad;