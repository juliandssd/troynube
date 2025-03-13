import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, CheckCircle, XCircle, Edit3, Save, Receipt, AlertCircle } from 'lucide-react';
import { ticketeditar, ticketmostrar } from '../../Api/Taskticket';
import { useAuthStore } from '../authStore';
import { data } from 'react-router-dom';

// Definición de colores principales
const colors = {
  primary: '#6366F1', // Color principal solicitado (índigo)
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  accent: '#F472B6', // Color de acento (rosa)
  success: '#10B981', // Verde para éxito
  error: '#EF4444', // Rojo para errores
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  dark: '#1F2937'
};

// Contenedor principal ultra moderno
const ReceiptContainer = styled.div`
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 330px;
  margin: 0 auto;
  padding: 28px 25px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 10px 20px rgba(99, 102, 241, 0.04);
  max-height: 650px;
  overflow-y: auto !important;
  overflow-x: hidden;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.03),
      0 25px 50px rgba(0, 0, 0, 0.09),
      0 12px 25px rgba(99, 102, 241, 0.06);
  }
  
  /* Estilos para la barra de desplazamiento */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.primaryLight};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.primary};
  }
`;

const ReceiptContent = styled.div`
  width: 100%;
`;

// Barra superior decorativa
const ColoredTopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight}, ${colors.accent});
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

// Logo y encabezado modernos
const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const CircleLogo = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.25);
  }
`;

// Estilo para los campos de la cabecera
const HeaderText = styled.div`
  width: 100%;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
  color: ${colors.dark};
  letter-spacing: 0.3px;
  ${props => props.bold && `
    font-weight: 600;
  `}
  ${props => props.title && `
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 6px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
  `}
`;

// Campo editable con validación
const EditableFieldWrapper = styled.div`
  position: relative;
  width: 85%;
  margin: 4px 0;
`;

const ValidationIcon = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  color: ${props => props.isValid ? colors.success : colors.error};
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.2s ease;
`;

// Campos editables del encabezado con diseño moderno y validación
const EditableHeaderText = styled.input`
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  border: ${props => props.editing ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'};
  background-color: ${props => props.editing ? 'rgba(249, 250, 251, 0.8)' : 'transparent'};
  border-radius: ${props => props.editing ? '8px' : '0'};
  padding: 7px 30px 7px 12px;
  margin: 0;
  outline: none;
  transition: all 0.2s ease;
  color: ${colors.dark};
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: ${props => props.editing ? `0 0 0 3px rgba(99, 102, 241, 0.15)` : 'none'};
  }
  
  ${props => props.hasError && props.editing && `
    border-color: ${colors.error};
    background-color: rgba(254, 242, 242, 0.6);
  `}
  
  ${props => props.isValid && props.editing && `
    border-color: ${colors.success};
    background-color: rgba(236, 253, 245, 0.4);
  `}
  
  ${props => props.bold && 'font-weight: 600;'}
`;

// Error message para campos inválidos
const ErrorMessage = styled.div`
  font-size: 11px;
  color: ${colors.error};
  margin-top: 2px;
  text-align: left;
  padding-left: 8px;
  height: ${props => props.show ? '16px' : '0'};
  overflow: hidden;
  transition: height 0.2s ease;
`;

// Separador de línea moderno
const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(to right, transparent, ${colors.primaryLight}20, transparent);
  margin: 18px 0;
  border-radius: 1px;
`;

// Información estática (no editable) con estilo moderno
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 7px 0;
  color: ${colors.dark};
  ${props => props.highlight && `
    background-color: rgba(99, 102, 241, 0.06);
    padding: 6px 10px;
    border-radius: 8px;
    margin: 10px 0;
  `}
`;

const InfoLabel = styled.div`
  font-weight: ${props => props.bold ? '600' : 'normal'};
  color: ${props => props.bold ? colors.dark : colors.gray};
`;

const InfoValue = styled.div`
  text-align: right;
  color: ${colors.dark};
  font-weight: ${props => props.bold ? '600' : 'normal'};
`;

// Filas de productos con diseño moderno
const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 70px 70px;
  font-size: 13px;
  margin: 8px 0;
  padding: 6px 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  ${props => props.even && `
    background-color: rgba(99, 102, 241, 0.04);
  `}
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.08);
  }
