import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { productomostrarporcategoria } from '../../../Api/TaskgrupoYproducto';
import { ventainsertar } from '../../../Api/TaskventaYdetalle';
import { useAuthStore, useidmesa } from '../../authStore';

// Estilos optimizados para rendimiento
const ButtonContainer = styled.div`
  width: 100%;
  padding: 0.25rem;
`;

const ButtonGroup = styled.div`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px); // Reducido para mejor rendimiento
  padding: 0.5rem;
  border-radius: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-family: Arial, sans-serif;
  border: none;
`;

// Botón compacto optimizado
const StyledButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  border-radius: 0.75rem;
  font-weight: 600;
  color: white;
  background: ${props => props.isSelected ? '#ff3b3b' : '#dc2626'};
  border: none;
  user-select: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  overflow: hidden;
  padding: 0;
  opacity: ${props => props.disabled ? 0.7 : 1};
  font-family: Arial, sans-serif;
  
  &:hover {
    background: ${props => props.isSelected ? '#ff4a4a' : '#e42c2c'};
  }
  
  &:active {
    background: ${props => props.isSelected ? '#ff3131' : '#c81e1e'};
  }
`;

// Textos simplificados
const Description = styled.span`
  width: 100%;
  padding: 8px 12px 4px;
  font-size: 0.85em;
  text-align: left;
  font-weight: 500;
`;

const Price = styled.span`
  width: 100%;
  padding: 4px 1px 8px;
  font-size: 1em;
  font-weight: 700;
  text-align: center;
`;

// Contenedor de estado simplificado
const FlatStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
  border: none;
  padding: 2rem 1.5rem;
  text-align: center;
  font-family: Arial, sans-serif;
  margin: 0.25rem 0;
`;

// Círculo para iconos simplificado
const IconCircle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 50%;
  border: none;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div`
  font-size: 40px;
`;

const StateHeading = styled.h2`
  color: #111827;
  margin: 0;
  margin-bottom: 0.75rem;
  font-weight: 700;
  font-size: 1.4rem;
`;

const StateText = styled.p`
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
  max-width: 320px;
  line-height: 1.5;
`;

// Asegurar que tenemos un ID de cliente único para identificar este cliente/navegador
if (!window.clientInstanceId) {
  window.clientInstanceId = Math.random().toString(36).substring(2, 15);
}

// Caché para productos - Optimizado
window.productoCache = window.productoCache || {
  data: {},
  timestamp: {},
  get: function(key) {
    if (this.data[key] && (Date.now() - this.timestamp[key] < 300000)) {
      return this.data[key];
    }
    return null;
  },
  set: function(key, data) {
    this.data[key] = data;
    this.timestamp[key] = Date.now();
  }
};

// Simplificado: Usar un Map normal en lugar de un sistema más complejo
if (!window.productLocks) {
  window.productLocks = new Map();
}

// OPTIMIZADO: Frecuencia reducida para la limpieza
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of window.productLocks.entries()) {
    if (now - timestamp > 3000) { // 3 segundos
      window.productLocks.delete(key);
    }
  }
}, 10000); // Cambiado de 5000ms a 10000ms

