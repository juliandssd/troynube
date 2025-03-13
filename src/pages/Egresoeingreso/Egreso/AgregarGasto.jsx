import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { gastoeliminar, gastomostraporidmovi, ventagastoconfirmar, ventagastoinsertar, ventagastomostrarmaximo } from '../../../Api/TaskventaYdetalle';
import { useAuthStore, useMovimientosStore } from '../../authStore';

// Utility functions for number formatting
const formatNumber = (value) => {
  if (!value) return '';
  
  // First, clean the input by keeping only digits and comma
  let cleanedValue = value.toString().replace(/[^\d,]/g, '');
  
  // If the input has a comma, handle it specially to maintain cursor position
  if (cleanedValue.includes(',')) {
    const parts = cleanedValue.split(',');
    // Format the integer part with thousand separators
    const integerPart = parts[0] ? parseInt(parts[0], 10).toLocaleString('es-ES').replace(/\./g, '.') : '0';
    // Keep the decimal part as is
    return integerPart + ',' + (parts[1] || '');
  }
  
  // If no comma, just format the integer with thousand separators
  if (cleanedValue) {
    // Parse as integer and format
    const number = parseInt(cleanedValue, 10);
    if (!isNaN(number)) {
      return number.toLocaleString('es-ES').replace(/,/g, '.');
    }
  }
  
  return cleanedValue;
};

const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return 0;
  
  // Remove dots and replace comma with dot for proper parsing
  const numericString = formattedValue.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(numericString) || 0;
};

// Utility functions for API data preparation
const cleanNumberForAPI = (formattedValue) => {
  if (!formattedValue) return '0';
  // Remove all dots and replace comma with dot for standard decimal
  return formattedValue.toString().replace(/\./g, '').replace(',', '.');
};

// Función para formatear números en la tabla con separador de miles
const formatNumberWithThousandSeparator = (value) => {
  if (value === undefined || value === null) return '0';
  
  // Convertir a número si no lo es
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  // Verificar si es un número válido
  if (isNaN(num)) return '0';
  
  // Comprobar si el número tiene parte decimal
  if (num % 1 === 0) {
    // Es un número entero, no mostrar decimales
    return num.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } else {
    // Formatear con separador de miles (punto) y decimal (coma)
    // Solo muestra decimales si existen
    return num.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
};

// Definición de todos los componentes estilizados
const FormContainer = styled.div`
  position: fixed;
  left: 40px;
  top: 40px;
  width: 550px;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 14px;
  font-family: Arial, sans-serif;
  z-index: 999;
  animation: slideIn 0.3s ease-out;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 6px;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(-40px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 1000;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const FormTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  color: #4b5563;
  margin: 0 0 12px 0;
  text-align: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
`;

const Label = styled.label`
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
  margin-bottom: 3px;
`;

const inputStyles = `
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: Arial, sans-serif;
  background-color: #f9fafb;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  
  &:hover {
    border-color: #d1d5db;
    background-color: #f5f6f7;
  }
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
  }
`;

// Mensaje de error
const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 11px;
  margin-top: 2px;
  font-weight: 500;
`;

// Components with error state
const Input = styled.input`
  ${inputStyles}
  height: 30px;
  border-color: ${props => props.hasError ? '#e53e3e' : '#e0e0e0'};
  text-transform: ${props => props.noUppercase ? 'none' : 'uppercase'};
  text-align: ${props => props.isNumber ? 'right' : 'left'};
  
  &:hover {
    border-color: ${props => props.hasError ? '#e53e3e' : '#d1d5db'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e53e3e' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(229, 62, 62, 0.12)' : 'rgba(99, 102, 241, 0.12)'};
  }
`;

const Select = styled.select`
  ${inputStyles}
  height: 30px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
  text-transform: uppercase;
  border-color: ${props => props.hasError ? '#e53e3e' : '#e0e0e0'};
  
  &:hover {
    border-color: ${props => props.hasError ? '#e53e3e' : '#d1d5db'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e53e3e' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(229, 62, 62, 0.12)' : 'rgba(99, 102, 241, 0.12)'};
  }
`;

const ProveedorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AddButton = styled.button`
  width: 28px;
  height: 28px;
  margin-left: 6px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }
  
  &:active {
    background-color: #e5e7eb;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0 2px 0;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #f9fafb;
  margin-right: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  
  &:checked {
    background-color: #6366f1;
    border-color: #6366f1;
  }
  
  &:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 3px;
    height: 7px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  &:hover {
    border-color: #9ca3af;
    background-color: #f3f4f6;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
  }
  
  &:checked:hover {
    background-color: #4f46e5;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  ${inputStyles}
  resize: none;
  height: 56px;
  border-color: ${props => props.hasError ? '#e53e3e' : '#e0e0e0'};
  
  &:hover {
    border-color: ${props => props.hasError ? '#e53e3e' : '#d1d5db'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e53e3e' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(229, 62, 62, 0.12)' : 'rgba(99, 102, 241, 0.12)'};
  }
`;

const ActionSection = styled.div`
  margin: 12px 0 8px 0;
  display: flex;
  justify-content: center;
  grid-column: 1 / -1;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 32px;
  font-size: 13px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.15);
  letter-spacing: 0.5px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.25)'};
    background: ${props => props.disabled ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 1px 3px rgba(139, 92, 246, 0.15)'};
  }