`;

const ProductHeader = styled(ProductRow)`
  font-weight: 600;
  color: ${colors.dark};
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  background-color: transparent;
  
  &:hover {
    background-color: transparent;
  }
`;

// Pie de página moderno
const FooterText = styled.div`
  width: 100%;
  text-align: center;
  font-size: 13px;
  margin-top: 20px;
  line-height: 1.4;
  color: ${colors.gray};
  ${props => props.highlight && `
    font-weight: 600;
    font-size: 15px;
    margin: 24px 0 12px;
    color: ${colors.dark};
    letter-spacing: 0.3px;
  `}
`;

// Botón de edición ultra moderno
const EditButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 8px 16px;
  background: ${props => props.editing ? 
    `linear-gradient(135deg, ${colors.success}, ${colors.success}dd)` : 
    `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.editing ? 
    '0 4px 12px rgba(16, 185, 129, 0.2)' : 
    '0 4px 12px rgba(99, 102, 241, 0.25)'};
  z-index: 10;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.editing ? 
      '0 6px 20px rgba(16, 185, 129, 0.25)' : 
      '0 8px 25px rgba(99, 102, 241, 0.3)'};
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

// Total con diseño destacado
const TotalRow = styled(InfoRow)`
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(to right, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  padding: 10px 12px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.1);
`;

