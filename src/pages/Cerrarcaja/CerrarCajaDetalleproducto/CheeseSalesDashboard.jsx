import React, { useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

// Datos de ejemplo (definidos fuera del componente para evitar recreación)
const EXAMPLE_SALES_DATA = [
  { descripcion: 'MOJICON DE QUESO', precio: 2000, salida: 4, importe: 8000 },
  { descripcion: 'PAN DE QUESO PREMIUM', precio: 11600, salida: 1, importe: 11600 },
  { descripcion: 'PAN DE QUESO', precio: 5000, salida: 5, importe: 25000 },
  { descripcion: 'QUESO FRESCO 250g', precio: 8500, salida: 2, importe: 17000 },
  { descripcion: 'QUESO AZUL 150g', precio: 12000, salida: 1, importe: 12000 },
  { descripcion: 'QUESO GOUDA 300g', precio: 15000, salida: 2, importe: 30000 },
  { descripcion: 'YOGURT DE QUESO', precio: 3500, salida: 3, importe: 10500 },
];

const EXAMPLE_RETURNS_DATA = [
  { nombre: 'ADMIN', descripcion: 'PAN DE QUESO', fecha: '6/03/2025', minutos: 'Min 0', total: 5000 },
  { nombre: 'ADMIN', descripcion: 'MOJICON DE QUESO', fecha: '6/03/2025', minutos: 'Min 0', total: 2000 }
];

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const Container = styled.div`
  background-color: white;
  font-family: Arial, sans-serif;
  color: black;
  padding: 1.8rem 1.8rem 2.5rem 1.8rem;
  max-width: 800px;
  margin: 0 0 0 2rem;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #4d21fc, #7258ff, #9f8bfc);
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 0.8rem;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#4d21fc' : '#666'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.8rem;
    left: 0;
    width: ${props => props.active ? '100%' : '0%'};
    height: 2px;
    background-color: #4d21fc;
    transition: all 0.2s ease;
  }
  
  &:hover {
    color: #4d21fc;
    
    &::after {
      width: 100%;
    }
  }
`;

const TableContainer = styled.div`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d8d8ff;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a7a7ff;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  position: relative;
  border-radius: 16px;
`;

const TableHeader = styled.thead`
  background: #f8f9ff;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #4d21fc;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 1px solid #edf0ff;
`;

const Td = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid #f5f7ff;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;
`;

const Tr = styled.tr`
  transition: all 0.2s ease-in-out;
  background-color: white;
  
  &:hover {
    background-color: #f8faff;
    
    ${Td} {
      color: #4d21fc;
    }
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 1.4rem 0 1.2rem;
  color: #111;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const Badge = styled.span`
  background-color: #f1eeff;
  color: #4d21fc;
  font-size: 0.75rem;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  margin-left: 0.8rem;
  font-weight: 500;
`;

const Circle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #4d21fc;
  margin-right: 0.6rem;
`;

const PriceCell = styled(Td)`
  font-weight: 500;
  color: #4d21fc;
`;

const Empty = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
`;

// Componente optimizado
const CheeseSalesDashboard = React.memo(() => {
  // Estado para las tabs
  const [activeTab, setActiveTab] = useState('sales');

  // Handlers memoizados para cambiar tabs
  const handleSalesTab = useCallback(() => {
    setActiveTab('sales');
  }, []);

  const handleReturnsTab = useCallback(() => {
    setActiveTab('returns');
  }, []);

  return (
    <Container>
      <TabContainer>
        <Tab 
          active={activeTab === 'sales'} 
          onClick={handleSalesTab}
        >
          Ventas
        </Tab>
        <Tab 
          active={activeTab === 'returns'} 
          onClick={handleReturnsTab}
        >
          Devoluciones
        </Tab>
      </TabContainer>
      
      {activeTab === 'sales' && (
        <>
          <SectionTitle>
            <Circle />
            Detalle de Ventas 
            <Badge>{EXAMPLE_SALES_DATA.length} productos</Badge>
          </SectionTitle>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <Th>Descripción</Th>
                  <Th>Precio</Th>
                  <Th>Salida</Th>
                  <Th>Importe</Th>
                </tr>
              </TableHeader>
              <tbody>
                {EXAMPLE_SALES_DATA.length > 0 ? (
                  EXAMPLE_SALES_DATA.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.descripcion}</Td>
                      <PriceCell>{item.precio.toLocaleString()}</PriceCell>
                      <Td>{item.salida}</Td>
                      <PriceCell>{item.importe.toLocaleString()}</PriceCell>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4}>
                      <Empty>No hay datos de ventas disponibles</Empty>
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 'returns' && (
        <>
          <SectionTitle>
            <Circle />
            Devoluciones
            <Badge>{EXAMPLE_RETURNS_DATA.length} items</Badge>
          </SectionTitle>
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <Th>Nombre</Th>
                  <Th>Descripción</Th>
                  <Th>Fecha</Th>
                  <Th>Minutos</Th>
                  <Th>Total</Th>
                </tr>
              </TableHeader>
              <tbody>
                {EXAMPLE_RETURNS_DATA.length > 0 ? (
                  EXAMPLE_RETURNS_DATA.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.nombre}</Td>
                      <Td>{item.descripcion}</Td>
                      <Td>{item.fecha}</Td>
                      <Td>{item.minutos}</Td>
                      <PriceCell>{item.total.toLocaleString()}</PriceCell>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5}>
                      <Empty>No hay devoluciones disponibles</Empty>
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
});

CheeseSalesDashboard.displayName = 'CheeseSalesDashboard';

export default CheeseSalesDashboard;