import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuthStore, useidcaja } from '../authStore';
import { movimientoinsertar } from '../../Api/TaskCajaYmovimiento';
import { useNavigate } from 'react-router-dom';

// Definición de keyframes para animaciones
const keyframesStyles = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  spin: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
};

// Paleta de colores
const colors = {
  primary: '#5B46FF',
  primaryGradient: 'linear-gradient(135deg, #5B46FF 0%, #8C65FA 100%)',
  primaryHover: '#4D3AD9',
  primaryLight: '#F0EEFF',
  secondary: '#8C65FA',
  secondaryHover: '#7B56E6',
  neutral: '#FAFBFF',
  neutralHover: '#F5F7FF',
  neutralBorder: '#E5E7FF',
  text: '#14142B',
  textSecondary: '#4E4B66',
  textLight: '#85839E',
  inputBg: '#14142B',
  inputText: '#FFFFFF',
  pageBg: '#F5F7FF',
  white: '#FFFFFF',
  shadow: 'rgba(91, 70, 255, 0.08)'
};

// Contenedor global para prevenir scroll horizontal
const StyledApp = styled.div`
  * {
    box-sizing: border-box;
    max-width: 100%;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
`;

// Contenedor principal
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: ${colors.pageBg};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 1rem;
  overflow-x: hidden;
  ${keyframesStyles.fadeIn}
  animation: fadeIn 0.3s ease-in-out;
`;

// Contenedor del formulario
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  background-color: ${colors.white};
  border-radius: 24px;
  box-shadow: 0 20px 60px ${colors.shadow}, 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  ${keyframesStyles.slideUp}
  animation: slideUp 0.4s ease-out;
  
  /* Borde con gradiente */
  background: 
    linear-gradient(${colors.white}, ${colors.white}) padding-box,
    ${colors.primaryGradient} border-box;
  border: 2px solid transparent;
  
  @media (max-width: 480px) {
    max-width: 92%;
    width: 92%;
    border-radius: 20px;
  }
`;

// Encabezado
const Header = styled.div`
  padding: 2rem 1.5rem 1rem;
  text-align: center;
`;

// Título
const Title = styled.h2`
  font-size: 1.625rem;
  font-weight: 700;
  background: ${colors.primaryGradient};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.01em;
  
  @media (max-width: 480px) {
    font-size: 1.375rem;
  }
`;

// Contenido del formulario
const FormContent = styled.div`
  padding: 0.5rem 1.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem 2rem;
  }
`;

// Texto informativo
const InfoText = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.9375rem;
  text-align: center;
  margin: 0 0 1.5rem;
  line-height: 1.6;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

// Resaltado en el texto informativo
const InfoHighlight = styled.span`
  color: ${colors.secondary};
  font-weight: 600;
`;

// Contenedor del input
const InputContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 2rem;
`;

// Símbolo de moneda
const CurrencySymbol = styled.span`
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.secondary};
  font-size: 1.75rem;
  font-weight: 700;
  pointer-events: none;
  z-index: 2;
  opacity: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Input para el monto
const Input = styled.input`
  width: 100%;
  height: 76px;
  background: linear-gradient(145deg, #121028, #1a1830);
  color: ${colors.inputText};
  border: none;
  border-radius: 20px;
  padding: 0 1.5rem 0 4rem;
  font-size: 1.75rem;
  font-weight: 700;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(20, 20, 43, 0.1);
  letter-spacing: 0.01em;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.primaryLight}, 0 10px 20px rgba(20, 20, 43, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
    font-weight: 500;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Contenedor de botones
const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
`;

// Estilo base para botones
const BaseButton = styled.button`
  position: relative;
  width: 100%;
  max-width: 90%;
  margin: 0 auto;
  padding: 1.25rem;
  border-radius: 18px;
  font-weight: 600;
  font-size: 1.0625rem;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    opacity: 0.7;
  }
  
  ${keyframesStyles.spin}
`;

