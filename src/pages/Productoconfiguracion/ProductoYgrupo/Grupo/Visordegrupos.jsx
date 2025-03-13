import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { grupoeliminar, grupomostraraconfigurar } from '../../../../Api/TaskgrupoYproducto';
import { useAuthStore } from '../../../authStore';
import AgregarGrupo from './AgregarGrupo';

// Main container with fixed width
const Container = styled.div`
  width: 300px;
  height: 100%;
  margin-right: auto;
  background-color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: flex-start;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
  overflow: hidden;
`;

// Button row
const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#6366F1' : 'white'};
  color: ${props => props.primary ? 'white' : '#6366F1'};
  border: 1px solid ${props => props.primary ? '#6366F1' : 'rgba(99, 102, 241, 0.3)'};
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#5152c8' : 'rgba(99, 102, 241, 0.05)'};
    transform: translateY(-1px);
  }
`;

// Search row
const SearchRow = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  position: relative;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
`;

const SearchInput = styled.input`
  background-color: #f9fafb;
  color: #333;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  cursor: text;
  
  &:focus {
    outline: none;
    border-color: #6366F1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    background-color: white;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6366F1;
  cursor: pointer;
`;

// Cost button row
const CostoRow = styled.div`
  padding: 24px 0;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
`;

const CostoButton = styled.button`
  padding: 12px 36px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  background: linear-gradient(135deg, #6366F1, #4f46e5);
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Items column with scroll
const ItemsColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 300px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.5);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #6366F1;
  }
`;

const ItemBox = styled.div`
  border: 1px solid ${props => props.selected ? '#6366F1' : 'rgba(99, 102, 241, 0.2)'};
  background-color: ${props => props.selected ? 'rgba(99, 102, 241, 0.05)' : 'white'};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  width: 100%;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
  position: relative;
  
  ${props => props.selected && `
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    transform: translateY(-2px);
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.15);
    border-color: #6366F1;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: ${props => props.selected ? '#6366F1' : 'transparent'};
    border-radius: 4px 0 0 4px;
    transition: all 0.3s ease;
  }
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  border: none;
  background-color: ${props => props.danger ? '#FEE2E2' : '#EEF2FF'};
  color: ${props => props.danger ? '#DC2626' : '#6366F1'};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.danger ? '#FCA5A5' : '#C7D2FE'};
    transform: scale(1.05);
  }
`;

const ColorBar = styled.div`
  width: 30px;
  height: 3px;
  background-color: ${props => props.selected ? '#4F46E5' : '#6366F1'};
  margin-bottom: 10px;
  border-radius: 2px;
  transition: all 0.3s ease;
`;

const ItemTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${props => props.selected ? '#4F46E5' : '#333'};
  transition: all 0.3s ease;
`;

const GruposComponent = ({setid_grupo}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authData = useAuthStore((state) => state.authData);
  // Use state to store items so we can modify the list
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const handleAddEvent = (newEvent) => {
    setItems((prevEvents) => [...prevEvents, newEvent]);
  };
  
  const handleUpdateEvent = (updatedEvent) => {
    setItems((prevEvents) => 
      prevEvents.map(item => 
        item.id_grupo === updatedEvent.id_grupo ? updatedEvent : item
      )
    );
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await grupomostraraconfigurar({id: authData[1]});
        // Ensure we have an array of objects with a 'nombre' (or similar) property
        setItems(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching grupos:", error);
        setError("No se pudieron cargar los grupos");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authData[1]]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
    setIsEditMode(false);
  };

  // Safely get the display property from an item
  const getItemName = (item) => {
    // Check if item is an object with the Grupo property
    if (typeof item === 'object' && item !== null && 'Grupo' in item) {
      return item.Grupo;
    } 
    // If it's a string, return it directly
    if (typeof item === 'string') {
      return item;
    }
    // Fallback
    return String(item);
  };
  
  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const itemName = getItemName(item);
    return itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleEdit = (item, e) => {
    e.stopPropagation(); // Prevent triggering the item click
    setItemToEdit(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  
  const handledselect = async (item) => {
    // Actualiza el estado local para el resaltado visual
    setSelectedGroupId(item.id_grupo);
    // Actualiza el estado en el componente padre
    setid_grupo(item.id_grupo);
  };
  
  const handleDelete = async (item, e) => {
    e.stopPropagation(); // Prevent triggering the item click
    const itemName = getItemName(item);
    
    // Actually delete the item from the array
    if (window.confirm(`¿Estás seguro que deseas eliminar "${itemName}"?`)) {
      // Here you would typically call your API to delete the item
      // For example: await deleteGrupo(item.id_grupo);
      const response = await grupoeliminar({id: item.id_grupo,id_empresa:authData[1]});
      console.log(response.data.data);
      if (response.data.data === "Grupo eliminado correctamente") {
        // Si estamos eliminando el grupo seleccionado, limpiamos la selección
        if (selectedGroupId === item.id_grupo) {
          setSelectedGroupId(null);
          setid_grupo(0); // Resetear la selección en el componente padre
        }
        
        setItems(items.filter(i => i.id_grupo !== item.id_grupo));
      
        // If we're searching, we might want to clear the search after deletion
        if (searchQuery && filteredItems.length <= 1) {
          setSearchQuery('');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ padding: '20px', textAlign: 'center', color: '#6366F1' }}>
          Cargando grupos...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626' }}>
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Button row */}
      <ButtonRow>
        <Button primary onClick={handleOpenModal}>+ Agregar</Button>
        <Button>Importar</Button>
      </ButtonRow>
      
      {/* Search row with functional search */}
      <SearchRow>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearch}
            autoFocus={false}
          />
          <SearchButton onClick={() => setSearchQuery('')} title={searchQuery ? 'Limpiar búsqueda' : 'Buscar'}>
            {searchQuery ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </SearchButton>
        </SearchContainer>
        {searchQuery && (
          <div style={{ 
            position: 'absolute', 
            bottom: '-10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '12px', 
            color: '#6366F1',
            backgroundColor: 'white',
            padding: '0 8px'
          }}>
          </div>
        )}
      </SearchRow>
      
      {/* Cost button row */}
      <CostoRow>
        <CostoButton>
          COSTO
        </CostoButton>
      </CostoRow>
      
      {/* Items in a single column with scroll */}
      <ItemsColumn>
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <ItemBox 
              key={index} 
              onClick={() => handledselect(item)}
              selected={item.id_grupo === selectedGroupId}
            >
              <ItemContent>
                <ColorBar selected={item.id_grupo === selectedGroupId} />
                <ItemTitle selected={item.id_grupo === selectedGroupId}>
                  {getItemName(item)}
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <ActionButton 
                  title="Editar"
                  onClick={(e) => handleEdit(item, e)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </ActionButton>
                <ActionButton 
                  danger 
                  title="Eliminar"
                  onClick={(e) => handleDelete(item, e)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </ActionButton>
              </ItemActions>
            </ItemBox>
          ))
        ) : (
          <div style={{ width: '100%', textAlign: 'center', padding: '20px 0', color: '#6366F1' }}>
            No se encontraron resultados
          </div>
        )}
      </ItemsColumn>
      <AgregarGrupo 
        isOpen={isModalOpen} 
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onClose={handleCloseModal}
        editMode={isEditMode}
        itemToEdit={itemToEdit}
      />
    </Container>
  );
};

export default GruposComponent;