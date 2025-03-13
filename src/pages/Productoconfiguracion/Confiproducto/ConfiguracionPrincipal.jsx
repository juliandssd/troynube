import React, { useState } from 'react';
import styled from 'styled-components';
import Opcionesdeinventario from '../Opcionesdeinventario/Opcionesdeinventario';
import ProductoyGrupoPrincipal from '../ProductoYgrupo/ProductoyGrupoPrincipal';

// Contenedor principal
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
  overflow: hidden; /* Evita el scroll en pantallas de escritorio */
  
  @media (max-width: 768px) {
    height: auto; /* Permite altura automática en móviles */
  }
`;

// Primera fila con altura fija de 60px
const PrimeraFila = styled.div`
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Evita que esta fila se encoja */
  background-color: white; /* Fondo para el menú */
  z-index: 10; /* Asegura que esté por encima en caso de scroll */
  
  @media (max-width: 768px) {
    position: sticky; /* Mantiene el menú visible al hacer scroll en móvil */
    top: 0;
  }
`;

// Segunda fila que ocupa el resto del espacio
const SegundaFila = styled.div`
  flex: 1;
  width: 100%;
  background-color: #f8fafc;
  min-height: 600px; /* Altura mínima para asegurar que haya espacio para el contenido */
  
  @media (max-width: 768px) {
    height: auto; /* Altura automática en móviles */
    min-height: auto; /* Elimina la altura mínima en móviles */
  }
`;

// Contenedor para mostrar el contenido seleccionado
const ContenidoOpcion = styled.div`
  background-color: white;
  height: 100%;
  min-height: 500px; /* Garantiza espacio para mostrar ambas columnas */
  overflow: hidden; /* Oculta scroll en escritorio */
  
  @media (max-width: 768px) {
    height: auto;
    min-height: auto; /* Elimina la altura mínima en móviles */
    overflow-y: visible; /* Permite que el contenido fluya naturalmente */
  }
`;

// Título del contenido
const TituloContenido = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  padding: 20px 20px 0 20px;
`;

// Descripción del contenido
const DescripcionContenido = styled.p`
  font-size: 16px;
  color: #555;
  line-height: 1.6;
  padding: 0 20px 20px 20px;
`;

// Componente para encapsular contenido con padding consistente
const ContenidoConPadding = styled.div`
  padding: 20px;
`;

// Contenedor para contenido de ejemplo (solo se muestra en móvil)
const MobileOnlyContent = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    padding: 0 20px;
  }
`;

const Productoconfiguracionprincipal = () => {
  // Estado para controlar qué contenido mostrar en la segunda fila
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('producto');

  // Función para manejar el cambio de opción
  const handleSeleccionarOpcion = (opcion) => {
    setOpcionSeleccionada(opcion);
  };

  // Renderizar el contenido según la opción seleccionada
  const renderizarContenido = () => {
    switch (opcionSeleccionada) {
      case 'stock0':
        return (
          <ContenidoConPadding>
            <TituloContenido>Productos con Stock 0</TituloContenido>
            <DescripcionContenido>
              Aquí puedes visualizar y gestionar todos los productos que actualmente tienen un stock de 0 unidades.
            </DescripcionContenido>
            
            {/* Contenido de ejemplo solo visible en móvil */}
            <MobileOnlyContent>
              {[...Array(15)].map((_, i) => (
                <p key={i} style={{ marginBottom: '15px' }}>
                  Producto de ejemplo con stock 0 #{i+1} - Este contenido solo aparece en la vista móvil para demostrar el scroll.
                </p>
              ))}
            </MobileOnlyContent>
          </ContenidoConPadding>
        );
      case 'general':
        return (
          <ContenidoConPadding>
            <TituloContenido>Productos General</TituloContenido>
            <DescripcionContenido>
              Vista general de todos los productos en el inventario, independientemente de su stock o categoría.
            </DescripcionContenido>
            
            {/* Contenido de ejemplo solo visible en móvil */}
            <MobileOnlyContent>
              {[...Array(15)].map((_, i) => (
                <p key={i} style={{ marginBottom: '15px' }}>
                  Producto general #{i+1} - Este contenido solo aparece en la vista móvil.
                </p>
              ))}
            </MobileOnlyContent>
          </ContenidoConPadding>
        );
      case 'inventario':
        return (
          <ContenidoConPadding>
            <TituloContenido>Vista de Inventario</TituloContenido>
            <DescripcionContenido>
              Visualización completa del inventario con opciones para filtrar y gestionar los productos.
            </DescripcionContenido>
            
            {/* Contenido de ejemplo solo visible en móvil */}
            <MobileOnlyContent>
              {[...Array(15)].map((_, i) => (
                <p key={i} style={{ marginBottom: '15px' }}>
                  Item de inventario #{i+1} - Este contenido solo aparece en la vista móvil.
                </p>
              ))}
            </MobileOnlyContent>
          </ContenidoConPadding>
        );
      case 'consulta':
        return (
          <ContenidoConPadding>
            <TituloContenido>Consulta de Productos</TituloContenido>
            <DescripcionContenido>
              Herramienta de búsqueda y consulta avanzada para encontrar productos específicos en el inventario.
            </DescripcionContenido>
            
            {/* Contenido de ejemplo solo visible en móvil */}
            <MobileOnlyContent>
              {[...Array(15)].map((_, i) => (
                <p key={i} style={{ marginBottom: '15px' }}>
                  Resultado de consulta #{i+1} - Este contenido solo aparece en la vista móvil.
                </p>
              ))}
            </MobileOnlyContent>
          </ContenidoConPadding>
        );
      case 'producto':
        return <ProductoyGrupoPrincipal />;
      default:
        return (
          <ContenidoConPadding>
            <TituloContenido>Selecciona una opción</TituloContenido>
            <DescripcionContenido>
              Por favor, selecciona una opción del menú superior para ver su contenido.
            </DescripcionContenido>
          </ContenidoConPadding>
        );
    }
  };

  return (
    <Container>
      <PrimeraFila>
        <Opcionesdeinventario onSeleccionarOpcion={handleSeleccionarOpcion} />
      </PrimeraFila>
      
      <SegundaFila>
        <ContenidoOpcion>
          {renderizarContenido()}
        </ContenidoOpcion>
      </SegundaFila>
    </Container>
  );
};

export default Productoconfiguracionprincipal;