import React, { useState } from 'react';
import styled from 'styled-components';
import ImpresorasMenu from './ImpresorasMenu';
import PanelImpresoras from './PanelImpresoras';

// Definición de componentes con styled-components
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`;

const LeftColumn = styled.div`
  width: 300px;
  overflow-y: auto; /* Permite scroll si el contenido es muy largo */
`;

const RightColumn = styled.div`
  flex: 1;
  overflow-y: auto; /* Permite scroll si el contenido es muy largo */
`;

// Mensaje para mostrar cuando no hay área seleccionada
const NoSelectionMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 40px);
  color: #555;
  font-size: 16px;
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  font-family: Arial, sans-serif;
`;

const IconContainer = styled.div`
  margin-bottom: 28px;
  color: #FF5F00;
  background-color: rgba(255, 95, 0, 0.08);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  font-family: Arial, sans-serif;
  letter-spacing: -0.5px;
`;

const MessageText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  max-width: 440px;
  font-family: Arial, sans-serif;
  margin-bottom: 10px;
`;

const ImpresoraPrincipal = () => {
  // Estado para almacenar la opción seleccionada
  const [selectedOption, setSelectedOption] = useState({
    codigo: null,
    idArea: null
  });
  const [serial,setserial]=useState([]);

  // Manejador para cuando se selecciona una opción en el menú
  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  return (
    <Container>
      {/* Columna izquierda - ancho fijo de 300px */}
      <LeftColumn>
        <ImpresorasMenu onSelectOption={handleSelectOption} setserial={setserial}/>
      </LeftColumn>
      
      {/* Columna derecha - ocupa el espacio restante */}
      <RightColumn>
        {selectedOption.idArea ? (
          <PanelImpresoras idArea={selectedOption.idArea} serial={serial} />
        ) : (
          <NoSelectionMessage>
            <IconContainer>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 7H6V3C6 2.45 6.45 2 7 2H17C17.55 2 18 2.45 18 3V7ZM8 19H16V14H8V19ZM19 10C19.55 10 20 9.55 20 9V7C20 5.9 19.1 5 18 5H6C4.9 5 4 5.9 4 7V9C4 9.55 4.45 10 5 10H6V14C6 15.1 6.9 16 8 16V21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21V16C17.1 16 18 15.1 18 14V10H19ZM19 8H16C16 8.55 16.45 9 17 9C17.55 9 18 8.55 18 8Z" fill="currentColor"/>
              </svg>
            </IconContainer>
            <MessageTitle>Seleccione un área de impresión</MessageTitle>
            <MessageText>
              Elija una de las áreas de impresión del menú lateral para configurar y gestionar sus dispositivos de impresión de manera eficiente.
            </MessageText>
          </NoSelectionMessage>
        )}
      </RightColumn>
    </Container>
  );
};

export default ImpresoraPrincipal;