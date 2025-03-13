import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import SalonModal from './AgregarSAlon';
import { useAuthStore } from '../../../authStore';
import { saloneliminar, salonmostrarporidempresa } from '../../../../Api/Tasksalon';

// Iconos
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 2.5L20.5 5.5L13 13H10V10L17.5 2.5Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  background-color: #F9FAFB;
  padding: 24px 20px;
  border-radius: 16px;
  font-family: Arial, sans-serif;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  background-color: white;
  font-size: 14px;
  font-family: Arial, sans-serif;
  outline: none;
  transition: all 0.2s ease;
  height: 38px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  
  &:focus {
    border-color: #6366F1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  display: flex;
  align-items: center;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #6366F1;
    box-shadow: 0 1px 5px rgba(99, 102, 241, 0.2);
  }
  
  ${props => props.selected && `
    border-color: #10B981;
    background-color: #ECFDF5;
    box-shadow: 0 1px 5px rgba(16, 185, 129, 0.2);
  `}
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const Indicator = styled.div`
  width: 4px;
  height: 24px;
  background-color: ${props => props.color || '#6366F1'};
  border-radius: 4px;
  margin-right: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  font-family: Arial, sans-serif;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.bgColor || '#F3F4F6'};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background-color: #6366F1;
  color: white;
  font-weight: 500;
  font-size: 15px;
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  height: 46px;
  font-family: Arial, sans-serif;
`;

// Componentes para el modal de confirmación
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ConfirmationModal = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: Arial, sans-serif;
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
`;

const ModalText = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ConfirmButton = styled.button`
  background-color: #EF4444;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #DC2626;
  }
`;

const CancelButton = styled.button`
  background-color: #F3F4F6;
  color: #4B5563;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #E5E7EB;
  }
