import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { mesaconfigurar, mesainsertardinamicamente, mesamostrarconfigurar } from '../../../../Api/Tasksalon';

// Contenedor principal
const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 1rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

// Panel de control superior
const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #eeeeee;
  }
`;

const PanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

// Botón para crear mesa
const CreateTableButton = styled.button`
  margin-bottom: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #4CD964;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: ${props => props.disabled ? 0.7 : 1};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    background-color: #3cae52;
  }
`;

// Icono para el botón de crear mesa
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Grid con columnas dinámicas
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  grid-gap: 0.75rem;
  width: 100%;
`;

// Celdas
const Cell = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background-color: ${props => {
    // Si tiene forma verde, tiene prioridad
    if (props.shape === 'green-square' || props.shape === 'green-circle') return '#4CD964';
    // Si no tiene forma pero es la celda azul, mostrar azul claro
    if (props.isBlueLight && props.shape === 'default') return '#e6f0ff';
    // En otros casos, usar color estándar
    return props.selected ? '#f0f0f0' : 'white';
  }};
  border: 1px solid ${props => {
    // Si tiene forma verde, tiene prioridad
    if (props.shape === 'green-square' || props.shape === 'green-circle') return '#4CD964';
    // Si no tiene forma pero es la celda azul, mostrar borde azul claro
    if (props.isBlueLight && props.shape === 'default') return '#a6c8ff';
    // En otros casos, usar borde estándar
    return props.selected ? '#ddd' : '#e5e5e5';
  }};
  border-radius: ${props => {
    if (props.shape === 'green-circle') return '50%';
    if (props.shape === 'green-square') return '16px';
    if (props.isBlueLight && props.shape === 'default') return '16px';
    return '8px';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`;

// Texto de la celda
const CellText = styled.span`
  color: ${props => {
    switch(props.shape) {
      case 'green-square': 
      case 'green-circle': 
        return 'white';
      default: 
        return '#333';
    }
  }};
  font-family: Arial, sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  user-select: none;
  text-align: center;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Panel de edición
const EditPanel = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
`;

const TextInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const ShapeOptionsLabel = styled.h4`
  width: 100%;
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #555;
`;

const ShapeOptionsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const ShapeOption = styled.div`
  width: 60px;
  height: 60px;
  background-color: #4CD964; // Siempre verde
  border: 3px solid ${props => props.selected ? '#000' : '#4CD964'};
  border-radius: ${props => props.shape === 'green-circle' ? '50%' : '16px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 0 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: space-between;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  background-color: ${props => {
    if (props.disabled) return '#d1d5db';
    return props.primary ? '#3b82f6' : '#f3f4f6';
  }};
  color: ${props => {
    if (props.disabled) return '#9ca3af';
    return props.primary ? 'white' : '#333';
  }};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? '#2563eb' : '#e5e7eb'};
  }
`;

const DeleteButton = styled.button`
  padding: 0.6rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    background-color: #dc2626;
  }
