import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Printer, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ventaenviar } from '../../Api/TaskventaYdetalle';
import { useAuthStore, useidmesa, useIdVentaStore } from '../authStore';
import MediosDePagoPrincipal from '../Mediosdepago/Mediopagosprincipal';
import ConfirmationModal from '../ConfirmationModal';
import { mesaliberar } from '../../Api/Tasksalon';
// Importamos el componente PreFactura
import PreFactura from '../PDF/PreFactura/PreFactura';

// ========= STYLED COMPONENTS =========
const MenuContainer = styled.div`
  width: 13rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.25rem;
  box-shadow: 
    0 4px 20px -2px rgba(99, 102, 241, 0.1),
    0 2px 4px -1px rgba(99, 102, 241, 0.06);
  backdrop-filter: blur(10px);
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.875rem;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px -2px rgba(99, 102, 241, 0.3);
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px -2px rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
`;

const IconButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  background: rgba(245, 247, 255, 0.8);
  color: #6366F1;
  border-radius: 0.875rem;
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px -2px rgba(99, 102, 241, 0.05),
    inset 0 1px 2px rgba(255, 255, 255, 0.9);
  cursor: pointer;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 0.375rem;
    transition: transform 0.2s ease;
    stroke-width: 1.75;
  }

  span {
    font-size: 0.75rem;
    font-weight: 500;
    color: #4338CA;
  }

  &:hover {
    background: rgba(238, 242, 255, 0.9);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px -2px rgba(99, 102, 241, 0.15),
      inset 0 1px 2px rgba(255, 255, 255, 0.9);

    svg {
      transform: scale(1.1);
      color: #4F46E5;
    }
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    svg {
      transform: none;
    }
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.875rem;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
  box-shadow: 0 2px 10px -2px rgba(99, 102, 241, 0.3);
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px -2px rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Contenedor oculto para componentes de impresión
const HiddenContainer = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// ========= COMPONENT DEFINITION =========
const MenuComponent = ({ onPrincipalClick }) => {
  // ===== STATE AND HOOKS =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clientIdRef = useRef(window.clientInstanceId);
  
  // Estado para indicar carga durante operaciones
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar qué tipo de impresión se va a realizar
  const [printingType, setPrintingType] = useState(null);
  
  // Referencias a los componentes de impresión
  const preFacturaRef = useRef(null);
  
  // Obtener funciones del store de IDs de venta
  const { idVentas, addIdVenta, setPrintSource } = useIdVentaStore();

  const { tableId } = useidmesa();
  const authData = useAuthStore((state) => state.authData);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: ''
  });
  
  // Effect to set 'MenuComponent' as printSource when component mounts
  useEffect(() => {
    console.log('Setting print source to MenuComponent');
    setPrintSource('MenuComponent');
  }, [setPrintSource]);

  // ===== API FUNCTIONS =====
  const btnenviar = async() => {
    try {
      console.log(`Enviando orden para mesa ${tableId}`);
      const response = await ventaenviar({
        id_mesa: tableId, 
        id_navegador: clientIdRef.current
      });
      
      if (response && response.data && response.data.data) {
        return response.data.data;
      }
      
      return 0;
    } catch (error) {
      console.error("Error en btnenviar:", error);
      return 0;
    }
  };

  // Función para obtener datos para la pre-factura
  const obtenerDatosPreFactura = async() => {
    try {
      // Formato de fecha y hora más adecuado para la pre-factura
      const fechaActual = new Date();
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const fechaFormateada = fechaActual.toLocaleDateString('es-CO', options);
      const horaFormateada = fechaActual.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      });
      
      // Estos datos deberían venir de tu API en un caso real
      return {
        titulo: 'PREE FACTURA',
        empresa: 'TROY',
        bancoInfo: 'Bancolombia Ahorros',
        vendedor: authData?.nombre || 'ADMIN',
        mesa: tableId.toString(),
        fecha: fechaFormateada,
        hora: horaFormateada,
        items: [
          { cantidad: 1, producto: 'MOJICON DE QUESO', precio: 2000, total: 2000 }
        ],
        subtotal: 2000,
        servicio: 0,
        total: 2000
      };
    } catch (error) {
      console.error("Error al obtener datos para pre-factura:", error);
      // En caso de error, devolver estructura mínima para evitar errores en cascada
      return {
        titulo: 'PREE FACTURA',
        empresa: 'TROY',
        bancoInfo: 'Bancolombia Ahorros',
        vendedor: 'ADMIN',
        mesa: tableId?.toString() || '1',
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString(),
        items: [],
        subtotal: 0,
        servicio: 0,
        total: 0
      };
    }
  };

  // Función para imprimir la pre-factura directamente en la impresora COCINA
  const imprimirPreFactura = async() => {
    try {
      setIsLoading(true);
      setPrintingType('prefactura');
      
      // 1. Obtener los datos para la pre-factura
      const datosPreFactura = await obtenerDatosPreFactura();
      
      // 2. Verificar que tenemos acceso al componente
      if (!preFacturaRef.current) {
        throw new Error("No se pudo acceder al componente PreFactura");
      }
      
      // 3. Actualizar el componente PreFactura con los datos
      preFacturaRef.current.setReceiptData(datosPreFactura);
      
      // 4. Nombre de la impresora fijo: COCINA
      const nombreImpresora = "COCINA";
      
      // 5. Imprimir directamente con la impresora COCINA
      console.log(`Imprimiendo en impresora: ${nombreImpresora}`);
      
      const success = await preFacturaRef.current.printTicket(nombreImpresora);
      
      // 6. Verificar si la impresión fue exitosa
      if (success) {
        console.log(`Pre-factura impresa correctamente en ${nombreImpresora}`);
      } else {
        throw new Error(`Error al imprimir en la impresora ${nombreImpresora}`);
      }
    } catch (error) {
      console.error("Error al imprimir pre-factura:", error);
      alert(error.message || "Error al procesar la pre-factura. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async(action) => {
    switch(action) {
      case "Principal":
        onPrincipalClick();
  
        // Limpieza de caché para actualizaciones
        setTimeout(() => {
          if (window.tablesBySalonCache) {
            Object.keys(window.tablesBySalonCache).forEach(salonId => {
              delete window.tablesBySalonCache[salonId];
            });
            window.forceTableRefresh = true;
          }
        }, 300);
        break;
        
      case "Enviar":
        try {
          // Mostrar indicador de carga
          setIsLoading(true);
          
          // Establecer la fuente de impresión como MenuComponent
          setPrintSource('MenuComponent');
          
          // Llamar a la API para enviar la orden
          const response = await btnenviar();
          
          if (response > 0) {
            console.log(`Orden enviada con ID: ${response}`);
            
            // Añadir a la cola Y disparar la impresión inmediata
            addIdVenta(response);
            console.log("ID:",idVentas,response);
            
            try {
              // Actualizar caché si es necesario
              if (window.tablesBySalonCache) {
                Object.keys(window.tablesBySalonCache).forEach(salonId => {
                  delete window.tablesBySalonCache[salonId];
                });
              }
              
              // Navegar a la vista principal
              onPrincipalClick();
            } catch (updateError) {
              console.error("Error en procesamiento post-envío:", updateError);
              // Navegar de todos modos para no bloquear al usuario
              onPrincipalClick();
            }
          } else {
            console.error("La API no devolvió un ID de venta válido");
            alert("Error al enviar la orden. Por favor, inténtelo de nuevo.");
          }
        } catch (error) {
          console.error("Error al enviar orden:", error);
          alert("Error al enviar la orden. Por favor, inténtelo de nuevo.");
        } finally {
          // Ocultar indicador de carga
          setIsLoading(false);
        }
        break;
        
      case "Cobrar":
        setIsModalOpen(true);
        break;
        
      case "Liberar":
        setConfirmationModal({
          isOpen: true,
          action: "Liberar",
          title: "Liberar mesa",
          message: "¿Estás seguro que deseas liberar esta mesa? Esta acción no se puede deshacer."
        });
        break;
        
      case "Pre Factura":
        try {
          // Iniciar proceso de impresión de pre-factura
          await imprimirPreFactura();
        } catch (error) {
          console.error("Error al manejar pre-factura:", error);
        }
        break;
        
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  const handleConfirmAction = async() => {
    // Cerrar el modal de confirmación
    setConfirmationModal({ isOpen: false, action: null });

    // Mostrar indicador de carga
    setIsLoading(true);

    try {
      // Store tableId in a local variable to ensure it doesn't change during processing
      const currentTableId = tableId;
      
      console.log(`Liberando mesa ${currentTableId}...`);
      
      // Make API call with explicit mesero clearing
      const response = await mesaliberar({
        id: currentTableId,
        id_navegador: clientIdRef.current,
        mesero: '' // Explicitly clear the waiter
      });
      
      // After liberation is successful, ensure proper UI update
      if (response && response.data) {
        console.log(`Mesa ${currentTableId} liberada correctamente`);
        
        // Clear all salon caches to force refresh on return
        if (window.tablesBySalonCache) {
          Object.keys(window.tablesBySalonCache).forEach(salonId => {
            delete window.tablesBySalonCache[salonId];
          });
        }
        
        // Navigate back to main panel immediately
        onPrincipalClick();
      }
    } catch (error) {
      console.error("Error al liberar la mesa:", error);
      alert("Error al liberar la mesa. Por favor, inténtelo de nuevo.");
    } finally {
      // Ocultar indicador de carga
      setIsLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <MenuContainer>
      <PrimaryButton onClick={() => handleButtonClick('Principal')}>PRINCIPAL</PrimaryButton>
      <PrimaryButton onClick={() => handleButtonClick('Liberar')}>LIBERAR</PrimaryButton>

      <GridContainer>
        <IconButton onClick={() => handleButtonClick('Factura')}>
          <Printer />
          <span>Factura</span>
        </IconButton>
        <IconButton 
          onClick={() => handleButtonClick('Enviar')}
          disabled={isLoading}
        >
          <Send />
          <span>{isLoading ? 'Enviando...' : 'Enviar'}</span>
        </IconButton>
        <IconButton onClick={() => handleButtonClick('Cobrar')}>
          <DollarSign />
          <span>Cobrar</span>
        </IconButton>
        <IconButton 
          onClick={() => handleButtonClick('Pre Factura')}
          disabled={isLoading}
        >
          <Printer />
          <span>{isLoading && printingType === 'prefactura' ? 'Imprimiendo...' : 'Pre Factura'}</span>
        </IconButton>
      </GridContainer>

      <GridContainer>
        <ActionButton onClick={() => handleButtonClick('Dividir Cuenta')}>Dividir Cuenta</ActionButton>
        <ActionButton onClick={() => handleButtonClick('Domicilio')}>Domicilio</ActionButton>
      </GridContainer>
      
      {/* Modal de medios de pago */}
      <MediosDePagoPrincipal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        width="900px"
        height="650px"
        topRowHeight="250px"
        onPrincipalClick={onPrincipalClick} 
      />
      
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, action: null })}
        onConfirm={handleConfirmAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        themeColor="#6366F1"
      />
      
      {/* Componentes ocultos para impresión */}
      <HiddenContainer>
        {/* Componente PreFactura para impresión de pre-facturas */}
        <PreFactura ref={preFacturaRef} />
      </HiddenContainer>
    </MenuContainer>
  );
};

export default MenuComponent;