`;

// Componente principal
const ModernComponent = ({ onSalonSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [salonNameToDelete, setSalonNameToDelete] = useState('');
  const [editingSalon, setEditingSalon] = useState(null); // Nuevo estado para el salón que se está editando
  const [isEditing, setIsEditing] = useState(false); // Estado para indicar si estamos en modo edición
  const authData = useAuthStore((state) => state.authData);
  const empresaId = useMemo(() => authData[1], [authData]);
  
  // Fix para el error: verificamos que item y salon existan antes de usar toLowerCase
  const filteredItems = items.filter(item => 
    item && item.salon && typeof item.salon === 'string' && 
    item.salon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async() => {
      try {
        const response = await salonmostrarporidempresa({id: empresaId});
        console.log('Respuesta API:', response.data);
        
        // Comprobar que tenemos datos válidos
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Comprobar la estructura y formatear si es necesario
          const datosFormateados = response.data.data.map(item => {
            // Si el item es nulo o no tiene las propiedades necesarias, lo ignoramos
            if (!item) return null;
            
            return {
              id: item.id_salon || item.id || 0,
              salon: item.salon || 'Sin nombre',
              propina: item.propina || "NO", // Agregar la información de propina
              color: '#6366F1' // Color por defecto
            };
          }).filter(Boolean); // Eliminar elementos nulos
          
          setItems(datosFormateados);
          
          // ELIMINAMOS LA SELECCIÓN AUTOMÁTICA
          // No seleccionar ningún salón al cargar - el usuario debe hacer clic explícitamente
        } else {
          console.warn('Formato de datos inesperado:', response.data);
          setItems([]);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setItems([]);
      }
    }
    fetchData();
  }, [empresaId]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const response = await saloneliminar({id_salon: itemToDelete});
      if (response.data.data > 0) {
        setItems(items.filter(item => item.id !== itemToDelete));
        if (selectedSalon === itemToDelete) {
          // Si se elimina el salón seleccionado, quitar la selección
          setSelectedSalon(null);
          // Notificar al componente padre
          onSalonSelect && onSalonSelect(null);
        }
        
        // Cerrar el modal de confirmación
        setShowDeleteConfirmation(false);
        setItemToDelete(null);
        setSalonNameToDelete('');
      }
    } catch (error) {
      console.error('Error al eliminar el salón:', error);
    }
  };
  
  const handleDeleteCancel = () => {
    // Cancelar la eliminación
    setShowDeleteConfirmation(false);
    setItemToDelete(null);
    setSalonNameToDelete('');
  };
  
  const handleDelete = (id, name) => {
    // En lugar de eliminar directamente, mostrar el modal de confirmación
    setItemToDelete(id);
    setSalonNameToDelete(name);
    setShowDeleteConfirmation(true);
  };
  
  const handleEdit = (id) => {
    // Buscar el salón a editar
    const salonToEdit = items.find(item => item.id === id);
    if (salonToEdit) {
      setEditingSalon(salonToEdit);
      setIsEditing(true);
      setShowSalonModal(true);
    }
  };
  
  const handleAdd = () => {
    // Resetear el estado de edición
    setEditingSalon(null);
    setIsEditing(false);
    setShowSalonModal(true);
  };
  
  // Esta es la función que actualiza automáticamente la lista cuando se añade un salón
  const onAddEvent = (newData) => {
    if (newData && newData.id_salon) {
      // Crear un objeto con el nuevo salón
      const newSalon = {
        id: newData.id_salon,
        salon: newData.salon || 'Nuevo salón',
        propina: newData.propina || "NO",
        color: '#6366F1' // Color por defecto
      };
      
      // Actualizar el estado con el nuevo salón
      setItems(prevItems => [...prevItems, newSalon]);
      
      // Seleccionar el nuevo salón
      setSelectedSalon(newData.id_salon);
      
      // Notificar al componente padre sobre la selección
      onSalonSelect && onSalonSelect(newData.id_salon);
    }
  };
  
  // Nueva función para manejar las actualizaciones de salón
  const onUpdateEvent = (updatedData) => {
    if (updatedData && updatedData.id_salon) {
      // Actualizar el salón en la lista
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === updatedData.id_salon ? 
          {
            ...item,
            salon: updatedData.salon,
            propina: updatedData.propina || item.propina
          } : 
          item
        )
      );
    }
  };
  
  const handleSelect = (id) => {
    console.log(`Seleccionando salón ${id}`);
    
    // Si se hace clic en el salón ya seleccionado, dejarlo seleccionado
    setSelectedSalon(id);
    
    // Notificar al componente padre sobre la selección
    onSalonSelect && onSalonSelect(id);
  };
  
  const handleCloseModal = () => {
    setShowSalonModal(false);
    setIsEditing(false);
    setEditingSalon(null);
  };
  
  return (
    <Container>
      <AddButton onClick={handleAdd}>
        <AddIcon />
        Agregar Nuevo Salón
      </AddButton>
      
      <SearchContainer>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <SearchInput 
          type="text" 
          placeholder="Buscar salón..." 
          value={searchQuery}
          onChange={handleSearch}
        />
      </SearchContainer>
      
      <CardsContainer>
        {filteredItems.map(item => (
          <Card 
            key={item.id}
            selected={selectedSalon === item.id}
            onClick={() => handleSelect(item.id)}
          >
            <LeftSection>
              <Indicator color={item.color} />
              <Title>{item.salon}</Title>
            </LeftSection>
            <ActionButtons>
              {selectedSalon === item.id && (
                <IconButton bgColor="#DCFCE7">
                  <CheckIcon />
                </IconButton>
              )}
              <IconButton 
                bgColor="#EEF2FF"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item.id);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                bgColor="#FEE2E2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id, item.salon);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ActionButtons>
          </Card>
        ))}
        
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontFamily: 'Arial, sans-serif' }}>
            No se encontraron resultados
          </div>
        )}
      </CardsContainer>
      
      {showSalonModal && (
        <SalonModal 
          onAddEvent={onAddEvent} 
          onUpdateEvent={onUpdateEvent}
          empresaId={empresaId} 
          onClose={handleCloseModal}
          isEditing={isEditing}
          salonData={editingSalon}
        />
      )}
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirmation && (
        <ModalBackdrop>
          <ConfirmationModal>
            <ModalTitle>Confirmar eliminación</ModalTitle>
            <ModalText>
              ¿Está seguro que desea eliminar el salón "{salonNameToDelete}"? Esta acción no se puede deshacer.
            </ModalText>
            <ButtonsContainer>
              <CancelButton onClick={handleDeleteCancel}>
                Cancelar
              </CancelButton>
              <ConfirmButton onClick={handleDeleteConfirm}>
                Eliminar
              </ConfirmButton>
            </ButtonsContainer>
          </ConfirmationModal>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default ModernComponent;