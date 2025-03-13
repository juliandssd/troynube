import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Componentes estilizados con dimensiones reducidas
const Container = styled.div`
  background-color: white;
  padding: 1.25rem 1.5rem;
  max-width: ${props => props.width || '100%'};
  width: 80%;
  margin: 1.5rem auto;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-family: Arial, sans-serif;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-size: 1rem;
  color: #555555;
  font-family: Arial, sans-serif;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  align-items: flex-end;
  position: relative;
`;

// Añadir una clase de transición para inputs
const StyledInput = styled.input`
  width: 100%;
  border: none;
  padding: 0.25rem 0;
  font-size: 1rem;
  outline: none;
  background: ${props => props.isSelected ? '#f0f8ff' : 'transparent'};
  text-align: right;
  font-family: Arial, sans-serif;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:focus {
    background-color: #f0f8ff;
  }
`;

const Line = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${props => props.isSelected ? '#4361ee' : '#4361EE'};
  position: absolute;
  bottom: 0;
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  justify-content: center;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
  cursor: pointer;
`;

const RadioCircle = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${props => props.selected ? '#6366F1' : '#EEEEEE'};
  border: 1px solid ${props => props.selected ? '#6366F1' : '#DDDDDD'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadioDot = styled.div`
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background-color: white;
`;

const RadioLabel = styled.span`
  margin-left: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: Arial, sans-serif;
  color: ${props => props.selected ? '#6366F1' : '#4B5563'};
`;

const Dot = styled.span`
  font-size: 1.25rem;
  color: #D1D5DB;
  margin: 0 0.5rem;
`;

const BigText = styled.div`
  font-size: 1.75rem;
  color: ${props => props.highlighted ? '#6366F1' : '#4B5563'};
  font-weight: 600;
  font-family: Arial, sans-serif;
`;

const MediumText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.highlighted ? '#6366F1' : '#4B5563'};
  font-family: Arial, sans-serif;
`;

const Divider = styled.div`
  border-top: 1px solid #E5E7EB;
  margin: 0.75rem 0;
`;

// Contenedor del campo de cliente con posición relativa
const ClientInputGroup = styled.div`
  display: flex;
  border-radius: 0.5rem;
  overflow: visible; /* Cambiado de 'hidden' a 'visible' para permitir que el dropdown se muestre */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  width: 100%;
`;

const BottomInput = styled.input`
  flex: 1;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem 0 0 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  outline: none;
  font-family: Arial, sans-serif;
  
  &::placeholder {
    color: #6B7280;
  }
`;

const AddButton = styled.button`
  width: 2.5rem;
  background-color: #6366F1;
  color: white;
  border: none;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0 0.5rem 0.5rem 0;
`;

// Nuevos componentes para el dropdown de clientes - con posicionamiento absoluto mejorado
const ClientDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: calc(100% - 2.5rem); /* Ancho igual al input menos el botón */
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #D1D5DB;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  z-index: 100; /* Aumentado para asegurar que aparezca encima de otros elementos */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: -1px; /* Ajuste para eliminar espacio entre input y dropdown */
`;

const ClientItem = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  color: #000000; /* Color negro para el texto */
  
  &:hover {
    background-color: #F3F4F6;
  }
  
  &.selected {
    background-color: #EBF5FF;
    color: #4361ee;
    font-weight: 500;
  }
`;

const NoResultsMessage = styled.div`
  padding: 0.75rem;
  color: #6B7280;
  font-style: italic;
`;

