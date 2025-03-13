import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { createPortal } from "react-dom";
// Corregir rutas de importación
// Verifica si estos archivos existen en estas ubicaciones
import Totalapagar from "./Totalapgar/Totalapagar";
import PaymentInterface from "./Campos/PaymentInterface";
import Teclado from "./Teclado/Teclado";
import { detalletotalapagar } from '../../Api/TaskventaYdetalle';
import { useidmesa } from '../authStore';
import ElectronicaButtonDemo from './Botonesdepago/ElectronicaButtonDemo';
import { empresaporcentajepropina } from '../../Api/Taskempresa';

const ModalPortal = ({ children }) => {
  return createPortal(children, document.body);
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  width: ${props => props.width || '800px'};
  height: ${props => props.height || '600px'};
  background: white;
  position: relative;
  z-index: 1000000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    width: 95vw;
    height: 95vh;
    max-height: ${props => props.height || '600px'};
  }
`;

const TopRow = styled.div`
  width: 100%;
  height: ${props => props.height || '200px'};
  padding: 25px;
  color: white;
  position: relative;
`;

const BottomRow = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
  position: relative;
`;

const Column = styled.div`
  flex: 1;
  padding: 5px;
  color: white;
  background-color: ${props => props.bgColor};
  position: relative;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Text = styled.p`
  color: white;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9333ea;
  font-weight: bold;
  font-size: 20px;
  transition: all 0.2s ease;
  z-index: 1;
  
  &:hover {
    transform: scale(1.1);
    background: white;
  }
