import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Receipt from '../PDF/Comanda/Ticket';
import { impresorainsertar, impresoramostrar } from '../../Api/TaskareaYimpresora';
import { useAuthStore, useserialPC } from '../authStore';

// Styled Components - Modified for top alignment with no spacing
const Container = styled.div`
  width: 100%;
  background-color: #F9FAFB;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 0;
  position: relative;
  top: 0;
`;

const Header = styled.div`
  padding: 8px 16px; /* Minimal padding */
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
    transform: rotate(30deg);
  }
`;

const Title = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
  text-align: center;
  position: relative;
  z-index: 2;
  line-height: 1.2;
`;

const PrinterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  padding: 10px;
  padding-top: 10px;
`;

const PrinterCard = styled.div`
  position: relative;
  padding: 16px 12px;
  background-color: white;
  border-radius: 8px;
  cursor: ${props => props.isSelecting ? 'wait' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: ${props => props.isActive 
    ? '0 8px 15px rgba(99, 102, 241, 0.18)' 
    : '0 2px 8px rgba(0, 0, 0, 0.03)'};
  transform: ${props => props.isActive ? 'translateY(-2px)' : 'none'};
  border: 1px solid ${props => props.isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.04)'};
  opacity: ${props => props.isSelecting ? 0.7 : 1};
  pointer-events: ${props => props.isSelecting ? 'none' : 'auto'};
  
  &:hover {
    box-shadow: ${props => props.isSelecting ? '0 2px 8px rgba(0, 0, 0, 0.03)' : '0 8px 15px rgba(99, 102, 241, 0.12)'};
    transform: ${props => props.isSelecting ? 'none' : props.isActive ? 'translateY(-2px)' : 'translateY(-2px)'};
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${props => props.isActive ? '3px' : '0'};
    background: linear-gradient(90deg, #6366F1, #8B5CF6);
    border-radius: 8px 8px 0 0;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::before {
    height: ${props => props.isSelecting ? '0' : '3px'};
  }
`;

const PrinterIcon = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' 
    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'};
  color: ${props => props.isActive ? 'white' : '#6366F1'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.isActive 
    ? '0 6px 15px rgba(99, 102, 241, 0.25)' 
    : '0 2px 6px rgba(0, 0, 0, 0.02)'};
  
  &:hover {
    transform: ${props => props.isSelecting ? 'none' : 'scale(1.05)'};
  }
`;

const PrinterName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 4px;
  word-break: break-word;
  line-height: 1.3;
`;

const PrinterType = styled.span`
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 8px;
`;

const InstalledButton = styled.button`
  font-size: 12px;
  padding: 4px 10px;
  background-color: ${props => props.isActive ? '#4F46E5' : '#E5E7EB'};
  color: ${props => props.isActive ? 'white' : '#6B7280'};
  border-radius: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  border: none;
  cursor: ${props => props.isSelecting ? 'wait' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: ${props => props.isActive 
    ? '0 3px 8px rgba(79, 70, 229, 0.25)' 
    : 'none'};
  opacity: ${props => props.isSelecting ? 0.7 : 1};
  pointer-events: ${props => props.isSelecting ? 'none' : 'auto'};
  
  &:hover {
    background-color: ${props => props.isSelecting ? props.isActive ? '#4F46E5' : '#E5E7EB' : props.isActive ? '#4F46E5' : '#D1D5DB'};
    transform: ${props => props.isSelecting ? 'none' : props.isActive ? 'scale(1.05)' : 'none'};
  }
`;

const LoadingSpinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spinner 0.8s linear infinite;
  margin-right: 6px;
  
  @keyframes spinner {
    to {transform: rotate(360deg);}
  }
`;

const ActiveBadge = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  background: ${props => props.isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};
  color: ${props => props.isActive ? '#6366F1' : 'transparent'};
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.isActive && `
    &::before {
      content: "";
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #6366F1;
    }
  `}
`;

const PrinterActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
  }
