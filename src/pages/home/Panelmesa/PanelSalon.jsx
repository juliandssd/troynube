import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { salonmostrarporidempresa } from '../../../Api/Tasksalon';

const NavContainer = styled.div`
  width: 100%; 
  /* Eliminado max-width para permitir ancho completo */
  background: white;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
`;

const StaticButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$active ? 'white' : '#6366F1'};
  color: ${props => props.$active ? '#6366F1' : 'white'};
  border: 2px solid #6366F1;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  height: 40px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${props => props.$active ? '#f8f8ff' : '#5355cd'};
  }

  &:active {
    transform: scale(0.98);
  }

  /* Efecto cuando está seleccionado */
  ${props => props.$active && `
    box-shadow: inset 0 0 5px rgba(99, 102, 241, 0.2);
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #6366F1;
    }
  `}
`;

const Nav = styled.nav`
  position: relative;
  display: flex;
  flex-grow: 1;
`;

const NavButton = styled.button`
  padding: 16px 32px;
  background: transparent;
  border: none;
  color: ${props => props.$active ? '#6366F1' : '#666'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: #6366F1;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${props => props.$active ? '#6366F1' : 'transparent'};
    transition: all 0.3s ease;
  }
`;

// Opcional: Contenedor principal para asegurar ancho completo
const FullWidthWrapper = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
`;

const NavigationTabs = ({data, setid_salon}) => {
  const [activeTab, setActiveTab] = useState('principal');
  const [isTableChangeActive, setIsTableChangeActive] = useState(false);

  const handleTableChange = () => {
    setIsTableChangeActive(!isTableChangeActive);
  };

  const handledsalon = (id) => {
    setActiveTab(id);
    setid_salon(id);
  }

  return (
    <FullWidthWrapper>
      <NavContainer>
        <StaticButton 
          $active={isTableChangeActive}
          onClick={handleTableChange}
        >
          CAMBIO DE MESA
        </StaticButton>
        <Nav>
          {data.map((tab) => (
            <NavButton
              key={tab.id_salon}
              $active={activeTab === tab.id_salon}
              onClick={() => handledsalon(tab.id_salon)}
            >
              {tab.salon}
            </NavButton>
          ))}
        </Nav>
      </NavContainer>
    </FullWidthWrapper>
  );
};

export default NavigationTabs;