import React, { useState } from 'react';
import styled from 'styled-components';

// Contenedor principal con scroll horizontal para móviles
const Container = styled.div`
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  height: 60px !important;
  width: 100% !important;
  background-color: #ffffff !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
  font-family: Arial, sans-serif !important;
  overflow-x: auto !important; /* Habilita el scroll horizontal */
  -webkit-overflow-scrolling: touch !important; /* Scroll suave en iOS */
  scrollbar-width: none !important; /* Oculta scrollbar en Firefox */
  -ms-overflow-style: none !important; /* Oculta scrollbar en IE/Edge */
  
  /* Oculta completamente la scrollbar en Chrome/Safari pero mantiene funcionalidad */
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`;

// Elemento de menú con ancho mínimo para evitar que se comprima demasiado
const OpcionMenu = styled.div`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 25px !important;
  height: 100% !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  color: #333333 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  position: relative !important;
  white-space: nowrap !important; /* Evita que el texto se rompa en múltiples líneas */
  min-width: max-content !important; /* Asegura que el ancho sea al menos el contenido */

  &:hover {
    color: #2563eb !important;
    background-color: #f8fafc !important;
  }

  ${props => props.activo && `
    color: #2563eb !important;
    &:after {
      content: '' !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 3px !important;
      background-color: #2563eb !important;
    }
  `}
`;

// Botón agregar a la izquierda con flex-shrink: 0 para evitar que se encoja
const BotonAgregar = styled.button`
  background-color: #2563eb !important;
  color: #ffffff !important;
  padding: 8px 18px !important;
  margin-right: 20px !important;
  margin-left: 20px !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
  font-size: 14px !important;
  align-self: center !important;
  font-family: Arial, sans-serif !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3) !important;
  flex-shrink: 0 !important; /* Evita que el botón se encoja */
  white-space: nowrap !important;

  &:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4) !important;
  }
`;

// Espaciador que puede encogerse en móviles
const Espaciador = styled.div`
  flex: 1 !important;
  min-width: 20px !important; /* Ancho mínimo en móviles */
`;

const Opcionesdeinventario = ({ onSeleccionarOpcion }) => {
  // Estado para la opción activa
  const [opcionActiva, setOpcionActiva] = useState('producto');
  
  // Función para manejar el cambio de opción
  const cambiarOpcion = (opcion) => {
    setOpcionActiva(opcion);
    if (onSeleccionarOpcion) {
      onSeleccionarOpcion(opcion);
    }
  };

  return (
    <Container>
      <BotonAgregar onClick={() => cambiarOpcion('producto')}>
        + Agregar Producto
      </BotonAgregar>
      
      <OpcionMenu 
        activo={opcionActiva === 'stock0'} 
        onClick={() => cambiarOpcion('stock0')}
      >
        Producto stock 0
      </OpcionMenu>
      
      <OpcionMenu 
        activo={opcionActiva === 'general'} 
        onClick={() => cambiarOpcion('general')}
      >
        Producto General
      </OpcionMenu>
      
      <OpcionMenu 
        activo={opcionActiva === 'inventario'} 
        onClick={() => cambiarOpcion('inventario')}
      >
        Valor Inventario
      </OpcionMenu>
      
      <OpcionMenu 
        activo={opcionActiva === 'consulta'} 
        onClick={() => cambiarOpcion('consulta')}
      >
        Consulta
      </OpcionMenu>
      
      <Espaciador />
    </Container>
  );
};

export default Opcionesdeinventario;