`;

// TABLA ACTUALIZADA: estilos modificados para coincidir con la imagen
const TableContainer = styled.div`
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  margin-top: 10px;
  margin-bottom: 15px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
`;

const TableHeader = styled.thead`
  background-color: #f1f3f5;
  
  & th {
    text-align: left;
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 600;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
  }
  
  & th:last-child {
    text-align: center;
    width: 50px;
  }
`;

const TableBody = styled.tbody`
  & tr {
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  & td {
    padding: 10px 15px;
    font-size: 14px;
    color: #495057;
    border-bottom: 1px solid #f1f3f5;
  }

  & td:nth-child(4) {
    text-align: right;
  }
  
  & td:last-child {
    text-align: center;
    padding: 5px;
  }
`;

const DeleteButton = styled.button`
  width: 24px;
  height: 24px;
  background-color: #fee2e2;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #b91c1c;
  font-size: 14px;
  
  &:hover {
    background-color: #fecaca;
    color: #dc2626;
  }
  
  &:active {
    background-color: #fca5a5;
    color: #b91c1c;
  }
`;

const EmptyTableMessage = styled.div`
  text-align: center;
  padding: 16px;
  color: #9ca3af;
  font-size: 13px;
`;

const FooterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

const RecordButton = styled.button`
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 28px;
  font-size: 13px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(6, 182, 212, 0.15);
  letter-spacing: 0.5px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.25)'};
    background: ${props => props.disabled ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 1px 3px rgba(6, 182, 212, 0.15)'};
  }
`;

const TotalDisplay = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #1f2937;
  padding: 4px 12px;
  background-color: #f3f4f6;
  border-radius: 6px;
`;

// Componentes de autocompletado
const InventoryFieldsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr auto auto;
  gap: 10px;
  grid-column: 1 / -1;
  margin-top: 5px;
`;

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const SuggestionItem = styled.li`
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-transform: uppercase;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

// Overlay para bloquear la interacción con el formulario
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

// Panel de pago - MODIFICADO para posicionarlo correctamente
const PaymentPanel = styled.div`
  position: fixed;
  top: 50%;
  left: 20%; // Ajustado a 20% para una posición óptima
  transform: translate(-50%, -50%);
  width: 460px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 20px;
  border: 1px dotted #ccc;
  z-index: 1000;
`;

const PaymentRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
`;

const PaymentLabel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 40px;
  margin-right: 10px;
`;

const PaymentIcon = styled.span`
  font-size: 16px;
  margin-right: 10px;
`;

const PaymentInput = styled.input`
  flex: 1;
  height: 34px;
  border: none;
  border-bottom: 1px solid #42a942;
  font-size: 18px;
  text-align: right;
  outline: none;
  padding: 5px;
  
  &:focus {
    border-bottom: 2px solid #42a942;
  }
`;

const PaymentReadOnly = styled.div`
  flex: 1;
  height: 34px;
  font-size: 18px;
  text-align: right;
  padding: 5px;
  color: #555;
`;

const PaymentSubLabel = styled.div`
  font-size: 16px;
  color: #777;
  margin-right: 10px;
  width: 120px;
  text-align: right;
`;

