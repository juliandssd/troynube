import React from 'react';
import styled from 'styled-components';
import {
  ChefHat,
  Store,
  Smartphone,
  Settings,
  FileText,
  Receipt,
  FileDigit,
  Users,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

// Estilos con styled-components modernos
const MenuWrapper = styled.nav`
  position: relative;
  background: white;
  width: 100%;
  border-radius: 0;
  box-shadow: none;
`;

const MenuContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
  background: white;
  position: relative;
  width: 100%;
  padding: 0;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: #f1f1f5;
  }
`;

const MenuItem = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 1.5rem;
  border-radius: 0;
  border: none;
  background: white;
  color: ${props => props.isActive ? '#4F46E5' : '#64748b'};
  font-weight: ${props => props.isActive ? '600' : '500'};
  flex: 1;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  box-shadow: none;
  
  &:hover {
    color: #4F46E5;
    background: ${props => props.isActive ? '#EEF2FF' : 'white'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #4F46E5;
    opacity: ${props => props.isActive ? 1 : 0};
    transform: scaleY(${props => props.isActive ? 1 : 0});
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
`;

const IconWrapper = styled.div`
  margin-right: 0.5rem;
`;

const MenuText = styled.span`
  font-size: 0.875rem;
  white-space: nowrap;
`;

const IconBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 18px;
  background: #4F46E5;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  height: 15px;
  width: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
`;

const MenuItemContainer = styled.div`
  flex: 1;
  display: flex;
`;

const MenuHorizontal = ({ activeItem = 1, setActiveItem = () => {} }) => {
  const menuItems = [
    { id: 1, icon: BarChart3, text: 'Barra', isNew: false },
    { id: 2, icon: Store, text: 'Cajas', isNew: false },
    { id: 3, icon: Users, text: 'Usuario', isNew: false },
    { id: 4, icon: FileDigit, text: 'Empresa', isNew: false },
    { id: 5, icon: Receipt, text: 'Caja Cerrada', isNew: true },
    { id: 6, icon: FileText, text: 'Comprobante', isNew: false },
    { id: 7, icon: ChefHat, text: 'Reporte', isNew: false }
  ];
  
  return (
    <MenuWrapper>
      <MenuContainer>
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;
          
          return (
            <MenuItemContainer key={item.id}>
              <MenuItem
                isActive={isActive}
                onClick={() => setActiveItem(item.id)}
              >
                <IconWrapper>
                  <Icon 
                    size={18} 
                    color={isActive ? '#4F46E5' : '#64748b'} 
                  />
                </IconWrapper>
                <MenuText>{item.text}</MenuText>
                {item.isNew && <IconBadge show={item.isNew}>•</IconBadge>}
              </MenuItem>
            </MenuItemContainer>
          );
        })}
      </MenuContainer>
    </MenuWrapper>
  );
};

export default MenuHorizontal;