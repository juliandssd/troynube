import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import GruposComponent from './Grupo/Visordegrupos';
import ProductHeader from './Producto/ProductHeader';
import ProductTable from './Producto/ProductTable';

// Componentes estilizados
const Container = styled.div`
  width: 100%;
  height: 100vh; /* Ocupa toda la altura de la ventana */
  margin: 0;
  display: flex;
  flex-direction: row; /* Por defecto en horizontal */
  overflow-y: auto; /* Añade scroll vertical cuando sea necesario */
  
  /* Media query para dispositivos móviles */
  @media (max-width: 768px) {
    flex-direction: column; /* Cambia a vertical en móviles */
    height: auto; /* Permite que la altura se ajuste al contenido */
    min-height: 100vh;
  }
`;

const Column = styled.div`
  width: ${props => props.width || 'auto'};
  flex: ${props => props.width ? 'none' : 1};
  height: 100%; /* Ocupa toda la altura del contenedor */
  display: flex;
  flex-direction: ${props => props.flexDirection || 'row'};
  background-color: ${props => props.color};
  overflow-y: auto; /* Añade scroll vertical cuando sea necesario */
  
  /* Media query para dispositivos móviles */
  @media (max-width: 768px) {
    width: 100%; /* Ancho completo en dispositivos móviles */
    flex: none; /* Evita que flex afecte al comportamiento */
    min-height: 200px; /* Altura mínima para cada columna en móviles */
  }
`;

const Row = styled.div`
  width: 100%;
  height: ${props => props.height || 'auto'};
  flex: ${props => props.height ? 'none' : 1};
  display: flex;
  background-color: ${props => props.color || 'inherit'};
  justify-content: ${props => props.justify || 'center'}; /* Centrando por defecto */
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
`;

const CategoryIcon = styled.div`
  margin-bottom: 1.5rem;
  font-size: 3rem;
  color: #e0e0e0;
`;

const CategoryTitle = styled.h2`
  color: #333;
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
`;

const CategorySubtitle = styled.p`
  color: #777;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

const ProductoyGrupoPrincipal = () => {
  const [id_grupo, setid_grupo] = useState(0);
  const [searchTerm, setsearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  // Función para añadir productos que se pasará a los componentes hijos
  const handleAddProduct = (newProduct) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };
  
  return (
    <Container>
      <Column width="300px">
        <GruposComponent setid_grupo={setid_grupo} />
      </Column>
      
      {id_grupo === 0 ? (
        <Column flexDirection="column">
          <Row justify="center">
            <SelectionContainer>
              <CategoryIcon>📂</CategoryIcon>
              <CategoryTitle>Selecciona una categoría</CategoryTitle>
              <CategorySubtitle>Elige una categoría para ver los productos disponibles</CategorySubtitle>
            </SelectionContainer>
          </Row>
        </Column>
      ) : (
        <Column flexDirection="column">
          <Row height="50px" justify="flex-start">
            <ProductHeader 
              id_grupo={id_grupo} 
              setsearchTerm={setsearchTerm} 
              onAddEvent={handleAddProduct} 
            />
          </Row>
          <Row>
            <ProductTable 
              searchTerm={searchTerm} 
              id_grupo={id_grupo}
              productData={products}
              setProductData={setProducts}
              onAddEvent={handleAddProduct}
            />
          </Row>
        </Column>
      )}
    </Container>
  );
};

export default ProductoyGrupoPrincipal;