import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Archive,
  ArrowDownCircle,
  Printer,
  BarChart2,
  Users,
  Settings,
  Mail,
  HelpCircle,
  User,
  Coffee,
  Package,
  FileText,
  Home,
  Grid
} from 'lucide-react';

// ----------------- COMPONENTES COMPARTIDOS -----------------

// Contenedor principal responsive
const NavContainer = styled.nav`
  /* Estilos compartidos */
  width: 100%;
  position: fixed;
  z-index: 100;
  font-family: Arial, sans-serif;
  
  /* Estilos para móvil */
  @media (max-width: 767px) {
    bottom: 0;
    left: 0;
    height: 4rem;
    background: #010030;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  /* Estilos para PC - fondo blanco */
  @media (min-width: 768px) {
    background: white;
    top: 0;
    left: 0;
    right: 0;
    height: 3.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
`;

// ----------------- COMPONENTES DE PC -----------------

// Wrapper exclusivo para PC
const DesktopNavWrapper = styled.div`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
`;

// Sección izquierda de la barra
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: visible;
`;

// Logo
const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  padding: 0 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
`;

// Contenedor de scroll para iconos
const IconsScrollContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  margin-left: 0.5rem;
`;

// Contenedor de iconos
const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 1rem;
  padding: 0.35rem;
  gap: 0.5rem;
  justify-content: flex-start;
  overflow: visible;
`;

// Botón de icono para PC
const IconButton = styled.button`
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isSelected ? '#2462FF' : 'transparent'};
  border: none;
  border-radius: 0.75rem;
  color: ${props => props.isSelected ? 'white' : '#333'};
  transition: all 0.2s ease;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: ${props => props.isSelected ? '#1E58E6' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.isSelected ? 'white' : '#111'};
    
    svg {
      transform: scale(1.1);
    }
  }
`;

// Botón principal con estilo específico
const PrincipalButton = styled(IconButton)`
  background-color: ${props => props.isSelected ? '#2462FF' : 'transparent'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#1E58E6' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.isSelected ? 'white' : '#111'};
  }
`;

// Tooltip
const TooltipElement = styled.div`
  position: absolute;
  background: #2462FF;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-align: center;
  pointer-events: none;
  left: 50%;
  bottom: -2.5rem;
  transform: translateX(-50%);
  white-space: nowrap;
  
  &:before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #2462FF;
  }
`;

// Contenedor de botón con tooltip
const IconButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: center;
`;

// Sección derecha
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
`;

// Panel de tiempo
const TimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.75rem;
  flex-shrink: 0;
`;

const DateText = styled.div`
  font-size: 0.625rem;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TimeText = styled.div`
  font-size: 1.125rem;
  font-weight: 800;
  color: #333;
`;

// Badge Pro
const ProBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2462FF;
  color: white;
  padding: 0.4rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  flex-shrink: 0;
  
  &:hover {
    background: #1E58E6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

// Sección de usuario
const UserSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
  color: #333;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #111;
    transform: translateY(-2px);
  }
`;

// Componente IconButton con Tooltip
const IconButtonWithTooltip = ({ icon, tooltip, onClick, isSelected }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = icon;
  
  return (
    <IconButtonWrapper>
      <IconButton 
        onClick={onClick}
        isSelected={isSelected}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon strokeWidth={1.5} />
      </IconButton>
      {showTooltip && <TooltipElement>{tooltip}</TooltipElement>}
    </IconButtonWrapper>
  );
};

// Componente PrincipalButton con Tooltip
const PrincipalButtonWithTooltip = ({ tooltip, onClick, isSelected }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <IconButtonWrapper>
      <PrincipalButton 
        onClick={onClick}
        isSelected={isSelected}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Coffee strokeWidth={1.5} />
      </PrincipalButton>
      {showTooltip && <TooltipElement>{tooltip}</TooltipElement>}
    </IconButtonWrapper>
  );
};

// ----------------- COMPONENTES MÓVILES -----------------

// Wrapper exclusivo para móvil
const MobileNavWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

// Botón de navegación móvil
const MobileIconButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.isSelected ? '#0057FF' : 'transparent'};
  border: none;
  color: white;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 20%;
  height: 100%;
  padding: 0.25rem 0;

  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 0.65rem;
    font-weight: 500;
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// Panel expandido para opciones adicionales en móvil
const MobileExpandedPanel = styled.div`
  position: fixed;
  bottom: 4rem;
  left: 0;
  width: 100%;
  background: #010030;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 101;
  display: ${props => props.isOpen ? 'block' : 'none'};
  box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.5);