`;

const TestButton = styled(ActionButton)`
  background-color: #DBEAFE;
  color: #3B82F6;
  cursor: ${props => props.isSelecting ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isSelecting ? 0.6 : 1};
  pointer-events: ${props => props.isSelecting ? 'none' : 'auto'};
  padding: 6px 10px;
  
  &:hover {
    background-color: ${props => props.isSelecting ? '#DBEAFE' : '#BFDBFE'};
  }
  
  &:active {
    background-color: ${props => props.isSelecting ? '#DBEAFE' : '#93C5FD'};
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isSelecting ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isSelecting ? 0 : 0};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  pointer-events: ${props => props.isSelecting ? 'none' : 'auto'};
  
  ${PrinterCard}:hover & {
    opacity: ${props => props.isSelecting ? 0 : 1};
  }
  
  &:hover {
    background-color: ${props => props.isSelecting ? 'rgba(249, 250, 251, 0.8)' : '#FEE2E2'};
    color: ${props => props.isSelecting ? '#9CA3AF' : '#EF4444'};
    border-color: ${props => props.isSelecting ? 'rgba(0, 0, 0, 0.04)' : '#FEE2E2'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  }
`;

// Componentes adicionales modificados para alineación superior
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 15px;
  width: 100%;
  color: #6B7280;
`;

const Spinner = styled.div`
  width: 30px;
  height: 30px;
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-top: 2px solid #6366F1;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 14px;
  margin-top: 10px;
  color: #6B7280;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  padding: 12px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ErrorIcon = styled.div`
  color: #EF4444;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: #4B5563;
  margin-bottom: 12px;
  max-width: 400px;
`;

const RetryButton = styled.button`
  margin-top: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.25);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(99, 102, 241, 0.15);
  }
`;

const InstallContainer = styled.div`
  padding: 10px 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InstallIcon = styled.div`
  margin-bottom: 10px;
  color: #6366F1;
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2));
`;

const InstallInstructions = styled.div`
  margin: 6px 0 12px;
  font-size: 13px;
  color: #4B5563;
  text-align: left;
  width: 100%;
  max-width: 450px;
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const StepsList = styled.ol`
  padding-left: 20px;
  margin: 8px 0;
`;

const Step = styled.li`
  margin-bottom: 6px;
  line-height: 1.3;
  position: relative;
  
  &::marker {
    color: #6366F1;
    font-weight: 600;
  }
`;

const InstallButton = styled.button`
  margin-top: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.25);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(99, 102, 241, 0.15);
  }
  
  svg {
    margin-right: 6px;
  }
