import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { grupoeditar, grupoproductoinsertar } from '../../../../Api/TaskgrupoYproducto';
import { useAuthStore } from '../../../authStore';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  width: 280px;
  background-color: white;
  color: #333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 24px;
  z-index: 1001;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
`;

const InputContainer = styled.div`
  width: 100%;
  position: relative;
`;

const TextInput = styled.input`
  width: 90%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background-color: #333;
  color: #fff;
  text-align: center;
  display: block;
  margin: 0 auto;
  border: ${props => props.hasError ? '1px solid #ff4d4f' : 'none'};
  
  &::placeholder {
    color: #aaa;
    text-align: center;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 79, 255, 0.2);
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.p`
  color: #4a9fda;
  font-weight: 500;
  margin-bottom: 12px;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const RadioInput = styled.input`
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 50%;
  position: relative;
  
  &:checked {
    border: 2px solid #4a4fff;
    background-color: #4a4fff;
    box-shadow: inset 0 0 0 3px white;
  }
  
  &:focus {
    outline: none;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  background-color: #3a36ff;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(35, 49, 209, 0.3);
  margin-top: 10px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#3a36ff' : '#2c29e8'};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

// Modal Component
const AgregarGrupo = ({ 
  isOpen = false, 
  onClose, 
  onAddEvent, 
  onUpdateEvent, 
  editMode = false, 
  itemToEdit = null 
}) => {
  const [selectedOption, setSelectedOption] = useState('Cocina');
  const [groupName, setGroupName] = useState('');
  const authData = useAuthStore((state) => state.authData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groupId, setGroupId] = useState(null);

  // Load data when editing
  useEffect(() => {
    if (editMode && itemToEdit) {
      setGroupName(itemToEdit.Grupo || '');
      setSelectedOption(itemToEdit.impresora || 'Cocina');
      setGroupId(itemToEdit.id_grupo);
    } else {
      // Reset form when not in edit mode
      setGroupName('');
      setSelectedOption('Cocina');
      setGroupId(null);
    }
  }, [editMode, itemToEdit]);

  const validateForm = () => {
    const newErrors = {};
    // Validate group name
    if (!groupName.trim()) {
      newErrors.groupName = 'El nombre del grupo es obligatorio';
    }
    return newErrors;
  };

  const handleSave = async() => {
    // Validate before saving
    const formErrors = validateForm();
    setErrors(formErrors);
    setIsSubmitting(true);
    
    // If no errors, proceed with save
    if (Object.keys(formErrors).length === 0) {
      if (editMode && groupId) {
        // Update existing group
        try {
          const response = await grupoeditar({
            grupo: groupName,
            id_grupo: groupId,            
            impresora: selectedOption,
            id_empresa: authData[1]
          });
          
         // console.log("Update response:", response.data.data);
          
          // Update the UI with the updated group
          const updatedGroup = {
            id_grupo: groupId,
            Grupo: groupName,
            impresora: selectedOption
          };
          
          if (onUpdateEvent) {
            onUpdateEvent(updatedGroup);
          }
        } catch (error) {
          console.error("Error updating group:", error);
          alert("Error al actualizar el grupo");
        }
      } else {
        // Create new group
        try {
          const response = await grupoproductoinsertar({
            grupo: groupName,
            impresora: selectedOption,
            id_empresa: authData[1]
          });
          
          console.log(response.data.data);
          
          const newEvent = {
            id_grupo: response.data.data,
            Grupo: groupName,
            impresora: selectedOption
          };
          
          if (onAddEvent) {
            onAddEvent(newEvent);
          }
        } catch (error) {
          console.error("Error creating group:", error);
          alert("Error al crear el grupo");
        }
      }

      // Reset form and close modal
      setGroupName('');
      setSelectedOption('Cocina');
      setIsSubmitting(false);
      
      // Close the modal
      if (onClose) onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{editMode ? 'Editar Grupo' : 'Nuevo Grupo'}</Title>
          {onClose && (
            <CloseButton onClick={onClose}>✕</CloseButton>
          )}
        </Header>
        
        <InputGroup>
          <TextInput
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nombre del grupo"
            hasError={errors.groupName}
          />
        </InputGroup>
        {errors.groupName && <ErrorMessage>{errors.groupName}</ErrorMessage>}

        <Section>
          <SectionTitle>Impresora</SectionTitle>
          
          <OptionsGrid>
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'Cocina'} 
                onChange={() => setSelectedOption('Cocina')}
              />
              <span>Cocina</span>
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'bar'} 
                onChange={() => setSelectedOption('bar')}
              />
              <span>Bar</span>
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'asado'} 
                onChange={() => setSelectedOption('asado')}
              />
              <span>Asado</span>
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'entrada'} 
                onChange={() => setSelectedOption('entrada')}
              />
              <span>Entrada</span>
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'acompanante'} 
                onChange={() => setSelectedOption('acompanante')}
              />
              <span>Acompañante</span>
            </RadioLabel>
            
            <RadioLabel>
              <RadioInput 
                type="radio" 
                name="printer" 
                checked={selectedOption === 'jugos'} 
                onChange={() => setSelectedOption('jugos')}
              />
              <span>Jugos</span>
            </RadioLabel>
          </OptionsGrid>
        </Section>

        <SaveButton 
          onClick={handleSave} 
          disabled={isSubmitting}
        >
          {editMode ? 'Actualizar' : 'Guardar'}
        </SaveButton>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AgregarGrupo;