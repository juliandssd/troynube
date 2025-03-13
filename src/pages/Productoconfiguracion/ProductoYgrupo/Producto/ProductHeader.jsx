import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, Plus, Settings, FileSpreadsheet } from 'lucide-react';
import ProductFormDemo from './ProductFormDemo';

// Styled Components
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  border-bottom: 1px solid #f1f1f1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: white;
  background-color: #6366F1;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #5253cc;
    box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  margin: 0 20px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #a5b4fc;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 4px;
  background-color: transparent;
  border: none;
  outline: none;
  color: #4b5563;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIconWrapper = styled.div`
  margin: 0 12px;
  color: #6366F1;
`;

const ImportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-right: 12px;
  color: #6366F1;
  background-color: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.15);
  }
`;

const ProductHeader = ({ id_grupo, setsearchTerm, onAddEvent }) => {
  const [showProductForm, setShowProductForm] = useState(false);
  
  const openProductForm = () => {
    setShowProductForm(true);
  };
    
  // Función para cerrar el modal
  const closeProductForm = () => {
    setShowProductForm(false);
  };
    
  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setsearchTerm(e.target.value);
  };

  // Función para manejar la adición de un nuevo producto
  const handleAddProduct = (newProduct) => {
    // Llamar a la función proporcionada por el componente padre
    if (onAddEvent) {
      onAddEvent(newProduct);
    }
    // Cerrar el formulario
    closeProductForm();
  };
    
  return (
    <HeaderContainer>
      {/* Add Product Button */}
      <PrimaryButton onClick={openProductForm}>
        <Plus size={18} />
        <span>Agregar Producto</span>
      </PrimaryButton>
        
      {/* Search Bar */}
      <SearchContainer>
        <SearchIconWrapper>
          <Search size={18} />
        </SearchIconWrapper>
        <SearchInput 
          placeholder="Buscar..."
          onChange={handleSearchChange}
        />
      </SearchContainer>
        
      {/* Excel Import Button */}
      <ImportButton>
        <FileSpreadsheet size={18} />
        <span>Importar desde EXCEL</span>
      </ImportButton>
        
      {/* Configuration Button */}
      <PrimaryButton>
        <Settings size={18} />
        <span>Configuración</span>
      </PrimaryButton>
      
      {/* Mostrar el formulario de productos cuando showProductForm es true */}
      {showProductForm && (
        <ProductFormDemo
          onClose={closeProductForm}
          id_grupo={id_grupo}
          onAddEvent={onAddEvent}
        />
      )}
    </HeaderContainer>
  );
};

export default ProductHeader;