`;

const MediosDePagoPrincipal = ({ 
  isOpen, 
  onClose,
  width = '800px',
  height = '600px',
  topRowHeight = '200px',
  onPrincipalClick 
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
  
  const { tableId } = useidmesa();
  const [total, setTotal] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [totalConPropina, setTotalConPropina] = useState(0);
  const [montoPropina, setMontoPropina] = useState(0);
  const [descuentoMonto, setDescuentoMonto] = useState(0); // Monto de descuento
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0); // Porcentaje de descuento
  const [esDescuentoMonto, setEsDescuentoMonto] = useState(true); // Tipo de descuento
  const [idventa, setidventa] = useState(null);
  const [idcliente, setidcliente] = useState(null);
  const [consecutivoweb,setconsecutivoweb]=useState(null);
  const [nombre, setnombre] = useState(null);
  const [clientes, setClientes] = useState([]); // Estado para almacenar la lista de clientes
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Estado para el cliente seleccionado
  
  // Estados para manejar la conexión entre teclado y campos de entrada
  const [selectedField, setSelectedField] = useState('efectivo'); // Campo seleccionado por defecto: 'efectivo'
  const [efectivo, setEfectivo] = useState('');
  const [datafono, setDatafono] = useState('');
  const [credito, setCredito] = useState('');
  const [propina, setPropina] = useState('');
  
  // Estado para almacenar información de pago para pasar a ElectronicaButtonDemo
  const [paymentInfo, setPaymentInfo] = useState({
    efectivo: '',
    datafono: '',
    credito: '',
    cambio: 0,
    restante: '0',
    tipoPago: '',
    referenciaTarjeta: '',
    propina: '',
    totalAPagar: 0,
    // Cliente desglosado, sin objeto cliente
    id_cliente: 1,
    nombre_cliente: 'GENERICO',
    id_venta: null
  });
  
  useEffect(() => {
    // Verificamos si el componente está abierto
    if (isOpen && tableId) {
      fetchData();
      // Aquí podríamos cargar la lista de clientes si viene de una API
      // fetchClientes();
    }
  }, [tableId, isOpen]);
  
  // Asegurarse de que el id_venta siempre se refleje en paymentInfo
  useEffect(() => {
    if (idventa) {
      setPaymentInfo(prevInfo => ({
        ...prevInfo,
        id_venta: idventa
      }));
    }
  }, [idventa]);
  
  // Asegurarse de que la información del cliente se refleje en paymentInfo
  useEffect(() => {
    if (clienteSeleccionado) {
      setPaymentInfo(prevInfo => ({
        ...prevInfo,
        id_cliente: clienteSeleccionado.id,
        nombre_cliente: clienteSeleccionado.nombre
      }));
    }
  }, [clienteSeleccionado]);

  // Función para cargar clientes (si se obtienen desde una API)
  // const fetchClientes = async () => {
  //   try {
  //     const response = await servicioClientes.obtenerClientes();
  //     setClientes(response.data);
  //   } catch (error) {
  //     console.error('Error al cargar clientes:', error);
  //   }
  // };

  const fetchData = async () => {
    try {
      // Obtener porcentaje de propina
      const porcentajePropina = await Porcentaje();
      
      // Obtener datos de la venta
      const response = await detalletotalapagar({id_mesa: tableId});
      const datos = response.data.data.Total;
      
      // Extraer id_venta y asegurarse de que no sea null
      const id_venta = response.data.data.id_venta || 0;
      
      const id_cliente = response.data.data.id_cliente || 1;
      const nombre_cliente = response.data.data.nombre || 'GENERICO';
      const conseweb=response.data.data.consecutivo;
      
      // Actualizar estados
      setidventa(id_venta);
      setidcliente(id_cliente);
      setnombre(nombre_cliente);
      setconsecutivoweb(conseweb);
      // Crear objeto cliente con valores seguros (para uso interno)
      const clienteInfo = {
        id: id_cliente,
        nombre: nombre_cliente
      };
      
      setClienteSeleccionado(clienteInfo);
      
      // Actualizar la información de pago con los datos del cliente y el id_venta
      setPaymentInfo(prevInfo => ({
        ...prevInfo,
        // Cliente desglosado
        id_cliente: id_cliente,
        nombre_cliente: nombre_cliente,
        id_venta: id_venta
      }));
      
      // Guardar datos originales
      setTotal(datos);
      
      // Calcular total con propina
      let subtotal = 0;
      
      // Determinar el subtotal según el tipo de dato recibido
      if (datos !== null && datos !== undefined) {
        if (typeof datos === 'number') {
          // Si datos es directamente un número
          subtotal = datos;
        } else if (typeof datos === 'string' && !isNaN(parseFloat(datos))) {
          // Si datos es un string que se puede convertir a número
          subtotal = parseFloat(datos);
        } else if (typeof datos === 'object') {
          // Si datos es un objeto, buscar propiedades
          if (datos.total && !isNaN(parseFloat(datos.total))) {
            subtotal = parseFloat(datos.total);
          } else if (datos.subtotal && !isNaN(parseFloat(datos.subtotal))) {
            subtotal = parseFloat(datos.subtotal);
          } else if (datos.monto && !isNaN(parseFloat(datos.monto))) {
            subtotal = parseFloat(datos.monto);
          }
        }
      }
      
      // Guardar el subtotal para cálculos futuros
      setSubtotal(subtotal);
      
      // Calcular propina
      const propinaCalculada = subtotal * (porcentajePropina / 100);
      setMontoPropina(propinaCalculada); // Guardar el monto de propina

      // Add this line to format and set the propina value:
      const propinaFormateada = formatNumber(Math.round(propinaCalculada).toString());
      setPropina(propinaFormateada);
      
      // Establecer el total con propina
      setTotalConPropina(subtotal + propinaCalculada);
      
    } catch (error) {
    }
  };

  const Porcentaje = async () => {
    try {
      const response = await empresaporcentajepropina({id: tableId});
      return response.data.data;
    } catch (error) {
      return 0; // Valor por defecto si hay error
    }
  }
  
  // Función para actualizar el total cuando cambia la propina manualmente
  const actualizarTotalConPropina = (nuevaPropina) => {
    // Si el campo de propina está vacío o es "0", volver al subtotal original
    if (!nuevaPropina || nuevaPropina === '0') {
      setMontoPropina(0);
      setTotalConPropina(subtotal - descuentoMonto);
      return;
    }
    
    // Convertir el valor formateado a número
    const propinaValue = parseFloat(nuevaPropina.replace(/\./g, ''));
    setMontoPropina(propinaValue);
    
    // Aplicar descuento al total con propina
    setTotalConPropina(subtotal + propinaValue - descuentoMonto);
  }
  
  // Nueva función para manejar cambios en el descuento
  const handleDiscountChange = (valorDescuento, esMonto) => {
    
    // Guardar el tipo de descuento
    setEsDescuentoMonto(esMonto);
    
    let montoDescuento = 0;
    let porcentajeDescuento = 0;
    
    if (esMonto) {
      // Es descuento por monto directo
      montoDescuento = Math.min(valorDescuento, subtotal); // No puede exceder el subtotal
      
      // Calcular el porcentaje equivalente (para referencia)
      if (subtotal > 0) {
        porcentajeDescuento = (montoDescuento / subtotal) * 100;
      }
    } else {
      // Es descuento por porcentaje
      porcentajeDescuento = Math.min(valorDescuento, 100); // No puede exceder 100%
      
      // Calcular el monto equivalente
      montoDescuento = (subtotal * porcentajeDescuento) / 100;
    }
    
    // Actualizar estados
    setDescuentoPorcentaje(porcentajeDescuento);
    setDescuentoMonto(montoDescuento);
    
    // Calcular el total después de descuento
    const subtotalConDescuento = subtotal - montoDescuento;
    
    // Luego sumar la propina al total con descuento
    const totalFinal = subtotalConDescuento + montoPropina;
    
    // Actualizar el total
    setTotalConPropina(totalFinal);
    
  };

  // Función para manejar la selección de un cliente
  const handleClientSelect = (cliente) => {
    setClienteSeleccionado(cliente);
    // Actualizar inmediatamente la información de pago con el nuevo cliente
    setPaymentInfo(prevInfo => ({
      ...prevInfo,
      // Cliente desglosado
      id_cliente: cliente.id,
      nombre_cliente: cliente.nombre
    }));
  };

  // Función para manejar la selección de un campo de entrada y su valor
  const handleFieldSelect = (fieldName, newValue) => {
    setSelectedField(fieldName);
    
    // Si se selecciona datafono o credito, colocar el valor restante automáticamente
    if (fieldName === 'datafono' || fieldName === 'credito') {
      // Calcular cuánto falta por pagar
      const efectivoValue = parseFloat(efectivo.replace(/\./g, '') || '0');
      const datafonoValue = parseFloat(datafono.replace(/\./g, '') || '0');
      const creditoValue = parseFloat(credito.replace(/\./g, '') || '0');
      
      let valorPagado = 0;
      
      // Sumar lo que ya está pagado, excluyendo el método de pago actual
      if (fieldName === 'datafono') {
        valorPagado = efectivoValue + creditoValue;
      } else if (fieldName === 'credito') {
        valorPagado = efectivoValue + datafonoValue;
      }
      
      // Calcular el valor restante
      const valorRestante = Math.max(0, totalConPropina - valorPagado);
      
      // Formatear y colocar el valor en el campo seleccionado
      const valorRestanteFormateado = formatNumber(valorRestante.toString());
      
      if (fieldName === 'datafono') {
        setDatafono(valorRestanteFormateado);
      } else if (fieldName === 'credito') {
        setCredito(valorRestanteFormateado);
      }
    }
    
    // Si se proporciona un nuevo valor desde el input del teclado físico
    if (newValue !== undefined) {
      switch (fieldName) {
        case 'efectivo':
          setEfectivo(newValue);
          break;
        case 'datafono':
          setDatafono(newValue);
          break;
        case 'credito':
          setCredito(newValue);
          break;
        case 'propina':
          setPropina(newValue);
          break;
        default:
          break;
      }
    }
  };

  // Función para recibir información de pago desde PaymentInterface
  const handlePaymentInfoChange = (info) => {
    // Asegurarse de preservar el id_venta si existe en el estado actual
    setPaymentInfo({
      ...info,
      id_venta: info.id_venta || idventa || 0
    });
  };

  // Formatear el número (función utilizada en varios lugares)
  const formatNumber = (value) => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Convertir a número y formatear con separadores de miles
    const number = parseInt(numericValue, 10);
    return number.toLocaleString('es-CO');
  };

  // Función para manejar la entrada del teclado numérico en pantalla
  const handleKeypadInput = (value) => {
    if (!selectedField) return; // Si no hay campo seleccionado, no hacer nada

    // Procesamiento según la tecla presionada
    if (value === 'Borrar') {
      // Borrar todo el valor del campo seleccionado
      switch (selectedField) {
        case 'efectivo':
          setEfectivo('');
          break;
        case 'datafono':
          setDatafono('');
          break;
        case 'credito':
          setCredito('');
          break;
        case 'propina':
          setPropina('');
          actualizarTotalConPropina('0');
          break;
        default:
          break;
      }
    } else if (value === '<--') {
      // Borrar el último carácter
      let currentValue = '';
      switch (selectedField) {
        case 'efectivo':
          currentValue = efectivo.replace(/\./g, '');
          setEfectivo(formatNumber(currentValue.slice(0, -1)));
          break;
        case 'datafono':
          currentValue = datafono.replace(/\./g, '');
          setDatafono(formatNumber(currentValue.slice(0, -1)));
          break;
        case 'credito':
          currentValue = credito.replace(/\./g, '');
          setCredito(formatNumber(currentValue.slice(0, -1)));
          break;
        case 'propina':
          currentValue = propina.replace(/\./g, '');
          const newValue = formatNumber(currentValue.slice(0, -1));
          setPropina(newValue);
          actualizarTotalConPropina(newValue);
          break;
        default:
          break;
      }
    } else {
      // Añadir dígito al final
      let currentValue = '';
      switch (selectedField) {
        case 'efectivo':
          currentValue = efectivo.replace(/\./g, '');
          setEfectivo(formatNumber(currentValue + value));
          break;
        case 'datafono':
          currentValue = datafono.replace(/\./g, '');
          setDatafono(formatNumber(currentValue + value));
          break;
        case 'credito':
          currentValue = credito.replace(/\./g, '');
          setCredito(formatNumber(currentValue + value));
          break;
        case 'propina':
          currentValue = propina.replace(/\./g, '');
          const newValue = formatNumber(currentValue + value);
          setPropina(newValue);
          actualizarTotalConPropina(newValue);
          break;
        default:
          break;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <ModalOverlay>
        <ModalContainer 
          onClick={e => e.stopPropagation()}
          width={width}
          height={height}
        >
          <CloseButton onClick={onClose} aria-label="Cerrar">
            ×
          </CloseButton>
          <TopRow height="10px">
            {/* El total ya tiene el descuento aplicado */}
            <Totalapagar total={totalConPropina} />
          </TopRow>
          
          <BottomRow>
            <Column>
              <PaymentInterface 
                totalAPagar={totalConPropina} 
                propinaSugerida={montoPropina}
                onPropinaChange={actualizarTotalConPropina}
                onFieldSelect={handleFieldSelect}
                selectedField={selectedField}
                efectivo={efectivo}
                datafono={datafono}
                credito={credito}
                propina={propina}
                onPaymentInfoChange={handlePaymentInfoChange}
                onClientSelect={handleClientSelect}
                clienteId={idcliente}
                clienteNombre={nombre}
                clientes={clientes}
              />
            </Column>
            
            <Column>
              {/* Pasar la función para manejar la entrada del teclado */}
              <Teclado 
                onDiscountChange={handleDiscountChange}
                onKeypadInput={handleKeypadInput}
              />
            </Column>
            
            <Column>
              {/* Pasar los datos de pago a ElectronicaButtonDemo */}
              <ElectronicaButtonDemo 
                paymentInfo={{
                  ...paymentInfo,
                  id_venta: paymentInfo.id_venta || idventa || 0,
                  id_cliente: paymentInfo.id_cliente || idcliente || 1,
                  nombre_cliente: paymentInfo.nombre_cliente || nombre || 'GENERICO'
                }}
                consecutivoweb={consecutivoweb}
                onPrincipalClick={onPrincipalClick}
              />
            </Column>
          </BottomRow>
        </ModalContainer>
      </ModalOverlay>
    </ModalPortal>
  );
};

export default MediosDePagoPrincipal;