// Componente principal
const ReceiptImpresora = ({ icon, title }) => {
  const authData = useAuthStore((state) => state.authData);
  
  // Estado para los datos editables de la cabecera
  const [headerData, setHeaderData] = useState({
    companyName: '',
    nit: '',
    systemName: 'TROY SYSTEM POS',
    address: '',
    phone: '',
    businessName: '',
    slogan: '',
    bankInfo: '',
    resolution: '',
    validityPeriod: '',
    correo: '',
    datos_fiscales: '',
    por_defecto: '',
    identificador: '',
    pagina_web: '',
    agradecimiento: '',
    id:''
  });
  
  // Estado para los errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado para los campos que han sido tocados (para mostrar validación)
  const [touched, setTouched] = useState({});
  
  // Datos para el recibo (podrían venir de otra API o props)
  const [receiptData, setReceiptData] = useState({
    receiptNumber: '',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    table: '',
    waiter: '',
    clientName: '',
    products: [],
    paymentType: '',
    voluntaryTip: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    cash: 0,
    change: 0,
    footerMessage: ''
  });
  
  // Actualizar los datos del recibo cuando cambie headerData
  useEffect(() => {
    setReceiptData(prevData => ({
      ...prevData,
      footerMessage: headerData.agradecimiento || ''
    }));
  }, [headerData.agradecimiento]);
  
  useEffect(() => {
    const fetchData = async() => {
      try {
        const response = await ticketmostrar({id_empresa: authData[1]});
        console.log(response.data.data);
        const ticketData = response.data.data;
        
        // Actualizar los datos del encabezado con la información recibida de la API
        setHeaderData({
          companyName: ticketData.Nombre || '',
          nit: ticketData.identificador || '',
          systemName: 'TROY SYSTEM POS',
          address: ticketData.direccion || '',
          phone: ticketData.Telefonos || '',
          businessName: ticketData.NombreDelaDuena || '',
          slogan: ticketData.Anuncio || '',
          bankInfo: ticketData.Bancon || '',
          resolution: ticketData.reso || '',
          validityPeriod: ticketData.rango || '',
          datos_fiscales: ticketData.Datos_fiscales || '',
          identificador: ticketData.identificador || '',
          pagina_web: ticketData.pagina_web || '',
          agradecimiento: ticketData.Agradecimiento || '',
          id:ticketData.id_ticket
        });
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };
    
    fetchData();
  }, [authData]);
  
  // Estado para controlar si estamos en modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Función para manejar cambios en los campos editables
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHeaderData({
      ...headerData,
      [name]: value
    });
    
    // Marcar el campo como tocado
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true
      });
    }
    
    // Validar el campo
    validateField(name, value);
  };
  
  // Función para validar un campo específico
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'nit':
        if (!value.trim()) {
          newErrors[name] = 'El NIT es requerido';
        } else if (!/^\d+-\d+$/.test(value)) {
          newErrors[name] = 'Formato inválido. Debe ser: XXXXXXXXX-X';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          newErrors[name] = 'El teléfono es requerido';
        } else if (!/^\d{10}$/.test(value)) {
          newErrors[name] = 'Debe tener 10 dígitos';
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'address':
      case 'businessName':
        if (!value.trim()) {
          newErrors[name] = 'Este campo es requerido';
        } else {
          delete newErrors[name];
        }
        break;
        
      // Campos opcionales: resolución y período de validez
      case 'resolution':
      case 'validityPeriod':
        delete newErrors[name]; // Siempre eliminar errores para estos campos
        break;
        
      default:
        if (!value.trim()) {
          newErrors[name] = 'Campo requerido';
        } else {
          delete newErrors[name];
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validar todos los campos al guardar
  const validateAllFields = async () => {
    const newErrors = {};
    const allTouched = {};
    
    // Lista de campos opcionales que no requieren validación
    const optionalFields = ['resolution', 'validityPeriod', 'slogan', 'bankInfo', 'agradecimiento', 'pagina_web'];
    
    // Verificar cada campo
    Object.entries(headerData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        allTouched[key] = true;
        
        // Saltear validación para campos opcionales
        if (optionalFields.includes(key)) {
          return;
        }
        
        if (!value.trim()) {
          newErrors[key] = 'Campo requerido';
        } else {
          // Validaciones específicas
          if (key === 'nit' && !/^\d+-\d+$/.test(value)) {
            newErrors[key] = 'Formato inválido. Debe ser: XXXXXXXXX-X';
          } else if (key === 'phone' && !/^\d{10}$/.test(value)) {
            newErrors[key] = 'Debe tener 10 dígitos';
          }
        }
      }
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Función para activar/desactivar el modo edición - SOLUCIÓN ACTUALIZADA
  const toggleEditing = async () => {
    if (isEditing) {
      // Si estamos saliendo del modo edición (guardando)
      const isValid = validateAllFields();
      
      if (isValid) {
        // Aquí se enviarían los datos al servidor para guardar
        try {
          console.log('Datos guardados:', headerData);
          const data = {
            id: headerData.id,
            direccion: headerData.address,
            agradecimiento: headerData.agradecimiento,
            paginawe: headerData.pagina_web,
            // Solución: Usar headerData.nit en lugar de headerData.identificador
            identificado: headerData.nit,
            telefono: headerData.phone,
            rango: headerData.validityPeriod,
            reso: headerData.resolution,
            propetario: headerData.businessName 
          }
          console.log("Data enviada:", data);
          const response = await ticketeditar(data);
          console.log(response.data.data);
          setIsEditing(false);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      // Entrar en modo edición
      setIsEditing(true);
    }
  };
  
  // Renderizar un campo editable con validación
  const renderEditableField = (name, value, bold = false) => {
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name];
    
    return (
      <EditableFieldWrapper>
        <EditableHeaderText
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={() => {
            setTouched({ ...touched, [name]: true });
            validateField(name, value || '');
          }}
          editing={isEditing}
          readOnly={!isEditing}
          hasError={hasError}
          isValid={isValid}
          bold={bold}
        />
        <ValidationIcon show={isEditing && touched[name]} isValid={!hasError}>
          {hasError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
        </ValidationIcon>
        <ErrorMessage show={isEditing && hasError}>
          {errors[name]}
        </ErrorMessage>
      </EditableFieldWrapper>
    );
  };
  
  return (
    <>
      <div style={{ padding: '0 2rem 2rem' }}>
        <ReceiptContainer>
          <ColoredTopBar />
          
          {/* Botón de edición visible en la esquina superior derecha */}
          <EditButton 
            onClick={toggleEditing} 
            editing={isEditing}
            disabled={isEditing && Object.keys(errors).length > 0}
          >
            {isEditing ? (
              <>
                <Save size={16} />
                Guardar
              </>
            ) : (
              <>
                <Edit3 size={16} />
                Editar
              </>
            )}
          </EditButton>
          
          <ReceiptContent>
            {/* Logo y encabezado editable */}
            <LogoSection>
              <CircleLogo>
                <User color="white" size={32} />
              </CircleLogo>
              
              <HeaderText title>{headerData.companyName}</HeaderText>
              {renderEditableField('nit', headerData.nit)}
              <HeaderText>{headerData.systemName}</HeaderText>
              {renderEditableField('address', headerData.address)}
              {renderEditableField('phone', headerData.phone)}
              {renderEditableField('businessName', headerData.businessName)}
              <HeaderText>{headerData.slogan}</HeaderText>
              <HeaderText bold>{headerData.bankInfo}</HeaderText>
              {renderEditableField('resolution', headerData.resolution)}
              {renderEditableField('validityPeriod', headerData.validityPeriod)}
            </LogoSection>
            
            <Divider />
            
            {/* Información de transacción (datos de recibo) */}
            <InfoRow>
              <InfoLabel bold>Numero ventas Pos:</InfoLabel>
              <InfoValue>{receiptData.receiptNumber}</InfoValue>
              <InfoValue bold>{receiptData.date}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Mesa:</InfoLabel>
              <InfoValue># {receiptData.table}</InfoValue>
              <InfoValue>{receiptData.time}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Mesero:</InfoLabel>
              <InfoValue>{receiptData.waiter}</InfoValue>
            </InfoRow>
            
            <Divider />
            
            {/* Información del cliente */}
            <InfoRow highlight>
              <InfoLabel bold>Cliente:</InfoLabel>
              <InfoValue bold>{receiptData.clientName}</InfoValue>
            </InfoRow>
            
            <Divider />
            
            {/* Tabla de productos */}
            <ProductHeader>
              <div>Cant</div>
              <div>Producto</div>
              <div style={{textAlign: 'right'}}>Precio</div>
              <div style={{textAlign: 'right'}}>Total</div>
            </ProductHeader>
            
            {receiptData.products && receiptData.products.length > 0 ? (
              receiptData.products.map((product, index) => (
                <ProductRow key={product.id} even={index % 2 === 0}>
                  <div>{product.quantity}</div>
                  <div>{product.description}</div>
                  <div style={{textAlign: 'right'}}>{product.price?.toLocaleString()}</div>
                  <div style={{textAlign: 'right'}}>{product.total?.toLocaleString()}</div>
                </ProductRow>
              ))
            ) : (
              <ProductRow>
                <div colSpan="4" style={{gridColumn: "span 4", textAlign: "center", color: colors.gray}}>
                  No hay productos para mostrar
                </div>
              </ProductRow>
            )}
            
            <Divider />
            
            {/* Información de pago */}
            <InfoRow>
              <InfoLabel bold>Tipo de pago:</InfoLabel>
              <InfoValue>{receiptData.paymentType}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Propina Voluntaria:</InfoLabel>
              <InfoValue>${receiptData.voluntaryTip?.toLocaleString()}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Sub Total:</InfoLabel>
              <InfoValue>${receiptData.subtotal?.toLocaleString()}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Impuesto al Consumo:</InfoLabel>
              <InfoValue>${receiptData.tax?.toLocaleString()}</InfoValue>
            </InfoRow>
            
            <TotalRow>
              <InfoLabel bold>Total:</InfoLabel>
              <InfoValue bold>${receiptData.total?.toLocaleString()}</InfoValue>
            </TotalRow>
            
            <InfoRow>
              <InfoLabel>Efectivo:</InfoLabel>
              <InfoValue>${receiptData.cash?.toLocaleString()}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Cambio:</InfoLabel>
              <InfoValue>${receiptData.change?.toLocaleString()}</InfoValue>
            </InfoRow>
            
            {/* Mensaje de pie de página */}
            <FooterText highlight>
              {receiptData.footerMessage || headerData.agradecimiento}
            </FooterText>
            
            <FooterText style={{fontSize: '11px', color: colors.gray}}>
              Factura Elaborada por la Empresa TROY SYSTEM POS {headerData.nit ? `NIT: ${headerData.nit}` : ''}
            </FooterText>
          </ReceiptContent>
        </ReceiptContainer>
      </div>
    </>
  );
};

export default ReceiptImpresora;