`;

// Título del panel
const PanelTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
`;

// Rejilla de opciones adicionales
const IconsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
`;

// Botón dentro del panel expandido
const PanelButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.isSelected ? '#0057FF' : 'rgba(255, 255, 255, 0.05)'};
  border: none;
  border-radius: 0.75rem;
  color: white;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0.75rem 0.5rem;

  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 0.5rem;
  }

  span {
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  &:active {
    background: #0057FF;
  }
`;

// Overlay para cerrar el panel
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4rem;
  z-index: 100;
  background: rgba(0,0,0,0.5);
  display: ${props => props.show ? 'block' : 'none'};
`;

// ----------------- COMPONENTE PRINCIPAL -----------------

const Navbar = ({ onViewChange, data, onPrincipalClick, currentView: externalCurrentView }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [internalCurrentView, setInternalCurrentView] = useState('principal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Usar el estado externo si está disponible, de lo contrario usar el interno
  const currentView = externalCurrentView || internalCurrentView;

  // Actualiza la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Formateo de fecha
  const formatDate = (date) => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const day = days[date.getDay()];
    const dayNum = date.getDate();
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const month = months[date.getMonth()];
    return `${day} ${dayNum} ${month}`;
  };

  // Formateo de hora
  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Manejador para el botón PRINCIPAL
  const handlePrincipalClick = () => {
    if (typeof onPrincipalClick === 'function') {
      onPrincipalClick();
    } else if (typeof onViewChange === 'function') {
      onViewChange('principal');
    }
    setInternalCurrentView('principal');
    setMobileMenuOpen(false);
  };

  // Manejador general para cambios de vista
  const handleViewChange = (view) => {
    setInternalCurrentView(view);
    if (typeof onViewChange === 'function') {
      onViewChange(view);
    }
    setMobileMenuOpen(false);
  };

  // Toggle para el menú móvil expandido
  const toggleMobileMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Overlay para cerrar el menú (solo en móvil) */}
      <Overlay show={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      
      <NavContainer>
        {/* VISTA DESKTOP - con fondo blanco y todas las opciones */}
        <DesktopNavWrapper>
          <LeftSection>
            <Logo>Troynube</Logo>
            <IconsScrollContainer>
              <IconsContainer>
                <PrincipalButtonWithTooltip 
                  tooltip="Principal"
                  onClick={handlePrincipalClick}
                  isSelected={currentView === 'principal'}
                />
                
                <IconButtonWithTooltip 
                  icon={Package}
                  tooltip="Productos"
                  onClick={() => handleViewChange('productos')}
                  isSelected={currentView === 'productos'}
                />
                
                <IconButtonWithTooltip 
                  icon={Archive}
                  tooltip="Cerrar Caja"
                  onClick={() => handleViewChange('cerrarCaja')}
                  isSelected={currentView === 'cerrarCaja'}
                />
                
                <IconButtonWithTooltip 
                  icon={ArrowDownCircle}
                  tooltip="Egreso"
                  onClick={() => handleViewChange('egreso')}
                  isSelected={currentView === 'egreso'}
                />

                <IconButtonWithTooltip 
                  icon={Printer}
                  tooltip="Impresora"
                  onClick={() => handleViewChange('impresora')}
                  isSelected={currentView === 'impresora'}
                />
                
                <IconButtonWithTooltip 
                  icon={BarChart2}
                  tooltip="Ver Ventas"
                  onClick={() => handleViewChange('ventas')}
                  isSelected={currentView === 'ventas'}
                />
                
                <IconButtonWithTooltip 
                  icon={Users}
                  tooltip="Clientes"
                  onClick={() => handleViewChange('clientes')}
                  isSelected={currentView === 'clientes'}
                />
                
                <IconButtonWithTooltip 
                  icon={FileText}
                  tooltip="DIAN"
                  onClick={() => handleViewChange('dian')}
                  isSelected={currentView === 'dian'}
                />
                
                <IconButtonWithTooltip 
                  icon={Settings}
                  tooltip="Ajustes"
                  onClick={() => handleViewChange('ajustes')}
                  isSelected={currentView === 'ajustes'}
                />
              </IconsContainer>
            </IconsScrollContainer>
          </LeftSection>

          <RightSection>
            <TimeContainer>
              <DateText>{formatDate(currentTime)}</DateText>
              <TimeText>{formatTime(currentTime)}</TimeText>
            </TimeContainer>

            <ProBadge>PRO</ProBadge>

            <UserSection>
              <User size={20} strokeWidth={1.5} />
              <span>{data && data[4] ? data[4] : "Usuario"}</span>
            </UserSection>

            <IconButtonWithTooltip 
              icon={Mail}
              tooltip="Mensajes"
              onClick={() => handleViewChange('mensajes')}
              isSelected={currentView === 'mensajes'}
            />
            
            <IconButtonWithTooltip 
              icon={HelpCircle}
              tooltip="Ayuda"
              onClick={() => handleViewChange('ayuda')}
              isSelected={currentView === 'ayuda'}
            />
          </RightSection>
        </DesktopNavWrapper>

        {/* VISTA MÓVIL - sin cambios */}
        <MobileNavWrapper>
          <MobileIconButton
            onClick={handlePrincipalClick}
            isSelected={currentView === 'principal'}
          >
            <Home strokeWidth={1.5} />
            <span>Inicio</span>
          </MobileIconButton>
          
          <MobileIconButton
            onClick={() => handleViewChange('productos')}
            isSelected={currentView === 'productos'}
          >
            <Package strokeWidth={1.5} />
            <span>Productos</span>
          </MobileIconButton>
          
          <MobileIconButton
            onClick={() => handleViewChange('clientes')}
            isSelected={currentView === 'clientes'}
          >
            <Users strokeWidth={1.5} />
            <span>Clientes</span>
          </MobileIconButton>
          
          <MobileIconButton
            onClick={() => handleViewChange('ventas')}
            isSelected={currentView === 'ventas'}
          >
            <BarChart2 strokeWidth={1.5} />
            <span>Ventas</span>
          </MobileIconButton>
          
          <MobileIconButton
            onClick={toggleMobileMenu}
            isSelected={mobileMenuOpen}
          >
            <Grid strokeWidth={1.5} />
            <span>Más</span>
          </MobileIconButton>
        </MobileNavWrapper>

        {/* Panel expandido móvil */}
        <MobileExpandedPanel isOpen={mobileMenuOpen}>
          <PanelTitle>Más opciones</PanelTitle>
          <IconsGrid>
            <PanelButton
              onClick={() => handleViewChange('cerrarCaja')}
              isSelected={currentView === 'cerrarCaja'}
            >
              <Archive strokeWidth={1.5} />
              <span>Cerrar Caja</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('egreso')}
              isSelected={currentView === 'egreso'}
            >
              <ArrowDownCircle strokeWidth={1.5} />
              <span>Egreso</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('impresora')}
              isSelected={currentView === 'impresora'}
            >
              <Printer strokeWidth={1.5} />
              <span>Impresora</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('dian')}
              isSelected={currentView === 'dian'}
            >
              <FileText strokeWidth={1.5} />
              <span>DIAN</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('ajustes')}
              isSelected={currentView === 'ajustes'}
            >
              <Settings strokeWidth={1.5} />
              <span>Ajustes</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('mensajes')}
              isSelected={currentView === 'mensajes'}
            >
              <Mail strokeWidth={1.5} />
              <span>Mensajes</span>
            </PanelButton>
            
            <PanelButton
              onClick={() => handleViewChange('ayuda')}
              isSelected={currentView === 'ayuda'}
            >
              <HelpCircle strokeWidth={1.5} />
              <span>Ayuda</span>
            </PanelButton>
          </IconsGrid>
        </MobileExpandedPanel>
      </NavContainer>
    </>
  );
};

export default Navbar;