const ButtonComponent = ({id_grupo, onOrderAdded, updateOrdersManually, onAddEvent }) => {
  const { tableId } = useidmesa();
  const [selectedButton, setSelectedButton] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonStates, setButtonStates] = useState({}); // Estado individual por botón
  const clientIdRef = useRef(window.clientInstanceId);
  
  // Optimizado: Uso de un Map simple
  const processingProducts = useRef(new Map());
  
  // Obtener datos de auth una sola vez
  const authData = useAuthStore((state) => state.authData);
  const authInfo = useMemo(() => ({
    userId: authData[0],
    empresaId: authData[1],
    mesero: authData[3]
  }), [authData]);
  
  // Carga de datos optimizada
  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones después de desmontar
    
    const fetchData = async () => {
      if (!id_grupo) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Verificar caché
        const cacheKey = `productos_${id_grupo}`;
        const cachedData = window.productoCache.get(cacheKey);
        
        if (cachedData) {
          if (isMounted) setButtons(cachedData);
          if (isMounted) setLoading(false);
          return;
        }
        
        // Si no hay caché, hacer petición
        const response = await productomostrarporcategoria({ id: id_grupo });
        if (response?.data?.data && isMounted) {
          window.productoCache.set(cacheKey, response.data.data);
          setButtons(response.data.data);
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();
    
    // Limpieza para evitar actualizaciones después de desmontar
    return () => {
      isMounted = false;
    };
  }, [id_grupo]);
  
  // OPTIMIZADO: Intervalo más largo para actualizar estados
  useEffect(() => {
    // Sólo crear el intervalo si hay botones
    if (buttons.length === 0) return;
    
    const intervalId = setInterval(() => {
      const now = Date.now();
      let needsUpdate = false;
      let updatedStates = {...buttonStates};
      
      buttons.forEach(button => {
        const productKey = `${tableId}-${button.id_producto}`;
        
        const localLock = processingProducts.current.get(productKey);
        const isLocallyLocked = localLock && (now - localLock < 800);
        
        const globalLock = window.productLocks.get(productKey);
        const isGloballyLocked = globalLock && (now - globalLock < 3000);
        
        const isLocked = isLocallyLocked || isGloballyLocked;
        if (updatedStates[button.id_producto] !== isLocked) {
          updatedStates[button.id_producto] = isLocked;
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setButtonStates(updatedStates);
      }
    }, 500); // Cambiado de 200ms a 500ms
    
    return () => clearInterval(intervalId);
  }, [buttons, tableId, buttonStates]);
  
  // Limpiar locks al desmontar
  useEffect(() => {
    return () => {
      processingProducts.current.clear();
    };
  }, []);
  
  // OPTIMIZADO: handleButtonClick con manejo más eficiente
  const handleButtonClick = useCallback(async (e, id, info) => {
    e.preventDefault();
    
    const productKey = `${tableId}-${id}`;
    
    // Verificar si el botón ya está bloqueado
    if (buttonStates[id]) {
      return; // No hay necesidad de imprimir en consola
    }
    
    // Bloquear el botón inmediatamente para feedback visual
    setButtonStates(prev => ({...prev, [id]: true}));
    setSelectedButton(id);
    
    // Registrar el bloqueo
    const now = Date.now();
    processingProducts.current.set(productKey, now);
    window.productLocks.set(productKey, now);
    
    try {
      // Parámetros para la API
      const data = {
        id_mesa: tableId,
        id_usuario: authInfo.userId,
        id_empresa: authInfo.empresaId,
        id_producto: id,
        mesero: authInfo.mesero,
        Descripcion: info.Descripcion,
        venta: info.PrecioVenta,
        client_id: clientIdRef.current
      };
      
      // Hacer petición API
      const response = await ventainsertar(data);
      
      // Si tenemos respuesta, crear orden
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
    } catch (error) {
      console.error('Error al insertar venta:', error);
    } finally {
      // OPTIMIZADO: Liberar recursos inmediatamente
      setSelectedButton(null);
      setButtonStates(prev => ({...prev, [id]: false}));
      processingProducts.current.delete(productKey);
      window.productLocks.delete(productKey);
    }
  }, [tableId, authInfo, buttonStates, onAddEvent]);
  
  // Renderizado condicional para categoría no seleccionada
  if (!id_grupo) {
    return (
      <FlatStateContainer>
        <IconCircle>
          <IconWrapper>👆</IconWrapper>
        </IconCircle>
        <StateHeading>Selecciona una categoría</StateHeading>
        <StateText>
          Elige una categoría para ver su menú de productos
        </StateText>
      </FlatStateContainer>
    );
  }
  
  // Renderizado de productos disponibles
  return (
    <ButtonContainer>
      <ButtonGroup>
        {buttons.map((button) => (
          <StyledButton
            key={button.id_producto}
            isSelected={selectedButton === button.id_producto}
            onClick={(e) => handleButtonClick(e, button.id_producto, button)}
            disabled={buttonStates[button.id_producto]}
          >
            <Description>{button.Descripcion}</Description>
            <Price>${parseFloat(button.PrecioVenta).toLocaleString()}</Price>
          </StyledButton>
        ))}
      </ButtonGroup>
    </ButtonContainer>
  );
};

// Exportar como componente memorizado
export default React.memo(ButtonComponent);