import React, { useState } from 'react';
import styled from 'styled-components';
import { Search, Filter, Plus, ArrowDown } from 'lucide-react';

// Colors
const primaryColor = '#6366F1';
const primaryLightColor = '#EEF2FF';
const grayColor = '#F9FAFB';
const grayDarkColor = '#6B7280';
const whiteColor = '#FFFFFF';
const borderColor = '#E5E7EB';

// Styled Components
const Container = styled.div`
  background-color: ${grayColor};
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  max-width: 1152px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const FilterButton = styled(Button)`
  background-color: ${whiteColor};
  color: ${grayDarkColor};
  border: 1px solid ${borderColor};
  
  &:hover {
    background-color: ${grayColor};
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${primaryColor};
  color: ${whiteColor};
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #4F46E5;
  }
`;

const TitleSection = styled.div`
  background-color: ${primaryLightColor};
  padding: 1rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${primaryColor};
`;

const SearchSection = styled.div`
  background-color: ${whiteColor};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${borderColor};
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 28rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid ${borderColor};
  border-radius: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 0.6rem;
  color: ${grayDarkColor};
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: ${whiteColor};
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHead = styled.thead`
  background-color: ${primaryLightColor};
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${grayDarkColor};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableBody = styled.tbody`
  background-color: ${whiteColor};
  
  & tr {
    border-bottom: 1px solid ${borderColor};
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: ${grayColor};
      transition: background-color 0.2s ease;
    }
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  white-space: nowrap;
  font-size: 0.875rem;
  color: #111827;
`;

const TotalCell = styled(TableCell)`
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
`;

const EmptyStateIcon = styled.div`
  background-color: ${grayColor};
  padding: 1.5rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
  color: ${grayDarkColor};
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 500;
  color: #374151;
`;

const EmptyStateMessage = styled.p`
  margin-top: 0.5rem;
  color: ${grayDarkColor};
`;

const Pagination = styled.div`
  background-color: ${whiteColor};
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${borderColor};
`;

const PaginationInfo = styled.p`
  font-size: 0.875rem;
  color: #4B5563;
  
  & span {
    font-weight: 500;
  }
`;

const PaginationNav = styled.nav`
  display: inline-flex;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const PaginationButton = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid ${borderColor};
  font-size: 0.875rem;
  
  &:first-child {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
`;

const PaginationActiveButton = styled(PaginationButton)`
  background-color: ${primaryLightColor};
  color: ${primaryColor};
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.2);
  }
`;

// Main Component
const IngresoCaja = () => {
  const [gastos, setGastos] = useState([]);

  return (
    <Container>
      {/* Header section */}
      <Header>
        <ButtonGroup>
          <PrimaryButton>
            <Plus size={16} />
            <span>Nuevo ingreso</span>
          </PrimaryButton>
        </ButtonGroup>
      </Header>

      {/* Title section */}
      <TitleSection>
        <Title>Ingreso de caja</Title>
      </TitleSection>

      {/* Search section */}
      <SearchSection>
        <SearchContainer>
          <SearchInput placeholder="Buscar..." />
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
        </SearchContainer>
      </SearchSection>

      {/* Table section */}
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Operacion</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Descripcion</TableHeaderCell>
              <TableHeaderCell>Producto</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {gastos.length > 0 ? (
              gastos.map((gasto) => (
                <tr key={gasto.id}>
                  <TableCell>{gasto.operacion}</TableCell>
                  <TableCell>{gasto.fecha}</TableCell>
                  <TableCell>{gasto.descripcion}</TableCell>
                  <TableCell>{gasto.producto}</TableCell>
                  <TotalCell>${gasto.total.toFixed(2)}</TotalCell>
                </tr>
              ))
            ) : (
              <tr>
                <TableCell colSpan={5} style={{ textAlign: 'center', color: grayDarkColor }}>
                  No hay gastos registrados
                </TableCell>
              </tr>
            )}
          </TableBody>
        </Table>
        
        {/* Empty state */}
        {gastos.length === 0 && (
          <EmptyState>
            <EmptyStateIcon>
              <ArrowDown size={32} />
            </EmptyStateIcon>
            <EmptyStateTitle>No hay gastos registrados</EmptyStateTitle>
            <EmptyStateMessage>Agrega un nuevo gasto para comenzar</EmptyStateMessage>
          </EmptyState>
        )}
        
        {/* Pagination */}
        {gastos.length > 0 && (
          <Pagination>
            <PaginationInfo>
              Mostrando <span>1</span> a <span>{gastos.length}</span> de <span>{gastos.length}</span> resultados
            </PaginationInfo>
            <PaginationNav aria-label="Pagination">
              <PaginationButton href="#" aria-label="Anterior">
                &larr;
              </PaginationButton>
              <PaginationActiveButton href="#">
                1
              </PaginationActiveButton>
              <PaginationButton href="#" aria-label="Siguiente">
                &rarr;
              </PaginationButton>
            </PaginationNav>
          </Pagination>
        )}
      </TableContainer>
    </Container>
  );
};

export default IngresoCaja;