const PayButton = styled.button`
  background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 40px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
  display: block;
  margin: 25px auto 10px auto;
  
  &:hover {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(33, 150, 243, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Productos de ejemplo para autocompletado
const PRODUCTOS_EJEMPLO = [
];

// Main component
const FormularioGasto = ({ onClose }) => {
  const { fetchMovimientos, setupPusher, movimientos } = useMovimientosStore();
  const authData = useAuthStore((state) => state.authData);
  const [idventa, setidventa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  
  // Estado para el panel de pago
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    efectivo: '',
    tarjeta: '',
    credito: '',
    cambio: 0,
    restante: 0
  });
  
  // NEW - Estados para controlar operaciones en progreso
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    date: '2025-03-07',
    client: 'Empresa ABC S.A.',
    invoiceType: 'No electronica',
    generalExpense: 'Compras',
    provider: 'Distribuidora XYZ',
    useInventory: true,
    total: '1.700',
    detail: 'Compra de equipos informáticos para el departamento de ventas',
    // Usamos descripcion como variable común para product y descripcion
    descripcion: '',
    cantidad: '1',
    costo: '',
    id_producto: 0 // Agregado el id_producto
  });

  // Estado para los errores de validación
  const [errors, setErrors] = useState({
    date: '',
    client: '',
    provider: '',
    detail: '',
    total: '',
    descripcion: '',
    cantidad: '',
    costo: ''
  });
  
  // Refs para el enfoque automático
  const efectivoInputRef = useRef(null);

  // Estado para controlar si el formulario ha sido enviado
  const [submitted, setSubmitted] = useState(false);

  // MODIFICADO: Inicializar tableItems como un array vacío
  const [tableItems, setTableItems] = useState([]);
  
  // MODIFICADO: Inicializar totalAmount en 0
  const [totalAmount, setTotalAmount] = useState(0);

// CORREGIDO
useEffect(() => {
  if (!authData || !authData[0]) return;
  
  console.log("Fetching movimientos with authData:", authData[0]);
  fetchMovimientos(authData[0]);
  
  const cleanupPusher = setupPusher(authData[0]);
  return () => {
    if (cleanupPusher && typeof cleanupPusher === 'function') {
      cleanupPusher();
    }
  };
}, [authData, fetchMovimientos, setupPusher]);

  // Manejar cambios en el formulario de pago
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    
    // Solo permitir números y punto decimal
    if (value && !/^[0-9]*\.?[0-9]*$/.test(value)) {
      return;
    }
    
    // Actualizar el valor
    setPaymentForm(prev => {
      const updatedForm = {
        ...prev,
        [name]: value
      };
      
      // Calcular cambio y restante
      const total = totalAmount;
      const pagado = (parseFloat(updatedForm.efectivo) || 0) + 
                     (parseFloat(updatedForm.tarjeta) || 0) + 
                     (parseFloat(updatedForm.credito) || 0);
      
      if (pagado >= total) {
        updatedForm.cambio = (pagado - total).toFixed(2);
        updatedForm.restante = 0;
      } else {
        updatedForm.cambio = 0;
        updatedForm.restante = (total - pagado).toFixed(2);
      }
      
      return updatedForm;
    });
  };
  
  // FIXED - Procesar el pago
  const handleProcessPayment = async () => {
    if (isProcessingPayment) return; // Evitar múltiples clicks
    
    setIsProcessingPayment(true);
    try {
      if (paymentForm.restante === 0) {
        const data = {
          id_venta: idventa,
          id_movi: movimientos.data,
          efectivo: parseFloat(paymentForm.efectivo) || 0,
          tarjeta: parseFloat(paymentForm.tarjeta) || 0,
          credito: parseFloat(paymentForm.credito) || 0,
          id_empresa: authData[1]
        };
        const response = await ventagastoconfirmar(data);
        
        if (response.data.data > 0) {
          // Nota: Cambiado de onclose a onClose (corregido)
          setidventa(0);
          onClose();
        } else {
          console.warn("La API no devolvió un resultado positivo:", response.data);
          alert("No se pudo procesar el pago. Intente nuevamente.");
        }
      } else {
        alert("El pago debe ser completo para continuar.");
      }
    } catch (error) {
      console.error("Error procesando pago:", error);
      alert(`Error al procesar el pago: ${error.message || "Error desconocido"}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Enhanced useEffect for gastomostraporidmovi - ESTE SEGUNDO
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Checking if we can fetch expense data, movimientos:", movimientos);
        // Only fetch if we have a valid movement ID
        if (movimientos && movimientos.data) {
          console.log("Starting to fetch expense data for id_movi:", movimientos.data);
          setLoading(true);
          setLoadingError(null);
          
          const response = await gastomostraporidmovi({id_movi: idventa});
          console.log("Expense data fetched successfully:", response);
          
          // Debug - log the entire response to see ALL field names
          console.log("Full API response:", response.data);
          
          if (!response || !response.data) {
            console.error("Invalid response format:", response);
            setLoading(false);
            setLoadingError("Error: Respuesta inválida del servidor");
            return;
          }
          
          // Transform data more carefully
          const transformedItems = Array.isArray(response.data.data) 
            ? response.data.data.map(item => {
                // Try multiple fields that might contain the total value
                let totalValue = 0;
                
                // Try parsing importe first
                if (item.importe !== undefined && item.importe !== null) {
                  const parsed = parseFloat(item.importe);
                  if (!isNaN(parsed)) totalValue = parsed;
                }
                
                // If total is still 0, try other possible field names
                if (totalValue === 0 && item.Importe !== undefined) {
                  const parsed = parseFloat(item.Importe);
                  if (!isNaN(parsed)) totalValue = parsed;
                }
                
                // If total is still 0, try the Total field (might be formatted)
                if (totalValue === 0 && item.Total !== undefined) {
                  // Remove any currency symbol and thousand separators
                  const cleaned = String(item.Total).replace(/[$,]/g, '');
                  const parsed = parseFloat(cleaned);
                  if (!isNaN(parsed)) totalValue = parsed;
                }
                
                return {
                  id: item.id_gasto || 0,
                  producto: item.producto || '',
                  detalle: item.Descripcion || item.Operacion || '',
                  cantidad: item.cantidad || 1,
                  total: totalValue
                };
              })
            : [];
          
          console.log("Transformed items:", transformedItems);
          setTableItems(transformedItems);
          
          // Calculate total amount
          const calculatedTotal = transformedItems.reduce((sum, item) => sum + (item.total || 0), 0);
          console.log("Calculated total:", calculatedTotal);
          setTotalAmount(calculatedTotal);
          
          setLoading(false);
        } else {
          console.log("No movimientos.data available yet, skipping fetch");
          // Si no hay movimientos.data, no mantener el estado de carga
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching expense data:", error);
        setLoading(false);
        setLoadingError(`Error al cargar datos: ${error.message || "Error desconocido"}`);
      }
    };
    
    fetchData();
  }, [movimientos]);
  
  // useEffect para obtener el ID de venta máximo
  useEffect(() => {
    const fetchMaxId = async () => {
      try {
        if (movimientos && movimientos.data) {
          console.log("Fetching max sale ID for id_movi:", movimientos.data);
          const response = await ventagastomostrarmaximo({id_movi: movimientos.data});
          console.log("Max sale ID response:", response.data);
          if (response.data && response.data.data) {
            setidventa(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching max sale ID:", error);
      }
    };
    
    fetchMaxId();
  }, [movimientos]);

  // Función para validar un campo específico
  const validateField = (name, value) => {
    let errorMessage = '';
    
    console.log(`Validando campo ${name} con valor "${value}"`);
    
    switch(name) {
      case 'date':
        if (!value) {
          errorMessage = 'La fecha es requerida';
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            errorMessage = 'Formato de fecha inválido';
          }
        }
        break;
      
      case 'client':
        if (!value.trim()) {
          errorMessage = 'El cliente es requerido';
        }
        break;
      
      case 'provider':
        if (!value.trim()) {
          errorMessage = 'El proveedor es requerido';
        }
        break;
      
      case 'total':
        if (!formData.useInventory && !value.trim()) {
          errorMessage = 'El total es requerido';
        } else if (value) {
          const numericValue = parseFormattedNumber(value);
          if (isNaN(numericValue) || numericValue <= 0) {
            errorMessage = 'Debe ser un número positivo';
          }
        }
        break;
      
      case 'descripcion':
        if (!value.trim()) {
          errorMessage = formData.useInventory ? 
            'La descripción es requerida' : 
            'El producto es requerido';
        }
        break;
      
      case 'cantidad':
        if (formData.useInventory) {
          if (!value.trim()) {
            errorMessage = 'La cantidad es requerida';
          } else {
            const cantidad = parseInt(value);
            if (isNaN(cantidad) || cantidad <= 0) {
              errorMessage = 'Debe ser un número entero positivo';
            }
          }
        }
        break;
      
      case 'costo':
        if (formData.useInventory) {
          if (!value.trim()) {
            errorMessage = 'El costo es requerido';
          } else {
            const costo = parseFormattedNumber(value);
            if (isNaN(costo) || costo <= 0) {
              errorMessage = 'Debe ser un número positivo';
            }
          }
        }
        break;
      
      default:
        break;
    }
    
    console.log(`Resultado validación ${name}: ${errorMessage || 'VÁLIDO'}`);
    return errorMessage;
  };

  // Función para validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Campos obligatorios para todos los casos
    const requiredFields = ['date', 'client', 'provider'];
    
    // Agregar campos adicionales según si usa inventario o no
    if (formData.useInventory) {
      // Si hay elementos en la tabla, no es necesario validar los campos de inventario
      if (tableItems.length === 0) {
        requiredFields.push('descripcion', 'cantidad', 'costo');
      }
    } else {
      // Si hay elementos en la tabla, no es necesario validar los campos de producto y total
      if (tableItems.length === 0) {
        requiredFields.push('descripcion', 'total');
      }
    }
    
    // Validar todos los campos requeridos
    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      } else {
        newErrors[field] = '';
      }
    }
    
    setErrors(prevErrors => ({
      ...prevErrors,
      ...newErrors
    }));
    
    return isValid;
  };

  // UPDATED - Función para eliminar un item de la tabla
  const handleDeleteItem = async (itemId, itemTotal) => {
    // Evitar múltiples eliminaciones simultáneas
    if (isDeletingItem) return;
    
    // Mostrar mensaje de confirmación
    const confirmDelete = window.confirm("¿Está seguro que desea eliminar este item?");
    
    // Si el usuario cancela, no hacer nada
    if (!confirmDelete) {
      return;
    }
    
    setIsDeletingItem(true);
    try {
      const response = await gastoeliminar({id_gasto: itemId});
      
      if (response.data.data > 0) {
        setTableItems(prevItems => prevItems.filter(item => item.id !== itemId));
        
        // Actualizar el total restando el valor del item eliminado
        setTotalAmount(prevTotal => prevTotal - itemTotal);
      } else {
        console.warn("La API no devolvió un resultado positivo:", response.data);
        alert("No se pudo eliminar el ítem. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      alert(`Error al eliminar el ítem: ${error.message || "Error desconocido"}`);
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Función para filtrar productos según lo que escribe el usuario
  const getProductSuggestions = (query) => {
    if (!query.trim()) return [];
    
    const lowerCaseQuery = query.toLowerCase();
    return PRODUCTOS_EJEMPLO.filter(product => 
      product.nombre.toLowerCase().includes(lowerCaseQuery)
    );
  };
  
  // Función para manejar la selección de un producto de la lista
  const handleSelectProduct = (product) => {
    setFormData({
      ...formData,
      descripcion: product.nombre.toUpperCase(),
      costo: formatNumber(product.costo.toString()),
      id_producto: product.id // Guardar el id del producto seleccionado
    });
    
    // Limpiar errores
    setErrors({
      ...errors,
      descripcion: '',
      costo: ''
    });
  };

  useEffect(() => {
    // Cerrar con tecla ESC
    const handleEscKey = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Log para depuración
    console.log(`handleChange: name=${name}, value=${value}, type=${type}`);
    
    // Manejar valores formateados para campos numéricos
    let newValue;
    
    if (type === 'checkbox') {
      newValue = checked;
    } else if (name === 'total' || name === 'costo') {
      // Para campos numéricos, validar que sean sólo números, comas y puntos
      const isValidInput = /^[0-9.,]*$/.test(value);
      if (!isValidInput && value !== '') {
        return; // No actualizar si contiene caracteres inválidos
      }
      
      // Aplicar formato de miles sólo cuando el usuario termine de escribir
      newValue = value;
      
      // Formateamos solo cuando hay al menos un dígito
      if (value.length > 0 && /\d/.test(value)) {
        newValue = formatNumber(value);
      }
    } else if (name === 'detail') {
      // Para el campo detail, mantener el valor tal cual (sin convertir a mayúsculas)
      newValue = value;
    } else if (type === 'select-one') {
      // Para elementos select, mantener el valor exacto (sin convertir a mayúsculas)
      newValue = value;
    } else {
      // Para otros campos, convertir a mayúsculas
      newValue = value.toUpperCase();
    }
    
    console.log(`Setting formData[${name}] to: ${newValue}`);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
    
    // Si cambiamos useInventory, limpiamos los errores correspondientes
    if (name === 'useInventory') {
      setErrors({});
    }
  };

  // UPDATED - handleSave con manejo de estado de carga
  const handleSave = async () => {
    // Evitar múltiples envíos
    if (isSavingItem) return;
    
    // Determinar qué campos validar según el modo (inventario o no)
    const fieldsToValidate = formData.useInventory 
      ? ['descripcion', 'cantidad', 'costo'] 
      : ['descripcion', 'total'];
    
    // Validar campos relevantes
    const newErrors = {};
    let isValid = true;
    
    console.log('Validando campos para GUARDAR:', fieldsToValidate);
    
    for (const field of fieldsToValidate) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
        console.log(`Error en ${field}: ${error}`);
      } else {
        newErrors[field] = '';
        console.log(`Campo ${field} válido`);
      }
    }
    
    // Actualizar el estado de errores
    setErrors(newErrors);
    
    // Log el resultado de la validación
    console.log('Resultado de validación:', isValid ? 'Válido' : 'Inválido');
    
    // Si no es válido, no continuar
    if (!isValid) return;
    
    setIsSavingItem(true);
    try {
      if (formData.useInventory) {
        // Usar los campos de inventario
        const costo = parseFormattedNumber(formData.costo);
        const cantidad = parseInt(formData.cantidad) || 1;
        const totalItem = costo * cantidad;
        
        const data = {
          id_movi: movimientos.data,
          tipofactura: formData.invoiceType,
          id_proveedor: 0,
          cliente: formData.client,
          id_venta: idventa,
          inventario: formData.useInventory,
          total: cleanNumberForAPI(formData.costo),
          descripcion: formData.descripcion,
          id_producto: formData.id_producto,
          detalle: formData.detail,
          cantidad: cantidad.toString()
        };
        
        console.log("Guardando item con datos:", data);
        
        // Llamar a la API para guardar
        const response = await ventagastoinsertar(data);
        
        if (response.data && response.data.idgasto > 0) {
          // Si se guardó correctamente, actualizar el ID de venta
          if (response.data.idventa) {
            setidventa(response.data.idventa);
          }
          
          // Crear nuevo item para la tabla
          const newItem = {
            id: response.data.idgasto,
            producto: formData.descripcion,
            detalle: formData.detail,
            cantidad: cantidad,
            total: totalItem,
            id_producto: formData.id_producto
          };
          
          // Actualizar tabla y total
          setTableItems(prevItems => [...prevItems, newItem]);
          setTotalAmount(prevTotal => prevTotal + totalItem);
          
          // Limpiar campos
          setFormData(prevData => ({
            ...prevData,
            descripcion: '',
            cantidad: '1',
            costo: '',
            id_producto: 0
          }));
          
          // Limpiar errores
          setErrors({});
        } else {
          console.warn("La API no devolvió un ID de gasto válido:", response.data);
          alert("No se pudo guardar el ítem. Intente nuevamente.");
        }
      } else {
        // Parsear el total formateado
        const totalValue = parseFormattedNumber(formData.total);
        
        // Usar los campos originales para no-inventario
        const data = {
          id_movi: movimientos.data,
          tipofactura: formData.invoiceType,
          id_proveedor: 0,
          cliente: formData.client,
          id_venta: idventa,
          inventario: formData.useInventory,
          total: cleanNumberForAPI(formData.total),
          descripcion: formData.descripcion,
          id_producto: formData.id_producto,
          detalle: formData.detail,
          cantidad: '1'
        };
        
        console.log("Guardando item sin inventario con datos:", data);
        
        // Llamar a la API
        const response = await ventagastoinsertar(data);
        
        if (response.data && response.data.idgasto > 0) {
          // Si se guardó correctamente, actualizar el ID de venta
          if (response.data.idventa) {
            setidventa(response.data.idventa);
          }
          
          // Crear nuevo item para la tabla
          const newItem = {
            id: response.data.idgasto,
            producto: formData.descripcion,
            detalle: formData.detail,
            cantidad: 1,
            total: totalValue,
            id_producto: formData.id_producto
          };
          
          // Actualizar tabla y total
          setTableItems(prevItems => [...prevItems, newItem]);
          setTotalAmount(prevTotal => prevTotal + totalValue);
          
          // Limpiar campos
          setFormData(prevData => ({
            ...prevData,
            descripcion: '',
            total: '',
            id_producto: 0
          }));
          
          // Limpiar errores
          setErrors({});
        } else {
          console.warn("La API no devolvió un ID de gasto válido:", response.data);
          alert("No se pudo guardar el ítem. Intente nuevamente.");
        }
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      alert(`Error al guardar: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSavingItem(false);
    }
  };

  // UPDATED - handleSubmit con manejo de estado de carga
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiples envíos
    if (isSubmittingForm) return;
    
    // Verificar si hay filas en la tabla
    if (tableItems.length === 0) {
      alert("Debe agregar al menos un ítem a la factura");
      return;
    }
    
    setIsSubmittingForm(true);
    try {
      // Validar el formulario completo antes de enviar
      if (validateForm()) {
        // Mostrar el panel de pago
        setShowPaymentPanel(true);
        
        // Inicializar el formulario de pago con el total
        setPaymentForm({
          efectivo: '',
          tarjeta: '',
          credito: '',
          cambio: 0,
          restante: totalAmount.toFixed(2)
        });
        
        // Enfocar el campo de efectivo
        setTimeout(() => {
          if (efectivoInputRef.current) {
            efectivoInputRef.current.focus();
          }
        }, 100);
      } else {
        setSubmitted(true);
        console.log("Formulario inválido, mostrando errores...");
      }
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      alert(`Error al procesar: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Verificar si hay elementos en la tabla
  const hasItemsInTable = tableItems.length > 0;
  
  // Solo requerimos elementos en la tabla para habilitar el botón GRABAR FACTURA
  const isFormValid = () => {
    return hasItemsInTable;
  };
  
  // No necesitamos deshabilitar el botón GUARDAR ya que la validación ocurre al hacer clic
  const canSaveItem = () => {
    return !isSavingItem && !isDeletingItem && !isSubmittingForm;
  };

  // Renderizado condicional para el estado de carga, error o la interfaz normal
  if (loading) {
    return (
      <FormContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <FormTitle>Nueva Factura</FormTitle>
        <div style={{ textAlign: 'center', padding: '20px' }}>Cargando datos...</div>
      </FormContainer>
    );
  }

  if (loadingError) {
    return (
      <FormContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <FormTitle>Nueva Factura</FormTitle>
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#e53e3e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>Error al cargar datos:</div>
          <div>{loadingError}</div>
          <button 
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <FormTitle>Nueva Factura</FormTitle>
      
      <React.Fragment>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            {/* Primera columna */}
            <FormField>
              <Label>Fecha:</Label>
              <Input 
                type="date" 
                name="date" 
                value={formData.date}
                onChange={handleChange}
                hasError={!!errors.date}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              />
              {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
            </FormField>
            
            {/* Segunda columna */}
            <FormField>
              <Label>Cliente:</Label>
              <Input 
                type="text" 
                name="client" 
                value={formData.client}
                onChange={handleChange}
                hasError={!!errors.client}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              />
              {errors.client && <ErrorMessage>{errors.client}</ErrorMessage>}
            </FormField>
            
            {/* Primera columna, segunda fila */}
            <FormField>
              <Label>Tipo de factura:</Label>
              <Select 
                name="invoiceType" 
                value={formData.invoiceType}
                onChange={handleChange}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              >
                <option value="No electronica">No electronica</option>
                <option value="Electronica">Electronica</option>
              </Select>
            </FormField>
            
            {/* Segunda columna, segunda fila */}
            <FormField>
              <Label>Gasto Generales:</Label>
              <Select 
                name="generalExpense" 
                value={formData.generalExpense}
                onChange={handleChange}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              >
                <option value="Compras">Compras</option>
                <option value="Servicios">Servicios</option>
                <option value="Otros">Otros</option>
              </Select>
            </FormField>
            
            {/* Primera columna, tercera fila */}
            <FormField>
              <Label>Proveedor:</Label>
              <ProveedorContainer>
                <Input 
                  type="text" 
                  name="provider" 
                  value={formData.provider}
                  onChange={handleChange}
                  hasError={!!errors.provider}
                  disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                />
                <AddButton 
                  type="button" 
                  disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                >+</AddButton>
              </ProveedorContainer>
              {errors.provider && <ErrorMessage>{errors.provider}</ErrorMessage>}
            </FormField>
            
            {/* Segunda columna, tercera fila */}
            <FormField>
              <Label>Detalle:</Label>
              <TextArea 
                name="detail" 
                value={formData.detail}
                onChange={handleChange}
                hasError={!!errors.detail}
                noUppercase={true}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              />
              {errors.detail && <ErrorMessage>{errors.detail}</ErrorMessage>}
            </FormField>
            
            {/* Primera columna, cuarta fila */}
            <CheckboxContainer>
              <Checkbox 
                id="useInventory"
                name="useInventory" 
                checked={formData.useInventory}
                onChange={handleChange}
                disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
              />
              <CheckboxLabel htmlFor="useInventory">Usa Inventario</CheckboxLabel>
            </CheckboxContainer>
            
            {/* Segunda columna, cuarta fila - vacía para alinear */}
            <div></div>
            
            {/* Renderizado condicional basado en useInventory */}
            {formData.useInventory ? (
              <InventoryFieldsContainer>
                <FormField>
                  <Label>Descripcion:</Label>
                  <AutocompleteContainer>
                    <Input 
                      type="text" 
                      name="descripcion" 
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Escribir para buscar productos"
                      autoComplete="off"
                      hasError={!!errors.descripcion}
                      disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                    />
                    {errors.descripcion && <ErrorMessage>{errors.descripcion}</ErrorMessage>}
                    {formData.descripcion.length > 0 && !showPaymentPanel && !isSavingItem && !isSubmittingForm && (
                      <SuggestionsList>
                        {getProductSuggestions(formData.descripcion).map((product, index) => (
                          <SuggestionItem 
                            key={index} 
                            onClick={() => handleSelectProduct(product)}
                          >
                            {product.nombre}
                          </SuggestionItem>
                        ))}
                      </SuggestionsList>
                    )}
                  </AutocompleteContainer>
                </FormField>
                <FormField>
                  <Label>Cant:</Label>
                  <Input 
                    type="text" 
                    name="cantidad" 
                    value={formData.cantidad}
                    onChange={handleChange}
                    style={{ width: '60px' }}
                    hasError={!!errors.cantidad}
                    isNumber={true}
                    disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                  />
                  {errors.cantidad && <ErrorMessage>{errors.cantidad}</ErrorMessage>}
                </FormField>
                <FormField>
                  <Label>Costo:</Label>
                  <Input 
                    type="text" 
                    name="costo" 
                    value={formData.costo}
                    onChange={handleChange}
                    style={{ width: '100px' }}
                    hasError={!!errors.costo}
                    isNumber={true}
                    disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                  />
                  {errors.costo && <ErrorMessage>{errors.costo}</ErrorMessage>}
                </FormField>
              </InventoryFieldsContainer>
            ) : (
              <React.Fragment>
                <FormField>
                  <Label>Total:</Label>
                  <Input 
                    type="text" 
                    name="total" 
                    value={formData.total}
                    onChange={handleChange}
                    hasError={!!errors.total}
                    isNumber={true}
                    disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                  />
                  {errors.total && <ErrorMessage>{errors.total}</ErrorMessage>}
                </FormField>
                
                <FormField>
                  <Label>Producto:</Label>
                  <Input 
                    type="text" 
                    name="descripcion" 
                    value={formData.descripcion}
                    onChange={handleChange}
                    hasError={!!errors.descripcion}
                    disabled={showPaymentPanel || isSavingItem || isSubmittingForm}
                  />
                  {errors.descripcion && <ErrorMessage>{errors.descripcion}</ErrorMessage>}
                </FormField>
              </React.Fragment>
            )}
            
            <ActionSection>
              <SaveButton 
                type="button" 
                onClick={handleSave}
                disabled={!canSaveItem() || showPaymentPanel}
              >
                {isSavingItem ? 'GUARDANDO...' : 'GUARDAR'}
              </SaveButton>
            </ActionSection>
          </FormGrid>
          
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <th>PRODUCTO</th>
                  <th>DETALLE</th>
                  <th>CANT</th>
                  <th>TOTAL</th>
                  <th></th>
                </tr>
              </TableHeader>
              <TableBody>
                {tableItems.length > 0 ? (
                  tableItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.producto}</td>
                      <td>{item.detalle}</td>
                      <td>{item.cantidad}</td>
                      <td style={{ textAlign: 'right' }}>$ {formatNumberWithThousandSeparator(item.total)}</td>
                      <td>
                        <DeleteButton 
                          type="button" 
                          onClick={() => handleDeleteItem(item.id, item.total)}
                          title="Eliminar"
                          disabled={showPaymentPanel || isDeletingItem || isSavingItem || isSubmittingForm}
                        >
                          {isDeletingItem ? '...' : '×'}
                        </DeleteButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>
                      {submitted ? 'Debe agregar al menos un item' : 'No hay items'}
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <FooterSection>
            <RecordButton 
              type="submit"
              disabled={!isFormValid() || showPaymentPanel || isSubmittingForm || isSavingItem || isDeletingItem}
            >
              {isSubmittingForm ? 'PROCESANDO...' : 'GRABAR FACTURA'}
            </RecordButton>
            <TotalDisplay>Total: $ {formatNumberWithThousandSeparator(totalAmount)}</TotalDisplay>
          </FooterSection>
        </form>
        
        {/* Overlay para bloquear la interacción con el formulario cuando se muestra el panel de pago */}
        {showPaymentPanel && <Overlay />}
        
        {/* Panel de pago simplificado */}
        {showPaymentPanel && (
          <PaymentPanel>
            <div style={{ fontSize: '32px', color: '#555', marginBottom: '20px', textAlign: 'center' }}>
              $ {formatNumberWithThousandSeparator(totalAmount)}
            </div>
            
            <PaymentRow>
              <PaymentLabel>
                <PaymentIcon>🔴</PaymentIcon>
                Efectivo:
              </PaymentLabel>
              <PaymentInput
                type="text"
                name="efectivo"
                value={paymentForm.efectivo}
                onChange={handlePaymentChange}
                ref={efectivoInputRef}
                disabled={isProcessingPayment}
              />
            </PaymentRow>
            
            <PaymentRow>
              <PaymentLabel>
                <PaymentIcon>🟠</PaymentIcon>
                Tarjeta:
              </PaymentLabel>
              <PaymentInput
                type="text"
                name="tarjeta"
                value={paymentForm.tarjeta}
                onChange={handlePaymentChange}
                disabled={isProcessingPayment}
              />
            </PaymentRow>
            
            <PaymentRow>
              <PaymentLabel>
                <PaymentIcon>🟠</PaymentIcon>
                Credito:
              </PaymentLabel>
              <PaymentInput
                type="text"
                name="credito"
                value={paymentForm.credito}
                onChange={handlePaymentChange}
                disabled={isProcessingPayment}
              />
            </PaymentRow>
            
            <PaymentRow>
              <PaymentLabel>
                Cambio:
              </PaymentLabel>
              <PaymentReadOnly>
                {paymentForm.cambio}
              </PaymentReadOnly>
            </PaymentRow>
            
            <PaymentRow>
              <PaymentSubLabel>
                Restante:
              </PaymentSubLabel>
              <PaymentReadOnly>
                {paymentForm.restante}
              </PaymentReadOnly>
            </PaymentRow>
            
            <PayButton 
              onClick={handleProcessPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? 'Procesando...' : 'Pagar'}
            </PayButton>
          </PaymentPanel>
        )}
      </React.Fragment>
    </FormContainer>
  );
};

export default FormularioGasto;