import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { areamostrarporidempresa } from '../../Api/TaskareaYimpresora';
import { useAuthStore } from '../authStore';

// Styled Components
const Container = styled.div`
  width: 280px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.div`
  padding: 18px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  text-align: center;
`;

const MenuList = styled.div`
  padding: 8px 0;
`;

const MenuItem = styled.div`
  position: relative;
  padding: 14px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  background-color: ${props => props.isActive ? 'rgba(255, 95, 0, 0.03)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(255, 95, 0, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  }
`;

const IndicatorBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #6366F1;
  border-radius: 0 2px 2px 0;
  transition: transform 0.2s ease;
  transform: ${props => props.visible ? 'scaleY(1)' : 'scaleY(0)'};
`;

const MenuText = styled.span`
  color: #333;
  font-size: 14px;
  font-weight: ${props => props.isActive ? '500' : '400'};
  transition: color 0.2s ease;
  ${props => props.isActive && 'color: #6366F1;'}
`;

// Modificamos para aceptar una prop onSelectOption
const ImpresorasMenu = ({ onSelectOption,setserial }) => {

     const authData = useAuthStore((state) => state.authData);
  const [selectedOption, setSelectedOption] = useState({
    codigo: null,
    idArea: null
  });
  const [menuOptions, setMenuOptions] = useState([]);
 
  
  // Función para manejar la selección
  const handleSelectOption = (newSelection) => {
    setSelectedOption(newSelection);
    // Notificar al componente padre sobre el cambio
    if (onSelectOption) {
      onSelectOption(newSelection);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await areamostrarporidempresa({id_empresa: authData[1]});
        // Si los datos están en response.data.data, usamos eso
        if (response.data && response.data.data) {
          const data = response.data.data;
          setMenuOptions(data);
          
          // Ya no seleccionamos automáticamente ninguna opción
          // Simplemente cargamos las opciones disponibles
        } else if (response.data) {
          // Si los datos están directamente en response.data
          const data = response.data;
          setMenuOptions(data);
          
          // Ya no seleccionamos automáticamente ninguna opción
          // Simplemente cargamos las opciones disponibles
        } else {
          console.error('Estructura de respuesta inesperada:', response);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    
    fetchData();
  }, [authData]);
  
  return (
    <Container>
      <Header>
        <Title>Impresoras</Title>
      </Header>
      <MenuList>
        {menuOptions && menuOptions.length > 0 ? (
          menuOptions.map((option) => (
            <MenuItem 
              key={option.id_Area}
              isActive={selectedOption.codigo === option.Codigo}
              onClick={() => handleSelectOption({
                codigo: option.Codigo,
                idArea: option.id_Area
              })}
            >
              <IndicatorBar visible={selectedOption.codigo === option.Codigo} />
              <MenuText isActive={selectedOption.codigo === option.Codigo}>
                {option.Area}
              </MenuText>
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <MenuText>No hay impresoras disponibles</MenuText>
          </MenuItem>
        )}
      </MenuList>
    </Container>
  );
};

export default ImpresorasMenu;