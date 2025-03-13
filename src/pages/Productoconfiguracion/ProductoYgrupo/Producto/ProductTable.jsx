// ProductTable.jsx
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { productoeliminar, productomostrarporidgrupo } from '../../../../Api/TaskgrupoYproducto';
import { useAuthStore } from '../../../authStore';

// Outer container with border
const OuterContainer = styled.div`
  display: block;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background-color: white;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  background-color: white;
`;

const TableHeader = styled.thead`
  tr {
    background-color: white;
    color: black;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    padding: 0.75rem 1.5rem;
    text-align: left;
    font-weight: bold;
  }
`;

const TableBody = styled.tbody`
  tr {
    background-color: white;
    border-bottom: 1px solid #f0f0f0;
  }

  tr:hover {
    background-color: #f9f9f9;
  }

  td {
    padding: 0.75rem 1.5rem;
    color: black;
  }
`;

const DeleteButtonCell = styled.td`
  padding: 0.75rem;
  width: 40px;
`;

const DeleteButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f87171;
  color: white;
  border-radius: 9999px;
  width: 28px;
  height: 28px;
  font-size: 0.875rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ef4444;
  }
`;

const ConfirmationModal = styled.div`
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

const ConfirmationBox = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
`;

const ConfirmationTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #111827;
`;

const ConfirmationText = styled.p`
  margin-bottom: 1.5rem;
  color: #374151;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
`;

const CancelButton = styled(Button)`
  background-color: #f3f4f6;
  color: #111827;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: #ef4444;
  color: white;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

// Main component
const ProductTable = ({ searchTerm = '', id_grupo, productData, setProductData, onAddEvent }) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const authData = useAuthStore((state) => state.authData);
    const empresaId = useMemo(() => authData[1], [authData]);
    
    // Actualizado: si recibimos productData como prop, actualizamos nuestro estado local
    useEffect(() => {
        if (productData && productData.length > 0) {
            setData(prevData => {
                // Solo añadir productos que no estén ya en el array
                const newData = [...prevData];
                productData.forEach(newProduct => {
                    if (!newData.some(item => item.id_producto === newProduct.id_producto)) {
                        newData.push(newProduct);
                    }
                });
                return newData;
            });
        }
    }, [productData]);

    // Función para añadir un nuevo producto (se pasa hacia arriba)
    const handleAddEvent = (newEvent) => {
        setData(prevData => [...prevData, newEvent]);
        // Propagamos el cambio hacia arriba si existe la función
        if (onAddEvent) {
            onAddEvent(newEvent);
        }
    };

    // Fetch data when id_grupo changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await productomostrarporidgrupo({ id: id_grupo });
                
                if (response.data && response.data.data) {
                    setData(response.data.data);
                    // Si tenemos una función para actualizar datos en el componente padre
                    if (setProductData) {
                        setProductData(response.data.data);
                    }
                } else {
                    console.error("Estructura de respuesta inesperada:", response);
                    setData([]);
                }
            } catch (error) {
                console.error("Error al obtener datos:", error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (id_grupo) {
            fetchData();
        }
    }, [id_grupo, setProductData]);

    // Filter data based on search term
    useEffect(() => {
        if (!searchTerm || !searchTerm.trim()) {
            setFilteredData(data);
            return;
        }
        
        const term = searchTerm.toLowerCase();
        
        const filtered = data.filter(item => 
            (item.Descripcion && item.Descripcion.toLowerCase().includes(term)) ||
            (item.Codigo && item.Codigo.toString().includes(term)) ||
            (item.venta && item.venta.toString().includes(term)) ||
            (item.stock && item.stock.toString().includes(term))
        );
        
        setFilteredData(filtered);
    }, [searchTerm, data]);

    // Handle delete request - Ahora captura el id_producto
    const handleDeleteRequest = (id_producto) => {
        setItemToDelete(id_producto);
        setShowConfirmation(true);
    };

    // Handle confirmed deletion - Ahora filtra por id_producto
    const handleConfirmDelete = async() => {
        const newData = data.filter(item => item.id_producto !== itemToDelete);
     const response =await productoeliminar({id:itemToDelete,id_empresa:empresaId});
     if (response.data.data==="OK") {
      setData(newData);
        
      // Si tenemos una función para actualizar datos en el componente padre
      if (setProductData) {
          setProductData(newData);
      }
      
      setShowConfirmation(false);
     }
     
    };

    // Cancel deletion
    const handleCancelDelete = () => {
        setShowConfirmation(false);
        setItemToDelete(null);
    };

    return (
        <>
            <OuterContainer>
                {isLoading ? (
                    <EmptyMessage>Cargando datos...</EmptyMessage>
                ) : (
                    <Table>
                        <TableHeader>
                            <tr>
                                <th></th>
                                <th>Descripcion</th>
                                <th>Codigo</th>
                                <th>Costo</th>
                                <th>venta</th>
                                <th>stock</th>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {filteredData && filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <tr key={index}>
                                        <DeleteButtonCell>
                                            <DeleteButton onClick={() => handleDeleteRequest(item.id_producto)}>✕</DeleteButton>
                                        </DeleteButtonCell>
                                        <td>{item.Descripcion}</td>
                                        <td>{item.Codigo}</td>
                                        <td>{item.Costo}</td>
                                        <td>{item.venta}</td>
                                        <td>{item.stock}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <EmptyMessage>No se encontraron resultados</EmptyMessage>
                                    </td>
                                </tr>
                            )}
                        </TableBody>
                    </Table>
                )}
            </OuterContainer>

            {showConfirmation && (
                <ConfirmationModal>
                    <ConfirmationBox>
                        <ConfirmationTitle>Confirmar eliminación</ConfirmationTitle>
                                                <ConfirmationText>
                            ¿Estás seguro de que deseas eliminar este elemento?
                        </ConfirmationText>
                        <ButtonGroup>
                            <CancelButton onClick={handleCancelDelete}>Cancelar</CancelButton>
                            <ConfirmButton onClick={handleConfirmDelete}>Eliminar</ConfirmButton>
                        </ButtonGroup>
                    </ConfirmationBox>
                </ConfirmationModal>
            )}
        </>
    );
};

export default ProductTable;