// Botón primario
const PrimaryButton = styled(BaseButton)`
  background: ${props => props.disabled ? 
    `linear-gradient(135deg, #8E85FF 0%, #A394FF 100%)` :
    colors.primaryGradient
  };
  color: white;
  border: none;
  box-shadow: 0 10px 25px rgba(91, 70, 255, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover:not(:disabled) {
    box-shadow: 0 15px 30px rgba(91, 70, 255, 0.3);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(91, 70, 255, 0.2);
  }
`;

// Botón secundario
const SecondaryButton = styled(BaseButton)`
  background-color: transparent;
  color: ${colors.secondary};
  border: 2px solid transparent;
  font-weight: 500;
  margin-top: 0.25rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 18px;
    padding: 2px;
    background: ${colors.primaryGradient};
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  
  &:hover:not(:disabled) {
    background-color: ${colors.neutralHover};
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Texto dentro del botón
const ActionText = styled.span`
  opacity: ${props => props.hidden ? 0 : 1};
  transition: opacity 0.2s ease;
`;

// Indicador de carga
const Spinner = styled.div`
  position: absolute;
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  display: ${props => props.visible ? 'block' : 'none'};
  box-shadow: 0 0 8px rgba(140, 101, 250, 0.3);
`;

// Función para formatear números con separador de miles
const formatNumber = (value) => {
  // Eliminar caracteres no numéricos
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Formatear con separador de miles
  if (numericValue) {
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return '';
};

// Componente principal
const StartingAmountForm = () => {
  const [amount, setAmount] = useState('');
  const { idcaja } = useidcaja();
  const navigate = useNavigate();
  const [formattedAmount, setFormattedAmount] = useState('');
  const authData = useAuthStore((state) => state.authData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  
  // Actualizar el formato cuando cambia el valor
  useEffect(() => {
    setFormattedAmount(formatNumber(amount));
  }, [amount]);
  
  // Manejar cambios en el input
  const handleAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/\./g, '');
    setAmount(rawValue);
  }, []);

  // Manejar la inserción de movimiento
  const handleInsertar = useCallback(async(efectivoInicial) => {
    try {
      const response = await movimientoinsertar({
        id_usuario: authData[0],
        id_caja: idcaja,
        efectivoinicial: efectivoInicial
      });
      
      if (response.data.data > 0) {
        navigate('/app', {replace: true});
      }
      return true;
    } catch (error) {
      console.error("Error al insertar movimiento:", error);
      return false;
    } finally {
      setIsLoading(false);
      setActiveButton(null);
    }
  }, [authData, idcaja, navigate]);
  
  // Iniciar con monto
  const handleSubmit = useCallback(async() => {
    if (isLoading) return;
    
    setIsLoading(true);
    setActiveButton('iniciar');
    await handleInsertar(amount || 0);
  }, [isLoading, handleInsertar, amount]);
  
  // Omitir paso
  const handleSkip = useCallback(async() => {
    if (isLoading) return;
    
    const confirmSkip = window.confirm('¿Estás seguro que deseas omitir este paso?');
    if (confirmSkip) {
      setIsLoading(true);
      setActiveButton('omitir');
      await handleInsertar(0);
    }
  }, [isLoading, handleInsertar]);

  return (
    <StyledApp>
      <PageContainer>
        <FormContainer>
          <Header>
            <Title>
              ¿Con cuánto estás iniciando?
            </Title>
          </Header>
          
          <FormContent>
            <InfoText>
              Ingresa el monto inicial de efectivo en caja. <InfoHighlight>Si es tu primera vez</InfoHighlight>, puedes omitir este paso.
            </InfoText>
            
            <InputContainer>
              <CurrencySymbol>$</CurrencySymbol>
              <Input 
                type="text"
                value={formattedAmount}
                onChange={handleAmountChange}
                placeholder="0"
                disabled={isLoading}
                autoFocus
              />
            </InputContainer>
            
            <ButtonsContainer>
              <PrimaryButton 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                <ActionText hidden={isLoading && activeButton === 'iniciar'}>
                  Iniciar Caja
                </ActionText>
                <Spinner visible={isLoading && activeButton === 'iniciar'} />
              </PrimaryButton>
              
              <SecondaryButton 
                onClick={handleSkip} 
                disabled={isLoading}
              >
                <ActionText hidden={isLoading && activeButton === 'omitir'}>
                  Omitir por Ahora
                </ActionText>
                <Spinner visible={isLoading && activeButton === 'omitir'} />
              </SecondaryButton>
            </ButtonsContainer>
          </FormContent>
        </FormContainer>
      </PageContainer>
    </StyledApp>
  );
};

export default StartingAmountForm;