// Componente principal
const PaymentInterface = ({
  totalAPagar, 
  propinaSugerida, 
  onPropinaChange,
  onFieldSelect,
  selectedField,
  onPaymentInfoChange,
  onClientSelect,
  efectivo: efectivoValue,
  datafono: datafonoValue,
  credito: creditoValue,
  propina: propinaValue,
  clientes = [],
  clienteId = null,     // ID del cliente seleccionado desde el componente padre
  clienteNombre = null, // Nombre del cliente seleccionado desde el componente padre
  id_venta = null       // ID de la venta
}) => {
  const handleKeyDown = (e, fieldName) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    const isNumeric = /^[0-9]$/.test(e.key);
    
    if (!isNumeric && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };
  
  // Estados
  const [cambio, setCambio] = useState(0);
  const [restante, setRestante] = useState('0');
  const [inputValue, setInputValue] = useState(clienteNombre || '');
  const [selectedOption, setSelectedOption] = useState();
  const [tipoPago, setTipoPago] = useState('');
  const [referenciaTarjeta, setReferenciaTarjeta] = useState('');
  
  // Cliente por defecto
  const DEFAULT_CLIENT = { id: 1, nombre: 'GENERICO' };
  
  // Asegurarse de tener un valor válido para cliente ID y nombre
  const safeClienteId = clienteId || 1;
  const safeClienteNombre = clienteNombre || 'GENERICO';
  
  // Estados para el dropdown de clientes
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedClientIndex, setSelectedClientIndex] = useState(-1);
  const [selectedCliente, setSelectedCliente] = useState({ 
    id: safeClienteId, 
    nombre: safeClienteNombre 
  });
  
  // Lista de clientes de ejemplo (esto debería venir como prop)
  const clientesDisponibles = clientes.length > 0 ? clientes : [
    { id: 1, nombre: "Juan Pérez" },
    { id: 2, nombre: "María García" },
    { id: 3, nombre: "Carlos Rodríguez" },
    { id: 4, nombre: "Ana Martínez" },
    { id: 5, nombre: "Luis Sánchez" },
    { id: 6, nombre: "Elena Torres" },
    { id: 7, nombre: "Pedro Ramírez" },
    { id: 8, nombre: "Sofía Flores" },
    { id: 9, nombre: "Diego López" },
    { id: 10, nombre: "Carmen Díaz" },
    { id: 11, nombre: "Julia Moreno" },
    { id: 12, nombre: "Julio Valdez" },
    { id: 13, nombre: "Julián Castro" }
  ];
  
  // Ref para el input de cliente y dropdown
  const clienteInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Función para formatear números
  const formatNumber = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    const number = parseInt(numericValue, 10);
    return number.toLocaleString('es-CO');
  };

  // Función para convertir valores formateados a números
  const parseFormattedNumber = (formattedValue) => {
    return formattedValue ? parseInt(formattedValue.replace(/\./g, ''), 10) : 0;
  };

  // Implementación de IdentificarElTipoDePago
  const identificarElTipoDePago = () => {
    try {
      let efectivo = 1;
      let tarjeta = 2;
      let credito = 4;
      
      const efectivoNumeric = parseFormattedNumber(efectivoValue);
      const datafonoNumeric = parseFormattedNumber(datafonoValue);
      const creditoNumeric = parseFormattedNumber(creditoValue);
      
      if (efectivoValue === '' || efectivoValue === '0' || efectivoNumeric === 0) {
        efectivo = 0;
      }
      
      if (datafonoValue === '' || datafonoValue === '0' || datafonoNumeric === 0) {
        tarjeta = 0;
      }
      
      if (creditoValue === '' || creditoValue === '0' || creditoNumeric === 0) {
        credito = 0;
      }
      
      const calculoIntegrado = efectivo + tarjeta + credito;
      let identificarElTipoPago = '';
      let referenciaTarjeta = '';
      
      if (calculoIntegrado === 1) {
        identificarElTipoPago = "EFECTIVO";
      } 
      else if (calculoIntegrado === 2) {
        if (selectedOption === 'Qr') {
          identificarElTipoPago = "QR";
        } 
        else if (selectedOption === 'Transfe') {
          identificarElTipoPago = "TRANSFERENCIA";
        } 
        else if (selectedOption === 'Nequi') {
          identificarElTipoPago = "NEQUI";
        } 
        else {
          identificarElTipoPago = "DATAFONO";
        }
        referenciaTarjeta = identificarElTipoPago;
      } 
      else if (calculoIntegrado === 4) {
        identificarElTipoPago = "CREDITO";
      } 
      else if (calculoIntegrado === 3) {
        identificarElTipoPago = "MIXTO";
        if (selectedOption === 'Qr') {
          referenciaTarjeta = "QR";
        } 
        else if (selectedOption === 'Transfe') {
          referenciaTarjeta = "TRANSFERENCIA";
        } 
        else if (selectedOption === 'Nequi') {
          referenciaTarjeta = "NEQUI";
        } 
        else {
          referenciaTarjeta = "DATAFONO";
        }
      } 
      else if (calculoIntegrado > 4) {
        identificarElTipoPago = "MIXTO";
        if (selectedOption === 'Qr') {
          referenciaTarjeta = "QR";
        } 
        else if (selectedOption === 'Transfe') {
          referenciaTarjeta = "TRANSFERENCIA";
        } 
        else if (selectedOption === 'Nequi') {
          referenciaTarjeta = "NEQUI";
        } 
        else {
          referenciaTarjeta = "DATAFONO";
        }
      } 
      else if (calculoIntegrado === 0) {
        identificarElTipoPago = "CORTESIA";
      }
      
      setTipoPago(identificarElTipoPago);
      setReferenciaTarjeta(referenciaTarjeta);
      
      return {
        tipoPago: identificarElTipoPago,
        referenciaTarjeta: referenciaTarjeta
      };
    } catch (error) {
      return {
        tipoPago: '',
        referenciaTarjeta: ''
      };
    }
  };

  // Función para calcular el restante
  const calcularRestante = () => {
    try {
      const efectivoNumeric = parseFormattedNumber(efectivoValue) || 0;
      const datafonoNumeric = parseFormattedNumber(datafonoValue) || 0;
      const creditoNumeric = parseFormattedNumber(creditoValue) || 0;
      
      let totalNumeric = 0;
      if (typeof totalAPagar === 'number') {
        totalNumeric = totalAPagar;
      } else if (typeof totalAPagar === 'string') {
        totalNumeric = parseFloat(totalAPagar.replace(/[^\d.-]/g, '')) || 0;
      }
      
      const totalPagado = efectivoNumeric + datafonoNumeric + creditoNumeric;
      
      let vueltoValue = 0;
      let restanteValue = 0;
      
      if (totalPagado >= totalNumeric) {
        vueltoValue = totalPagado - totalNumeric;
        restanteValue = 0;
      } else {
        vueltoValue = 0;
        restanteValue = totalNumeric - totalPagado;
      }
      
      const cambioFormateado = formatNumber(vueltoValue.toString());
      const restanteFormateado = formatNumber(restanteValue.toString());
      
      setCambio(cambioFormateado);
      setRestante(restanteFormateado);      
      
      return {
        cambio: cambioFormateado,
        restante: restanteFormateado
      };
    } catch (error) {
      return {
        cambio: '0',
        restante: '0'
      };
    }
  };

  // Manejadores de eventos para el cliente
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Filtrar clientes según el texto ingresado
    if (value.trim() === '') {
      setFilteredClientes(clientesDisponibles);
    } else {
      const filtered = clientesDisponibles.filter(
        cliente => cliente.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
    
    // Siempre mostrar el dropdown al escribir
    setShowDropdown(true);
    setSelectedClientIndex(-1);
  };
  
  // Manejar la selección de un cliente
  const handleClientSelect = (cliente) => {
    setInputValue(cliente.nombre);
    setShowDropdown(false);
    setSelectedCliente(cliente);
    
    if (typeof onClientSelect === 'function') {
      onClientSelect(cliente);
    }
  };
  
  // Manejar navegación con teclado en el dropdown
  const handleClientInputKeyDown = (e) => {
    if (!showDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedClientIndex(prev => 
          prev < filteredClientes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedClientIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedClientIndex >= 0 && selectedClientIndex < filteredClientes.length) {
          handleClientSelect(filteredClientes[selectedClientIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };
  
  // Manejar clic fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        clienteInputRef.current && 
        !clienteInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efecto para inicializar la lista filtrada de clientes
  useEffect(() => {
    setFilteredClientes(clientesDisponibles);
  }, []);
  
  // Efecto para actualizar el input cuando cambia el clienteNombre prop
  useEffect(() => {
    if (clienteNombre) {
      setInputValue(clienteNombre);
    }
    
    // Actualizar el cliente seleccionado si cambian las props
    if (clienteId || clienteNombre) {
      setSelectedCliente({
        id: clienteId || 1,
        nombre: clienteNombre || 'GENERICO'
      });
    }
  }, [clienteNombre, clienteId]);

  // Efecto para recalcular cuando cambien los valores
  useEffect(() => {
    const { cambio: cambioCalculado, restante: restanteCalculado } = calcularRestante();
    const paymentInfo = identificarElTipoDePago();
    
    // Asegurarse de que siempre tengamos un cliente válido
    const clienteInfo = selectedCliente || { id: safeClienteId, nombre: safeClienteNombre };
    
    // Asegurarse de que id_venta no sea null
    const safeIdVenta = id_venta || 0;
    
    if (typeof onPaymentInfoChange === 'function') {
      onPaymentInfoChange({
        efectivo: efectivoValue,
        datafono: datafonoValue,
        credito: creditoValue,
        cambio: cambioCalculado,
        restante: restanteCalculado,
        tipoPago: paymentInfo.tipoPago,
        referenciaTarjeta: paymentInfo.referenciaTarjeta,
        propina: propinaValue,
        totalAPagar: totalAPagar,
        // Solo propiedades desglosadas del cliente
        id_cliente: clienteInfo.id,
        nombre_cliente: clienteInfo.nombre,
        id_venta: safeIdVenta
      });
    }
  }, [efectivoValue, datafonoValue, creditoValue, propinaValue, totalAPagar, selectedOption, selectedCliente, safeClienteId, safeClienteNombre, id_venta]);

  return (
    <Container>
      {/* Efectivo */}
      <Row>
        <Label>Efectivo:</Label>
        <InputContainer>
          <StyledInput 
            value={efectivoValue}
            placeholder='0'
            isSelected={selectedField === 'efectivo'}
            onClick={() => onFieldSelect('efectivo')}
            onChange={(e) => {
              const formattedValue = formatNumber(e.target.value);
              if (typeof onFieldSelect === 'function') {
                onFieldSelect('efectivo', formattedValue);
              }
            }}
            onFocus={() => onFieldSelect('efectivo')}
            onKeyDown={(e) => handleKeyDown(e, 'efectivo')}
          />
          <Line isSelected={selectedField === 'efectivo'} />
        </InputContainer>
      </Row>

      {/* Datafono */}
      <Row>
        <Label>Datafono:</Label>
        <InputContainer>
          <StyledInput 
            value={datafonoValue}
            placeholder='0'
            isSelected={selectedField === 'datafono'}
            onClick={() => onFieldSelect('datafono')}
            onChange={(e) => {
              const formattedValue = formatNumber(e.target.value);
              if (typeof onFieldSelect === 'function') {
                onFieldSelect('datafono', formattedValue);
              }
            }}
            onFocus={() => onFieldSelect('datafono')}
            onKeyDown={(e) => handleKeyDown(e, 'datafono')}
          />
          <Line isSelected={selectedField === 'datafono'} />
        </InputContainer>
      </Row>

      {/* Opciones de pago */}
      <RadioGroup>
        {['Qr', 'Transfe', 'Nequi'].map((option, index) => (
          <React.Fragment key={option}>
            {index > 0 && <Dot>•</Dot>}
            <RadioOption onClick={() => setSelectedOption(option)}>
              <RadioCircle selected={selectedOption === option}>
                {selectedOption === option && <RadioDot />}
              </RadioCircle>
              <RadioLabel selected={selectedOption === option}>
                {option}
              </RadioLabel>
            </RadioOption>
          </React.Fragment>
        ))}
      </RadioGroup>

      {/* Crédito */}
      <Row>
        <Label>Credito:</Label>
        <InputContainer>
          <StyledInput 
            value={creditoValue}
            placeholder='0'
            isSelected={selectedField === 'credito'}
            onClick={() => onFieldSelect('credito')}
            onChange={(e) => {
              const formattedValue = formatNumber(e.target.value);
              if (typeof onFieldSelect === 'function') {
                onFieldSelect('credito', formattedValue);
              }
            }}
            onFocus={() => onFieldSelect('credito')}
            onKeyDown={(e) => handleKeyDown(e, 'credito')}
          />
          <Line isSelected={selectedField === 'credito'} />
        </InputContainer>
      </Row>

      {/* Propina */}
      <Row>
        <Label>Propina:</Label>
        <InputContainer>
          <StyledInput 
            placeholder='0'
            value={propinaValue}
            isSelected={selectedField === 'propina'}
            onClick={() => onFieldSelect('propina')}
            onChange={(e) => {
              const formattedValue = formatNumber(e.target.value);
              if (typeof onFieldSelect === 'function') {
                onFieldSelect('propina', formattedValue);
              }
              if (typeof onPropinaChange === 'function') {
                onPropinaChange(formattedValue);
              }
            }}
            onFocus={() => onFieldSelect('propina')}
            onKeyDown={(e) => handleKeyDown(e, 'propina')}
          />
          <Line isSelected={selectedField === 'propina'} />
        </InputContainer>
      </Row>

      {/* Cambio */}
      <Row>
        <BigText>Cambio:</BigText>
        <BigText highlighted>{cambio}</BigText>
      </Row>

      {/* Línea divisoria */}
      <Divider />

      {/* Restante */}
      <Row>
        <MediumText>Restante:</MediumText>
        <MediumText highlighted>{restante}</MediumText>
      </Row>

      {/* Campo de cliente con dropdown */}
      <ClientInputGroup>
        <BottomInput 
          ref={clienteInputRef}
          placeholder="Ingrese el cliente"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleClientInputKeyDown}
        />
        <AddButton>+</AddButton>
        
        {/* Dropdown de clientes - siempre visible cuando showDropdown es true */}
        {showDropdown && (
          <ClientDropdown ref={dropdownRef}>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente, index) => (
                <ClientItem
                  key={cliente.id}
                  className={index === selectedClientIndex ? 'selected' : ''}
                  onClick={() => handleClientSelect(cliente)}
                >
                  {cliente.nombre}
                </ClientItem>
              ))
            ) : (
              <NoResultsMessage>No se encontraron clientes</NoResultsMessage>
            )}
          </ClientDropdown>
        )}
      </ClientInputGroup>
    </Container>
  );
};

export default PaymentInterface;