`;

const StatusContainer = styled.div`
  text-align: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
  gap: 6px;
  background-color: ${props => props.installed ? '#ECFDF5' : '#FEF2F2'};
  color: ${props => props.installed ? '#10B981' : '#EF4444'};
  border: 1px solid ${props => props.installed ? '#D1FAE5' : '#FEE2E2'};
  box-shadow: 0 2px 4px ${props => props.installed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  
  svg {
    flex-shrink: 0;
  }
`;

const StatusText = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: #6B7280;
  max-width: 300px;
`;

// Contenedor oculto para el componente Receipt
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

// Componente principal modificado
const ImpresorasInstaladas = ({idArea,serial}) => {
  // Añadimos la referencia al componente Receipt
  const receiptRef = useRef(null);
  const [impresoras, setImpresoras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { obtenerSerial } = useserialPC();
  const [impresoraseleccionada, setimpresoraseleccionada] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [instaladorInstalado, setInstaladorInstalado] = useState(false);
  const [verificandoInstalador, setVerificandoInstalador] = useState(true);
  // Estado para controlar si hay una selección en proceso
  const [isSelecting, setIsSelecting] = useState(false);

  
  // Función para obtener las impresoras seleccionadas
  const Fetdataimpresora = async () => {
    try {
      const serial = await obtenerSerial();
      
      const response = await impresoramostrar({
        serial: serial,
        id_area: idArea // Incluir id_area en la solicitud para filtrar por área
      });
      
      if (response.data && response.data.data) {
        // Asegurarse de que impresoraseleccionada sea siempre un array
        const impresoras = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        // Normalizar los nombres de las impresoras para evitar problemas de coincidencia
        const normalizedImpresoras = impresoras.map(imp => {
          // Si la impresora es un string directo en lugar de un objeto con propiedad 'impresora'
          if (typeof imp === 'string') {
            return { impresora: imp };
          }
          // Si la propiedad 'impresora' no existe pero hay alguna otra propiedad que podría contener el nombre
          else if (!imp.impresora && (imp.nombre || imp.name)) {
            return { impresora: imp.nombre || imp.name };
          }
          return imp;
        });
        
        setimpresoraseleccionada(normalizedImpresoras);
        
        // Si hay impresoras seleccionadas, establecer la primera como impresora actual para el ticket
        if (normalizedImpresoras.length > 0 && normalizedImpresoras[0].impresora) {
          setSelectedPrinter(normalizedImpresoras[0].impresora);
        }
      } else {
        // Si no hay impresoras seleccionadas para esta área, establecer array vacío
        setimpresoraseleccionada([]);
        setSelectedPrinter(null);
      }
    } catch (error) {
      console.error("Error al obtener impresoras seleccionadas:", error);
      // En caso de error, limpiar el estado
      setimpresoraseleccionada([]);
      setSelectedPrinter(null);
    }
  }

  // Función para verificar si el instalador está instalado
  const verificarInstalador = async () => {
    setVerificandoInstalador(true);
    try {
      // Intentar acceder a la URL de verificación
      const response = await fetch('http://localhost:5075/api/list')
        .catch(error => {
          console.error('Error al verificar instalador:', error);
          return { ok: false };
        });
      
      // Si la URL responde, el instalador está instalado
      setInstaladorInstalado(response.ok);
      
      // Si está instalado, proceder a buscar impresoras
      if (response.ok) {
        detectarImpresoras();
      } else {
        setCargando(false);
        setError("El servicio de impresoras de Troy no está ejecutándose o no está instalado.");
      }
    } catch (error) {
      console.error('Error al verificar instalador:', error);
      setInstaladorInstalado(false);
      setCargando(false);
      setError("No se pudo conectar con el servicio de impresoras de Troy.");
    } finally {
      setVerificandoInstalador(false);
    }
  };

  // Función para eliminar una impresora - actualizada para respuesta inmediata en UI
  const eliminarImpresora = async (event, impresoraNombre) => {
    event.stopPropagation(); // Evitar que el clic se propague al contenedor
    
    if (isSelecting) return; // No permitir eliminar mientras se está seleccionando
    
    if (window.confirm(`¿Está seguro que desea eliminar la impresora ${impresoraNombre}?`)) {
      // Actualizar inmediatamente la UI
      // Filtrar la impresora del array de seleccionadas
      const nuevasImpresorasSeleccionadas = impresoraseleccionada.filter(imp => {
        // Si es un objeto con propiedad impresora
        if (typeof imp === 'object' && imp.impresora) {
          return imp.impresora !== impresoraNombre;
        }
        // Si es directamente un string
        else if (typeof imp === 'string') {
          return imp !== impresoraNombre;
        }
        return true; // Mantener otros items que no coincidan con estos patrones
      });
      
      // Actualizar el estado local para reflejar inmediatamente el cambio en la UI
      setimpresoraseleccionada(nuevasImpresorasSeleccionadas);
      
      // Si la impresora eliminada era la seleccionada para el ticket,
      // actualizar a la primera disponible o null
      if (selectedPrinter === impresoraNombre) {
        if (nuevasImpresorasSeleccionadas.length > 0) {
          const primera = nuevasImpresorasSeleccionadas[0];
          setSelectedPrinter(typeof primera === 'object' ? primera.impresora : primera);
        } else {
          setSelectedPrinter(null);
        }
      }
      
      // En segundo plano, enviar la solicitud al servidor
      try {
        const serial = await obtenerSerial();
        // Aquí iría el código real para eliminar la impresora del servidor
        
        // Simular llamada a la API (reemplazar con la llamada real)
        // Por ejemplo: await eliminarImpresoraAPI({ id_area: idArea, impresora: impresoraNombre, serial });
      } catch (error) {
        console.error("Error al eliminar impresora del servidor:", error);
      }
    }
  };
  
  // Función para probar una impresora - MODIFICADA para usar el componente Receipt
  const probarImpresora = (event, impresoraNombre) => {
    event.stopPropagation(); // Evitar que el clic se propague al contenedor
    
    if (isSelecting) return; // No permitir probar mientras se está seleccionando
    
    // Verificar si la referencia al componente Receipt existe
    if (receiptRef.current) {
      
      // Llamar al método printTicket del componente Receipt
      receiptRef.current.printTicket(impresoraNombre);
    } else {
      console.error('No se pudo acceder al componente Receipt');
    }
  };

  // Función para detectar impresoras
  const detectarImpresoras = async () => {
    setCargando(true);
    try {
      // Hacer solicitud real a la API para obtener las impresoras
      const response = await fetch('http://localhost:5075/api/list')
        .catch(error => {
          console.error('Error al conectar con la API:', error);
          throw new Error('No se pudo conectar con el servicio de impresoras');
        });

      if (response.ok) {
        const data = await response.json();
        setImpresoras(data);
        
        // No llamamos a Fetdataimpresora aquí para reducir llamadas a la API
        // Se cargarán las impresoras seleccionadas solo al inicio del componente
      } else {
        throw new Error(`Error al obtener impresoras: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error al detectar impresoras:', err);
      setError(err.message || 'No se pudieron detectar las impresoras instaladas');
    } finally {
      setCargando(false);
    }
  };

  // Función para instalar el instalador
  const instalarAplicacion = () => {
    // Aquí iría el código para iniciar la instalación
    // Abrimos una ventana para la descarga del instalador
    window.open('https://drive.google.com/file/d/1pDs02DWAdm-3WIzo4sDOINk_z9p2_rd6/view?usp=sharing', '_blank');
    
    // Mostramos un mensaje después de iniciar la descarga
    alert('La descarga del instalador comenzará en breve. Una vez instalado, reinicie la página para conectar con el servicio de impresoras.');
    
    // Después de la instalación, volver a verificar
    setTimeout(verificarInstalador, 5000);
  };

  // Función modificada para manejar la selección de impresora
  const handleSelectPrinter = async (impresoraNombre) => {
    // Si ya está seleccionando, no hacer nada
    if (isSelecting) return;
    
    // Activar estado de selección
    setIsSelecting(true);
    
    try {
      // Actualizar inmediatamente el estado local para mejor experiencia de usuario
      setSelectedPrinter(impresoraNombre);
      
      // Reemplazar completamente el array de impresoras seleccionadas 
      // para asegurar que solo una impresora esté seleccionada a la vez
      setimpresoraseleccionada([{ impresora: impresoraNombre }]);
      
      // Opcionalmente, guardar en el servidor en segundo plano
      // sin bloquear la interfaz de usuario
      const serial = await obtenerSerial();
      impresorainsertar({
        id_area: idArea,
        impresora: impresoraNombre,
        serial: serial
      }).then(response => {
      }).catch(error => {
      });
    } catch (error) {
      console.error("Error al seleccionar impresora:", error);
    } finally {
      // Independientemente del resultado, desactivar estado de selección después de un breve retardo
      // para mejorar la experiencia visual
      setTimeout(() => {
        setIsSelecting(false);
      }, 500);
    }
  };

  // Función para refrescar manualmente la lista de impresoras
  const refrescarImpresoras = () => {
    detectarImpresoras();
  };

  // Función para verificar si una impresora está seleccionada
  const isPrinterSelected = (printerName) => {
    // Verificar que impresoraseleccionada es un array antes de usar .some
    if (!Array.isArray(impresoraseleccionada)) {
      console.warn('impresoraseleccionada no es un array:', impresoraseleccionada);
      return false;
    }
    
    // Comparación más flexible para encontrar coincidencias
    const isSelected = impresoraseleccionada.some(item => {
      // Verificar si item es un objeto con propiedad impresora
      if (item && typeof item === 'object' && item.impresora) {
        return item.impresora === printerName;
      }
      // Verificar si el ítem es directamente un string
      else if (typeof item === 'string') {
        return item === printerName;
      }
      // Si es otro tipo de objeto que podría tener el nombre en otra propiedad
      else if (item && typeof item === 'object') {
        const possibleName = item.nombre || item.name || '';
        return possibleName === printerName;
      }
      return false;
    });
    
    return isSelected;
  };

  // Efecto para verificar instalador al cargar inicialmente
  useEffect(() => {
    verificarInstalador();
  }, []);

  // Efecto para actualizar cuando cambia el id_area
  useEffect(() => {
    
    // Reiniciar estados
    setSelectedPrinter(null);
    setimpresoraseleccionada([]);
    
    // Cargar las impresoras seleccionadas para esta área
    const cargarImpresorasPorArea = async () => {
      try {
        // Mostrar estado de carga para mejor experiencia de usuario
        setCargando(true);
        
        // Cargar impresoras disponibles
        await detectarImpresoras();
        
        // Cargar impresoras seleccionadas para esta área específica
        await Fetdataimpresora();
      } catch (error) {
        console.error("Error al cargar impresoras para la nueva área:", error);
      } finally {
        setCargando(false);
      }
    };
    
    if (idArea) {
      cargarImpresorasPorArea();
    }
  }, [idArea]); // Este efecto se ejecutará cada vez que cambie idArea

  if (verificandoInstalador) {
    return (
      <Container>
        <Header>
          <Title>Impresoras</Title>
        </Header>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Verificando instalación...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (!instaladorInstalado) {
    return (
      <Container>
        <Header>
          <Title>Impresoras</Title>
        </Header>
        <InstallContainer>
          <StatusBadge installed={false}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            No instalado
          </StatusBadge>
          <StatusText>Servicio de impresoras de Troy no detectado</StatusText>
          
          <InstallIcon>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <line x1="6" y1="10" x2="18" y2="10"></line>
              <line x1="6" y1="14" x2="18" y2="14"></line>
              <path d="M19 10v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path>
              <path d="M12 16v5"></path>
              <path d="M9 18l3-3 3 3"></path>
            </svg>
          </InstallIcon>
          
          <InstallInstructions>
            Para utilizar impresoras en el sistema, debe instalar el servicio de impresoras de Troy:
            <StepsList>
              <Step>Descargue el instalador para su sistema operativo</Step>
              <Step>Ejecute el instalador con permisos de administrador</Step>
              <Step>Siga las instrucciones en pantalla para completar la instalación</Step>
              <Step>Reinicie su navegador después de la instalación</Step>
            </StepsList>
          </InstallInstructions>
          
          <InstallButton onClick={instalarAplicacion}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar Instalador
          </InstallButton>
        </InstallContainer>
      </Container>
    );
  }

  if (cargando && instaladorInstalado) {
    return (
      <Container>
        <Header>
          <Title>Impresoras</Title>
        </Header>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Detectando impresoras...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error && instaladorInstalado) {
    return (
      <Container>
        <Header>
          <Title>Impresoras</Title>
        </Header>
        <ErrorContainer>
          <ErrorIcon>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </ErrorIcon>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={refrescarImpresoras}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
            </svg>
            Reintentar
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Impresoras</Title>
      </Header>
      <PrinterGrid>
        {impresoras.map((impresora, index) => {
          // Determinar el tipo de impresora para mostrar el subtítulo adecuado
          let printerType = "Impresora estándar";
          if (impresora.name.includes("PDF")) {
            printerType = "Impresora virtual PDF";
          } else if (impresora.name.includes("POS")) {
            printerType = "Impresora de tickets";
          } else if (impresora.name.includes("OneNote")) {
            printerType = "Impresora virtual";
          }
          const isActive = isPrinterSelected(impresora.name);
          
          // Usar solo el estado de impresoraseleccionada para determinar si está activa,
          // ignorando selectedPrinter que es solo para el ticket
          
          return (
            <PrinterCard
              key={index} 
              isActive={isActive}
              isSelecting={isSelecting && !isActive}
              onClick={() => handleSelectPrinter(impresora.name)}
            >
              <DeleteButton 
                onClick={(e) => eliminarImpresora(e, impresora.name)}
                title="Eliminar impresora"
                isSelecting={isSelecting}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </DeleteButton>
              
              <PrinterIcon isActive={isActive} isSelecting={isSelecting}>
                {impresora.name.includes("PDF") ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                ) : impresora.name.includes("POS") ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <line x1="6" y1="10" x2="18" y2="10"></line>
                    <line x1="6" y1="14" x2="18" y2="14"></line>
                    <line x1="6" y1="18" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                )}
              </PrinterIcon>
              
              <PrinterName>
                {impresora.name}
              </PrinterName>
              
              <PrinterType>
                {printerType}
              </PrinterType>
              
              {/* Nuevo botón de "Instalada" con indicador de carga */}
              <InstalledButton 
                isActive={isActive}
                isSelecting={isSelecting}
                onClick={() => handleSelectPrinter(impresora.name)}
              >
                {isSelecting && !isActive ? (
                  <>
                    <LoadingSpinner />
                    Procesando...
                  </>
                ) : isActive ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Instalada
                  </>
                ) : "Instalar"}
              </InstalledButton>
              
              <PrinterActions>
                <TestButton 
                  onClick={(e) => probarImpresora(e, impresora.name)}
                  title="Enviar página de prueba"
                  isSelecting={isSelecting}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="13 17 18 12 13 7"></polyline>
                    <polyline points="6 17 11 12 6 7"></polyline>
                  </svg>
                  Probar
                </TestButton>
              </PrinterActions>
            </PrinterCard>
          );
        })}
      </PrinterGrid>
      
      {/* Colocamos el componente Receipt en un contenedor oculto */}
      <HiddenContainer>
        <Receipt 
          ref={receiptRef} 
          printerName={selectedPrinter}
        />
      </HiddenContainer>
    </Container>
  );
};

export default ImpresorasInstaladas;