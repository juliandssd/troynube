import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import ReceiptDisplay from './AccountInfo';
import StockCounter from './StockCounter';
import MenuComponent from './MenuComponent';
import GruposBar from './Producto/BarraBussquedaGrupo';
import Grupo from './Producto/Grupo';
import Productoventa from './Producto/Producto';
import OrderList from './OrderList';
import StatusHeader from './StatusHeader';
import NumericKeypad from './NumericKeypad';
import { useidmesa } from '../authStore';

// Custom shouldForwardProp function to filter out our custom props
const shouldForwardProp = (prop) => {
  const customProps = [
    'ancha', 'extraAncha', 'estrecha', 'grande', 'pequena', 'oscuro',
    'superior', 'reducida', 'isAdmin', 'isSpecialButton', 'isSelected',
    'large'
  ];
  return !customProps.includes(prop);
};

// Define styled components (IMPORTANTE: mantenemos todos)
const ContenedorRaiz = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`;

const Contenedor = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Columna = styled.div`
  display: flex;
  flex-direction: column;
  flex: ${props => {
    if (props.extraAncha) return 10; // Nueva proporción para la columna roja
    if (props.ancha) return 4; // Se mantiene igual para la amarilla
    if (props.estrecha) return 0; // Columna del medio
    return 2; // Valor por defecto
  }};
  height: 100%;
  width: 100%;
`;

const SeccionAmarilla = styled.div`
   display: flex;
   flex-direction: column;
   width: 100%;
   flex: ${props => props.grande ? 3 : 1.5}; // Cambiamos a proporción 3:1
`;

const AmarilloSuperiorChico = styled.div`
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  h2 {
    width: 100%;
    text-align: center;
  }
`;

const AmarilloSuperiorGrande = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  h2 {
    width: 100%;
    text-align: center;
  }
`;

const CajaAmarillaInferior = styled.div`
  flex: ${props => props.pequena ? 0.6 : 1}; // La caja pequeña será 0.6 del tamaño normal
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  h2 {
    width: 100%;
    text-align: center;
  }
`;

const CajaVerde = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  h2 {
    width: 100%;
    text-align: center;
  }
`;

const SeccionRoja = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  ${props => props.superior && `
    & > div:first-child {
      height: 60px; // Altura fija para el primer elemento
      flex: none; // Evita que flex influya en el tamaño
    }
    & > div:last-child {
      flex: 1; // Toma el espacio restante
    }
  `}
`;

const CajaRoja = styled.div`
  width: 100%;
  background-color: ${props => props.color};
  display: flex;
  color: white;
  ${props => !props.reducida && `flex: 1;`}
  h2 {
    width: 100%;
    text-align: center;
  }
`;

// Componente moderno de carga con efecto de pulso elegante
const ModernLoader = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

// Indicador de carga circular moderno
const PulseCircle = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(66, 133, 244, 0.2);
    animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #4285F4;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(0.7);
      opacity: 0.5;
    }
    50% {
      transform: scale(1);
      opacity: 0.2;
    }
    100% {
      transform: scale(0.7);
      opacity: 0.5;
    }
  }
  
  @keyframes pulse-dot {
    0% {
      transform: translate(-50%, -50%) scale(0.9);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      transform: translate(-50%, -50%) scale(0.9);
    }
  }
