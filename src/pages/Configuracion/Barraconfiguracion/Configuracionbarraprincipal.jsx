import React, { useState } from 'react';
import styled from 'styled-components';
import ModernComponent from './Configuracionsalon/ConfiguracionSalon';
import Configuracionmesa from './Configuracionmesa/Configuracionmesa';

// Contenedor principal que usa flexbox y ocupa todo el ancho y alto disponible
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh; // 100% del alto de la ventana
  max-width: 100%; // Elimina la restricción de ancho máximo
  margin: 0; // Elimina los márgenes
`;

// Columna izquierda (20%)
const LeftColumn = styled.div`
  flex: 0 0 20%;
  display: flex;
  padding: 0; // Elimina el padding para usar todo el espacio
`;

// Columna derecha (80%)
const RightColumn = styled.div`
  flex: 0 0 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; // Elimina el padding para usar todo el espacio
  background-color: #f9fafb;
`;

// Mensaje cuando no hay salón seleccionado
const NoSelectionMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 2rem;
`;

const MessageIcon = styled.div`
  margin-bottom: 1rem;
  color: #9CA3AF;
  font-size: 3rem;
`;

// Componente principal
const Configuracionbarraprincipal = () => {
  // Estado para almacenar el ID del salón seleccionado
  const [selectedSalonId, setSelectedSalonId] = useState(null);

  // Callback que será pasado al ModernComponent
  const handleSalonSelect = (salonId) => {
    setSelectedSalonId(salonId);
  };

  return (
    <Container>
      <LeftColumn>
        {/* Componente de selección de salón */}
        <ModernComponent onSalonSelect={handleSalonSelect} />
      </LeftColumn>
      <RightColumn>
        {/* 
          IMPORTANTE: Renderizado condicional
          - Si hay un salón seleccionado, mostrar Configuracionmesa
          - Si no hay salón seleccionado, mostrar mensaje
        */}
        {selectedSalonId ? (
          // Solo cuando se selecciona un salón, se muestra la configuración de mesas
          <Configuracionmesa salonId={selectedSalonId} />
        ) : (
          // Mensaje que indica al usuario que debe seleccionar un salón
          <NoSelectionMessage>
            <MessageIcon>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 9V11C21 15.9706 16.9706 20 12 20V20C7.02944 20 3 15.9706 3 11V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 7L12 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </MessageIcon>
            <h3>Selecciona un salón</h3>
            <p>Para configurar las mesas, primero debes seleccionar un salón de la lista.</p>
          </NoSelectionMessage>
        )}
      </RightColumn>
    </Container>
  );
};

export default Configuracionbarraprincipal;