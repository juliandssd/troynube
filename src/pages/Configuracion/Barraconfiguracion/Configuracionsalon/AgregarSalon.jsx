import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { saloninsertar, salonactualizar } from '../../../../Api/Tasksalon';

// Global style para aplicar Arial a todo el componente
const GlobalStyle = createGlobalStyle`
  * {
    font-family: Arial, sans-serif;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: 340px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: linear-gradient(to right, #6366F1, #8284FF);
`;

const Title = styled.h3`
  margin: 0;
  font-weight: 600;
  color: white;
  font-size: 18px;
  letter-spacing: 0.3px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const ContentWrapper = styled.div`
  padding: 24px;
`;

const SalonInput = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputLabel = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.error ? '#E53E3E' : '#6366F1'};
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  pointer-events: none;
  
  ${props => props.focused && `
    top: 10px;
    transform: translateY(0);
    font-size: 12px;
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.focused ? '22px 16px 10px' : '16px'};
  border: 2px solid ${props => {
    if (props.error) return '#E53E3E';
    return props.focused ? '#6366F1' : '#eee';
  }};
  border-radius: 12px;
  font-size: 16px;
  background: white;
  box-sizing: border-box;
  transition: all 0.2s;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#E53E3E' : '#6366F1'};
    box-shadow: 0 0 0 4px ${props => props.error ? 'rgba(229, 62, 62, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  }
`;

const ErrorMessage = styled.div`
  color: #E53E3E;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 16px;
  animation: fadeIn 0.2s ease-out;
`;

const TipToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ToggleLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const Toggle = styled.div`
  width: 48px;
  height: 24px;
  background: ${props => props.on === "SI" ? '#6366F1' : '#eee'};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.on === "SI" ? '#5254CC' : '#ddd'};
  }
`;

const Knob = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: ${props => props.on === "SI" ? '26px' : '2px'};
  transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  ${Toggle}:hover & {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const SaveButton = styled.button`
  width: 100%;
  background: ${props => props.disabled ? '#A5A6F6' : '#6366F1'};
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  padding: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  letter-spacing: 0.3px;
  box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.2)'};
  
  &:hover {
    background: ${props => props.disabled ? '#A5A6F6' : '#5254CC'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 16px rgba(99, 102, 241, 0.3)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

// Añadimos el estilo para el spinner
const Spinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SalonModal = ({ onClose = () => {}, empresaId, onAddEvent, onUpdateEvent, isEditing = false, salonData = null }) => {
  const [includeTip, setIncludeTip] = useState("NO");
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  // Nuevo estado para controlar el estado de carga
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del salón si estamos en modo edición
  useEffect(() => {
    if (isEditing && salonData) {
      setValue(salonData.salon || '');
      setIncludeTip(salonData.propina || "NO");
      // Como hay datos cargados, consideramos que el campo está "enfocado"
      setFocused(true);
    }
  }, [isEditing, salonData]);

  // Función de validación
  const validateSalonName = (name) => {
    if (!name.trim()) {
      return 'El nombre del salón es obligatorio';
    }
    
    if (name.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    
    return '';
  };

  // Validar al perder el foco
  const handleBlur = () => {
    setFocused(false);
    setError(validateSalonName(value));
  };

  // Validar al cambiar el valor
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue.toUpperCase());
    
    // Solo mostrar errores si ya se envió una vez
    if (submitted) {
      setError(validateSalonName(newValue.toUpperCase()));
    }
  };

  // Manejador para guardar - ahora maneja tanto nuevo como edición
  const handleSave = async() => {
    setSubmitted(true);
    const validationError = validateSalonName(value);
    setError(validationError);
    
    if (!validationError) {
        try {
            // Activamos el estado de carga antes de la petición
            setIsLoading(true);
            
            if (isEditing && salonData) {
                // Si estamos editando, usar la API de actualización
                const response = await salonactualizar({
                    id_salon: salonData.id,
                    salon: value,
                    propina: includeTip
                });
                if (response.data.data) {
                    const updatedData = {
                        id_salon: salonData.id,
                        salon: value,
                        propina: includeTip
                    };
                    onUpdateEvent(updatedData);
                    onClose();
                }
            } else {
                // Si es nuevo, usar la API de inserción
                const response = await saloninsertar({
                    salon: value,
                    propina: includeTip,
                    id_empresa: empresaId 
                });
                
                if (response.data.data > 0) {
                    const newdata = {
                        id_salon: response.data.data,
                        salon: value,
                        propina: includeTip
                    };
                    onAddEvent(newdata);
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error al guardar el salón:', error);
        } finally {
            // Desactivamos el estado de carga independientemente del resultado
            setIsLoading(false);
        }
    }
  };

  return (
    <ModalOverlay>
      <GlobalStyle />
      <Modal>
        <Header>
          <Title>{isEditing ? `Editar Salon: ${salonData?.salon || ''}` : 'Nuevo Salon'}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        
        <ContentWrapper>
          <SalonInput>
            <InputLabel focused={focused || value} error={error}>nombre de salon</InputLabel>
            <Input 
              type="text" 
              focused={focused || value}
              error={error}
              onFocus={() => setFocused(true)}
              onBlur={handleBlur}
              value={value}
              onChange={handleChange}
            />
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </SalonInput>
          
          <TipToggle>
            <ToggleLabel>Incluir propina: {includeTip}</ToggleLabel>
            <Toggle on={includeTip} onClick={() => setIncludeTip(includeTip === "NO" ? "SI" : "NO")}>
              <Knob on={includeTip} />
            </Toggle>
          </TipToggle>
          
          <SaveButton 
            disabled={submitted && !!error || isLoading} 
            onClick={handleSave}
          >
            <ButtonContent>
              {isLoading ? (
                <>
                  {isEditing ? 'Actualizando Salón' : 'Guardando'}
                  <Spinner />
                </>
              ) : (
                isEditing ? 'Modificar Salón' : 'Guardar'
              )}
            </ButtonContent>
          </SaveButton>
        </ContentWrapper>
      </Modal>
    </ModalOverlay>
  );
};

export default SalonModal;