`;

// Un componente para renderizado retrasado con un loader elegante
const DelayedRender = ({ children, delay = 100 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Renderiza un loader moderno o el contenido real
  return isLoaded ? (
    children
  ) : (
    <ModernLoader>
      <PulseCircle />
    </ModernLoader>
  );
};

// Memoizamos los componentes hijo
const MemoizedStatusHeader = React.memo(StatusHeader);
const MemoizedStockCounter = React.memo(StockCounter);

// Registro global de productos en proceso de adición
if (!window.productsInProgress) {
  window.productsInProgress = new Set();
}

const ColumnasColoreadas = ({ onPrincipalClick }) => {
  const { tableId } = useidmesa();
  const [id_grupo, setid_grupo] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [detalle, setdatalle] = useState([]);
  
  // Estado para la última orden añadida
  const [lastAddedOrder, setLastAddedOrder] = useState(null);
  
  // Registro local de productos procesados para prevenir duplicados
  const processedProducts = useRef(new Set());
  
  // ANTI-DUPLICADOS: handleAdddetalle con verificación estricta
  const handleAdddetalle = useCallback((newProduct) => {
    if (!newProduct || !newProduct.id_detalle) {
      return;
    }
    
    const productId = newProduct.id_detalle.toString();
    
    // VERIFICACIÓN ANTI-DUPLICADOS:
    // 1. Verificar si está en procesamiento global
    // 2. Verificar si ya lo hemos procesado localmente
    if (window.productsInProgress.has(productId) || processedProducts.current.has(productId)) {
      return;
    }
    
    // Verificar si ya existe en detalle
    const alreadyExists = detalle.some(p => p.id_detalle === newProduct.id_detalle);
    if (alreadyExists) {
      return;
    }
    
    
    // Marcar como en procesamiento global
    window.productsInProgress.add(productId);
    
    // Marcar como procesado localmente
    processedProducts.current.add(productId);
    
    // Actualizar estados
    setdatalle(prevProducts => [...prevProducts, newProduct]);
    setLastAddedOrder(newProduct);
    
    // Limpiar después de un tiempo seguro
    setTimeout(() => {
      window.productsInProgress.delete(productId);
    }, 1000); // Mantener bloqueado por 1 segundo
  }, [detalle]);
  
  // Verificar si tenemos tableId al montar el componente
  useEffect(() => {
    if (!tableId) {
      console.warn('No tableId available, components may not load data correctly');
    }
  }, [tableId]);
  
  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      // Limpiar procesados locales
      processedProducts.current.forEach(id => {
        window.productsInProgress.delete(id);
      });
      processedProducts.current.clear();
    };
  }, []);
  
  // Usamos useCallback para evitar recreaciones de funciones
  const handleSetIdGrupo = useCallback((id) => {
    setid_grupo(id);
  }, []);

  const handleOrderSelect = useCallback((id) => {
    setSelectedOrderId(id);
  }, []);

  const handleQuantityChange = useCallback((value) => {
    if (selectedOrderId && value) {
      setQuantities(prev => ({
        ...prev,
        [selectedOrderId]: parseInt(value, 10)
      }));
    }
  }, [selectedOrderId]);

  // ANTI-DUPLICADOS: updateOrdersManually verifica duplicados
  const updateOrdersManually = useCallback((newOrder) => {
    if (!newOrder || !newOrder.id_detalle) {
      return;
    }
    
    const orderId = newOrder.id_detalle.toString();
    
    // Verificar si ya está procesado
    if (processedProducts.current.has(orderId)) {
      return;
    }
    
    // Marcar como procesado
    processedProducts.current.add(orderId);
    
    // Bloquear globalmente
    window.productsInProgress.add(orderId);
    
    // Actualizar estado
    setLastAddedOrder(newOrder);
    
    // Limpiar bloqueo después de un tiempo
    setTimeout(() => {
      window.productsInProgress.delete(orderId);
    }, 1000);
  }, []);

  // Memorizamos componentes pesados
  const memoizedOrderList = useMemo(() => (
    <OrderList
      quantities={quantities}
      onOrderSelect={handleOrderSelect}
      selectedOrderId={selectedOrderId}
      onAddEvent={handleAdddetalle}
      newOrder={lastAddedOrder}
    />
  ), [quantities, handleOrderSelect, selectedOrderId, handleAdddetalle, lastAddedOrder]);

  const memoizedGrupo = useMemo(() => (
    <Grupo setid_grupo={handleSetIdGrupo} />
  ), [handleSetIdGrupo]);
  
  const memoizedGruposBar = useMemo(() => (
    <GruposBar onAddEvent={handleAdddetalle}/>
  ), [handleAdddetalle]);
  
  const memoizedProductoventa = useMemo(() => (
    <Productoventa 
      id_grupo={id_grupo} 
      onAddEvent={handleAdddetalle}
      updateOrdersManually={updateOrdersManually}
    />
  ), [id_grupo, handleAdddetalle, updateOrdersManually]);
  
  const memoizedMenuComponent = useMemo(() => (
    <MenuComponent onPrincipalClick={onPrincipalClick} />
  ), [onPrincipalClick]);
  
  // Asegúrate de pasar selectedOrderId al componente NumericKeypad
  const memoizedNumericKeypad = useMemo(() => (
    <NumericKeypad 
      onQuantityChange={handleQuantityChange}
      initialQuantity={quantities[selectedOrderId] || ''}
      selectedOrderId={selectedOrderId} // Este prop es crucial para el autoguardado
    />
  ), [handleQuantityChange, quantities, selectedOrderId]);
  
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ContenedorRaiz>
        <Contenedor>
          {/* Columna Amarilla */}
          <Columna ancha>
            <SeccionAmarilla grande>
              <AmarilloSuperiorChico>
                <MemoizedStatusHeader />
              </AmarilloSuperiorChico>
              <AmarilloSuperiorGrande>
                {memoizedOrderList}
              </AmarilloSuperiorGrande>
            </SeccionAmarilla>
            <SeccionAmarilla>
              <CajaAmarillaInferior pequena>
                <MemoizedStockCounter />
              </CajaAmarillaInferior>
              <CajaAmarillaInferior oscuro>
                <DelayedRender delay={300}>
                  <ReceiptDisplay />
                </DelayedRender>
              </CajaAmarillaInferior>
            </SeccionAmarilla>
          </Columna>

          {/* Columna Verde */}
          <Columna>
            <CajaVerde>
              {memoizedMenuComponent}
            </CajaVerde>
            <CajaVerde oscuro>
              {memoizedNumericKeypad}
            </CajaVerde>
          </Columna>

          {/* Columna Roja */}
          <Columna ancha>
            <SeccionRoja superior>
              <CajaRoja reducida>
                {memoizedGruposBar}
              </CajaRoja>
              <CajaRoja>
                {memoizedGrupo}
              </CajaRoja>
            </SeccionRoja>
            <SeccionRoja>
              {memoizedProductoventa}
            </SeccionRoja>
          </Columna>
        </Contenedor>
      </ContenedorRaiz>
    </StyleSheetManager>
  );
};

export default React.memo(ColumnasColoreadas);