`;

// Iconos para los botones de navegación
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Componente principal
const ConfiguracionMesa = ({ totalCells = 36, salonId }) => {
  // Estados
  const [cells, setCells] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedShape, setSelectedShape] = useState('green-square');
  const [nameError, setNameError] = useState('');
  const [tableCount, setTableCount] = useState(0); // Contador de mesas configuradas
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar las peticiones al backend
  
  // Referencias para manejar el enfoque y los eventos de teclado
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Solo permitir estas dos formas
  const availableShapes = [
    { id: 'green-square', name: 'Cuadrado Verde' },
    { id: 'green-circle', name: 'Círculo Verde' }
  ];
  
  // Inicializar celdas
  useEffect(() => {
    // Inicializar con un conjunto básico de celdas
    const initialCells = Array(totalCells).fill(0).map((_, index) => ({
      id: index + 1,
      text: '',
      shape: 'default',
      isBlueLight: index === 0, // Primera celda es azul claro
      salonId: salonId // Agregamos el salonId a cada celda
    }));
    
    setCells(initialCells);
    
    // Cargar la configuración de mesas para este salón específico
    const fetchMesasConfig = async () => {
      try {
        setIsLoading(true);
        const response = await mesamostrarconfigurar({id_salon: salonId});
        if (response.data && response.data.data) {
          // Formatear los datos y actualizar el estado cells
          const mesasConfig = response.data.data.map(mesa => {
            // Determinar la forma basada en la información de la API
            let shape = 'default';
            if (mesa.figura === 'green-square' || mesa.figura === 'green-circle') {
              shape = mesa.figura;
            } else if (mesa.mesa && mesa.mesa !== 'NULL' && mesa.mesa !== null) {
              // Si tiene texto pero no tiene forma, asignar cuadrado verde por defecto
              shape = 'green-square';
            }
            
            return {
              id: mesa.id_mesa,
              // Asegurar que si el texto es null o "NULL", se almacene como 'NULL'
              text: mesa.mesa === null || mesa.mesa === "NULL" ? 'NULL' : mesa.mesa,
              shape: shape,
              isBlueLight: false,
              salonId: salonId
            };
          });
          
          setCells(mesasConfig);
          
          // Contar todas las mesas que tienen cualquier valor de texto (incluso NULL)
          // o que tienen forma verde (aunque no tengan texto)
          const initialTableCount = mesasConfig.filter(cell => 
            (cell.text || cell.shape === 'green-square' || cell.shape === 'green-circle')
          ).length;
          
          console.log('Mesas cargadas:', mesasConfig);
          console.log('Contador inicial de mesas:', initialTableCount);
          
          setTableCount(initialTableCount);
        }
      } catch (error) {
        console.error('Error al cargar la configuración de mesas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMesasConfig();
    
    // Limpiar la selección cuando cambia el salón
    setSelectedCell(null);
    setInputText('');
    setSelectedShape('green-square');
    setNameError('');
    
  }, [totalCells, salonId]);
  
  // Actualizar contador de mesas configuradas
  useEffect(() => {
    // Contar todas las mesas, incluyendo las que tienen valor NULL o forma verde
    const configuredTables = cells.filter(cell => 
      cell.text || 
      cell.shape === 'green-square' || 
      cell.shape === 'green-circle'
    ).length;
    
    console.log('Contador actualizado de mesas:', configuredTables);
    setTableCount(configuredTables);
  }, [cells]);
  
  // Configurar event listener global para la tecla Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selectedCell && inputText.trim() !== '' && !isLoading) {
        saveChanges();
      }
    };

    // Aplicar el event listener al contenedor
    if (containerRef.current) {
      containerRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Remover el event listener al desmontar
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [selectedCell, inputText, selectedShape, isLoading]); // Agregar isLoading a las dependencias

  // Crear una nueva mesa
  const createNewTable = async() => {
    // Evitar crear mesa si hay una operación en curso
    if (isLoading) return;
    
    try {
      setIsLoading(true); // Activar indicador de carga
      
      // Llamar a la API para crear una nueva mesa y obtener su ID
      const response = await mesainsertardinamicamente({id_salon: salonId});
      const id_mesa = response.data.data;
      
      // Si hay una celda seleccionada sin nombre, exigir que primero se complete
      if (selectedCell) {
        const currentCell = cells.find(c => c.id === selectedCell);
        if (currentCell && (!currentCell.text || currentCell.text.trim() === '' || currentCell.text === 'NULL')) {
          setNameError('Debes ingresar un nombre para esta mesa antes de crear otra');
          if (inputRef.current) {
            inputRef.current.focus();
          }
          return;
        }
      }
      
      // Verificar si ya alcanzamos el límite de 40 mesas
      if (tableCount >= 40) {
        alert('No se pueden configurar más de 40 mesas');
        return;
      }
      
      console.log('Creando nueva mesa. Mesas actuales:', tableCount);
      
      // Crear una nueva celda usando el id_mesa de la API
      const newCell = {
        id: id_mesa, // Usar el ID devuelto por la API
        text: '',
        shape: 'green-square', // Asignar forma por defecto
        isBlueLight: false,
        salonId: salonId
      };
      
      // Agregar la nueva celda al array de celdas
      const updatedCells = [...cells, newCell];
      setCells(updatedCells);
      
      // Seleccionar la nueva celda para edición
      setSelectedCell(id_mesa);
      setInputText('');
      setSelectedShape('green-square');
      setNameError('');
      
      // Enfocar el campo de texto
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
      
      console.log('Nueva celda creada:', newCell);
    } catch (error) {
      console.error('Error al crear nueva mesa:', error);
      setNameError('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false); // Desactivar indicador de carga
    }
  };
  
  // Manejar clic en celda
  const handleCellClick = (cellId) => {
    // Evitar seleccionar celdas si hay una operación en curso
    if (isLoading) return;
    
    // Si ya está seleccionada, deseleccionar
    if (selectedCell === cellId) {
      setSelectedCell(null);
      setInputText('');
      setSelectedShape('green-square');
      setNameError('');
      return;
    }
    
    // Seleccionar nueva celda y cargar su texto
    setSelectedCell(cellId);
    const cell = cells.find(c => c.id === cellId);
    setInputText(cell?.text === 'NULL' ? '' : (cell?.text || ''));
    setSelectedShape(cell?.shape === 'green-circle' ? 'green-circle' : 'green-square');
    setNameError('');
    
    // Asegurar que el campo de texto obtenga el foco
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };
  
  // Actualizar texto de entrada
  const handleTextChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value.trim() === '') {
      setNameError('Debes ingresar un nombre');
    } else {
      setNameError('');
    }
  };
  
  // Manejar tecla Enter en el campo de texto
  const handleKeyDown = (e) => {
    // Evitar acción si hay una operación en curso
    if (isLoading) return;
    
    if (e.key === 'Enter' && inputText.trim() !== '') {
      e.preventDefault(); // Prevenir la acción por defecto
      saveChanges();
    }
  };
  
  // Cambiar forma de la celda
  const changeShape = (shapeId) => {
    // Evitar cambiar forma si hay una operación en curso
    if (isLoading) return;
    
    setSelectedShape(shapeId);
    
    // Al seleccionar una forma, devolver el foco al contenedor para capturar el Enter
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };
  
  // Guardar cambios y seleccionar siguiente celda disponible
  const saveChanges = async() => {
    // Verificar que no haya una operación en curso y que hay una celda seleccionada
    if (isLoading || !selectedCell) return;
    
    // Validar que se haya ingresado un nombre
    if (inputText.trim() === '') {
      setNameError('Debes ingresar un nombre');
      return;
    }
    
    // Verificar si estamos agregando una nueva mesa (si antes no tenía forma verde)
    const currentCell = cells.find(c => c.id === selectedCell);
    const isNewTable = currentCell && 
                      (currentCell.shape !== 'green-square' && currentCell.shape !== 'green-circle');

    
    // Si es una nueva mesa y ya tenemos 40 mesas configuradas, mostrar error
    if (isNewTable && tableCount >= 40) {
      setNameError('No se pueden configurar más de 40 mesas');
      return;
    }
    
    try {
      // Activar indicador de carga
      setIsLoading(true);
      
      // Realizar la petición al backend
      const response = await mesaconfigurar({
        id_mesa: selectedCell,
        mesa: inputText,
        figura: selectedShape // Enviar también la forma seleccionada
      });
      
      // Verificar respuesta exitosa
      if (response.data.data > 0) {
        // Actualizar la celda con los nuevos valores
        setCells(prevCells => prevCells.map(cell => 
          cell.id === selectedCell ? { ...cell, text: inputText, shape: selectedShape } : cell
        ));
        
        // Encontrar la siguiente celda disponible
        const currentIndex = cells.findIndex(c => c.id === selectedCell);
        let nextAvailableCell = null;
        
        // Buscar desde la posición actual hasta el final
        for (let i = currentIndex + 1; i < cells.length; i++) {
          const cell = cells[i];
          if (!cell.text || cell.text === '' || cell.text === 'NULL') {
            nextAvailableCell = cell;
            break;
          }
        }
        
        // Si no encontramos ninguna, buscar desde el principio hasta la posición actual
        if (!nextAvailableCell) {
          for (let i = 0; i < currentIndex; i++) {
            const cell = cells[i];
            if (!cell.text || cell.text === '' || cell.text === 'NULL') {
              nextAvailableCell = cell;
              break;
            }
          }
        }
        
        // Si encontramos una celda disponible, seleccionarla y enfocar el input
        if (nextAvailableCell) {
          setSelectedCell(nextAvailableCell.id);
          setInputText(nextAvailableCell.text === 'NULL' ? '' : (nextAvailableCell.text || ''));
          setSelectedShape(nextAvailableCell.shape === 'green-circle' ? 'green-circle' : 'green-square');
          setNameError('');
          
          // Enfocar el campo de texto
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 10);
        } else {
          // Si no hay celdas disponibles, limpiar la selección
          setSelectedCell(null);
          setInputText('');
          setSelectedShape('green-square');
          setNameError('');
        }
      } else {
        // Si la API devuelve un código de error o 0, mostrar error
        setNameError('Error al guardar los cambios. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setNameError('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      // Desactivar indicador de carga al finalizar
      setIsLoading(false);
    }
  };
  
  // Eliminar celda
  const deleteCell = async () => {
    // Verificar que no haya una operación en curso y que hay una celda seleccionada
    if (isLoading || !selectedCell) return;
    
    // Obtener la celda actual
    const currentCell = cells.find(c => c.id === selectedCell);
    if (!currentCell) return;
    
    try {
      // Activar indicador de carga
      setIsLoading(true);
      
      // Llamar a API para eliminar mesa (si es necesario implementar esta función)
      const response = await mesaconfigurar({
        id_mesa: selectedCell,
        mesa: 'NULL', // Enviar cadena vacía para "eliminar"
        figura: 'green-square' // Restablecer a forma predeterminada
      });
      
      // Verificar respuesta exitosa
      if (response.data.data > 0) {
        // Restaurar la celda a su estado predeterminado
        setCells(cells.map(cell => 
          cell.id === selectedCell ? { ...cell, text: '', shape: 'default' } : cell
        ));
        
        // Seleccionar la siguiente celda (o volver a la primera)
        const nextCellIndex = cells.findIndex(c => c.id === selectedCell);
        const nextCell = nextCellIndex < cells.length - 1 
          ? cells[nextCellIndex + 1] 
          : cells[0];
        
        if (nextCell) {
          setSelectedCell(nextCell.id);
          // Si la celda tiene valor NULL, establecerlo como cadena vacía para editar
          setInputText(nextCell.text === 'NULL' ? '' : (nextCell.text || ''));
          setSelectedShape(nextCell.shape === 'green-circle' ? 'green-circle' : 'green-square');
          setNameError('');
          
          // Enfocar el campo de texto de la siguiente celda
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 10);
        }
      } else {
        setNameError('Error al eliminar la mesa. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar la mesa:', error);
      setNameError('Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      // Desactivar indicador de carga al finalizar
      setIsLoading(false);
    }
  };
  
  // Limpiar celda (cancelar)
  const clearCell = () => {
    // Evitar limpiar celda si hay una operación en curso
    if (isLoading) return;
    
    if (!selectedCell) return;
    
    setInputText('');
    setSelectedShape('green-square');
    setNameError('');
    setSelectedCell(null);
  };

  return (
    <Container ref={containerRef} tabIndex="-1">
      {/* Barra de navegación superior */}
      <ControlPanel>
        <ControlButton>
          <ChevronLeftIcon />
        </ControlButton>
        <PanelTitle>
          Configuración de Mesa - Salón {salonId}
          <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: tableCount >= 40 ? '#e53e3e' : '#718096' }}>
            ({tableCount}/40 mesas)
          </span>
        </PanelTitle>
        <ControlButton>
          <ChevronRightIcon />
        </ControlButton>
      </ControlPanel>
      
      {/* Botón para crear nueva mesa */}
      <CreateTableButton 
        onClick={createNewTable} 
        disabled={
          isLoading || 
          tableCount >= 40 || 
          (
            selectedCell && 
            cells.find(c => c.id === selectedCell) && 
            (!cells.find(c => c.id === selectedCell).text || 
            cells.find(c => c.id === selectedCell).text === '' || 
            cells.find(c => c.id === selectedCell).text === 'NULL')
          )
        }
      >
        <PlusIcon /> Crear Mesa ({40 - tableCount} restantes)
      </CreateTableButton>
      
      {/* Grid de celdas */}
      <Grid>
        {cells.map((cell) => (
          <Cell 
            key={cell.id}
            selected={selectedCell === cell.id}
            shape={cell.shape}
            isBlueLight={cell.isBlueLight}
            onClick={() => handleCellClick(cell.id)}
            disabled={isLoading}
          >
            {/* Mostrar texto cuando existe, pero no mostrar la palabra "NULL" */}
            <CellText shape={cell.shape}>
              {cell.text !== "NULL" ? cell.text : ""}
            </CellText>
          </Cell>
        ))}
      </Grid>
      
      {/* Panel de edición (visible solo cuando hay celda seleccionada) */}
      {selectedCell && (
        <EditPanel>
          <InputGroup>
            <InputLabel htmlFor="cellName">Nombre para la celda {selectedCell}:</InputLabel>
            <TextInput 
              id="cellName"
              ref={inputRef}
              value={inputText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Ingresa un nombre para esta celda"
              autoFocus
              disabled={isLoading}
            />
            {nameError && <ErrorMessage>{nameError}</ErrorMessage>}
          </InputGroup>
          
          <div>
            <ShapeOptionsLabel>Selecciona una figura:</ShapeOptionsLabel>
            <ShapeOptionsContainer>
              {availableShapes.map((shape) => (
                <ShapeOption 
                  key={shape.id}
                  shape={shape.id}
                  selected={selectedShape === shape.id}
                  onClick={() => changeShape(shape.id)}
                  disabled={isLoading}
                  tabIndex={isLoading ? "-1" : "0"}
                />
              ))}
            </ShapeOptionsContainer>
          </div>
          
          <ButtonGroup>
            {/* Botón de eliminar (solo si ya tiene un nombre) */}
            {cells.find(c => c.id === selectedCell)?.text && (
              <DeleteButton onClick={deleteCell} disabled={isLoading}>
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </DeleteButton>
            )}
            
            <ActionButtons>
              <Button 
                primary 
                onClick={saveChanges} 
                disabled={
                  isLoading || 
                  inputText.trim() === '' || 
                  (tableCount >= 40 && !cells.find(c => c.id === selectedCell)?.text)
                }
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button onClick={clearCell} disabled={isLoading}>
                Cancelar
              </Button>
            </ActionButtons>
          </ButtonGroup>
        </EditPanel>
      )}
      
      {/* Indicador visual de carga (opcional) */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#3b82f6',
          zIndex: 1000,
          animation: 'loading 1.5s infinite linear'
        }} />
      )}
      
      {/* Estilos para la animación de carga */}
      <style jsx>{`
        @keyframes loading {
          0% { width: 0; }
          50% { width: 50%; }
          100% { width: 100%; }
        }
      `}</style>
    </Container>
  );
};

export default ConfiguracionMesa;