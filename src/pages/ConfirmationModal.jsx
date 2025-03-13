import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createPortal } from 'react-dom';

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const ModalPortal = ({ children }) => {
  return createPortal(children, document.body);
};

// Overlay para el fondo - ocupa toda la pantalla pero con contenido centrado
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  font-family: Arial, sans-serif;
  animation: ${fadeIn} 0.2s ease forwards;
  
  &.hidden {
    animation: ${fadeOut} 0.2s ease forwards;
  }
`;

// Contenedor del modal - tamaño reducido
const ModalContainer = styled.div`
  background-color: white;
  width: 85%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Cabecera del modal
const ModalHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f2f2f2;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  font-family: Arial, sans-serif;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  &:hover {
    color: #111;
  }
`;

// Contenido del modal - altura reducida
const ModalContent = styled.div`
  padding: 16px;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  
  p {
    margin: 0;
    text-align: center;
  }
`;

// Pie del modal
const ModalFooter = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid #f2f2f2;
`;

// Botones - tamaño reducido
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: Arial, sans-serif;
  
  ${props => props.primary && css`
    background-color: ${props => props.color || '#5C5FEF'};
    color: white;
    border: none;
    
    &:hover {
      background-color: ${props => props.color ? `${props.color}dd` : '#4F46E5'};
    }
    
    &:active {
      background-color: ${props => props.color ? `${props.color}cc` : '#4338CA'};
    }
  `}
  
  ${props => !props.primary && css`
    background-color: #f5f5f5;
    color: #333;
    border: none;
    
    &:hover {
      background-color: #e8e8e8;
    }
    
    &:active {
      background-color: #d4d4d4;
    }
  `}
`;

/**
 * Componente de Confirmación
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto o cerrado
 * @param {function} props.onClose - Función a ejecutar al cerrar el modal
 * @param {function} props.onConfirm - Función a ejecutar al confirmar
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje de confirmación
 * @param {string} props.confirmText - Texto del botón de confirmación
 * @param {string} props.cancelText - Texto del botón de cancelación
 * @param {string} props.themeColor - Color principal del tema
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro que deseas realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  themeColor = "#5C5FEF"
}) => {
  const [visibility, setVisibility] = useState("visible");
  
  useEffect(() => {
    if (isOpen) {
      setVisibility("visible");
      // Bloquear el scroll del body
      document.body.style.overflow = 'hidden';
      // Compensar el ancho del scrollbar para evitar saltos
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    }
    
    return () => {
      // Restaurar el scroll al desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
  
  const handleClose = () => {
    setVisibility("hidden");
    setTimeout(() => {
      onClose();
      // Restaurar el scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 200);
  };
  
  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalPortal>
      <ModalOverlay className={visibility}>
        <ModalContainer>
          <ModalHeader>
            <Title>{title}</Title>
            <CloseButton onClick={handleClose}>×</CloseButton>
          </ModalHeader>
          
          <ModalContent>
            <p>{message}</p>
          </ModalContent>
          
          <ModalFooter>
            <Button onClick={handleClose}>
              {cancelText}
            </Button>
            <Button primary color={themeColor} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </ModalPortal>
  );
};

export default ConfirmationModal;