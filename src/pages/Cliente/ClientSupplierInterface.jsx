import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Briefcase, DollarSign, Search, Filter, Edit, Trash2, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react';

// Styled Components - Designed to be contained with fixed height
const Container = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #f6f7fb;
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  position: relative;
  /* Ensure the component fits in its container without affecting the parent layout */
  overflow: hidden;
`;

const Header = styled.header`
  background-color: #6366F1;
  color: white;
  padding: 16px 24px;
  flex-shrink: 0;
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
`;

// This is the scrollable container that will hold all content
const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  min-height: 0; /* Critical for nested flex containers with scrolling */
  max-height: calc(100% - 60px); /* Ensure it doesn't overflow its container */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const BalanceCard = styled.div`
  background-color: white;
  border-radius: 12px;
  margin: 20px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #6366F1;
  
  div {
    display: flex;
    flex-direction: column;
  }
  
  h2 {
    color: #4B5563;
    font-size: 14px;
    margin: 0 0 4px 0;
    font-weight: 500;
  }
  
  span {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
  }
`;

const Content = styled.div`
  padding: 0 20px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TabGroup = styled.div`
  display: flex;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background-color: ${props => props.active ? '#6366F1' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6B7280'};
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#6366F1' : '#E5E7EB'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.outline {
    background: white;
    color: #6366F1;
    border: 1px solid #E5E7EB;
    
    &:hover {
      border-color: #6366F1;
      background: #F9FAFB;
    }
  }
  
  &.primary {
    background: #6366F1;
    color: white;
    border: none;
    
    &:hover {
      background: #4F46E5;
    }
  }
`;

const SearchFilters = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SearchInput = styled.div`
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  padding: 0 12px;
  
  input {
    flex: 1;
    border: none;
    padding: 10px 8px;
    font-size: 14px;
    outline: none;
    color: #4B5563;
    background: transparent;
    
    &::placeholder {
      color: #9CA3AF;
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background-color: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #4B5563;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #F9FAFB;
  }
  
  &.active {
    background-color: #F5F3FF;
    border-color: #6366F1;
    color: #6366F1;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #F5F3FF;
  border: 1px solid #6366F1;
  border-radius: 16px;
  color: #6366F1;
  font-size: 12px;
  font-weight: 500;
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #6366F1;
    cursor: pointer;
    padding: 0;
    line-height: 0;
  }
`;

const TableSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  background-color: white;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  span {
    color: #6B7280;
    font-size: 14px;
  }
`;

const TableWrapper = styled.div`
  overflow: auto;
  flex: 1;
  min-height: 200px; /* Ensure minimum height for the table */
  max-height: calc(100vh - 340px); /* Ensure it doesn't overflow the screen */
  
  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #F9FAFB;
  }

  &::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableColumnHeader = styled.th`
  padding: 12px 24px;
  text-align: left;
  color: #6B7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #E5E7EB;
  white-space: nowrap;
  background-color: #F9FAFB;
  
  &:last-child {
    text-align: center;
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  color: #4B5563;
  font-size: 14px;
  border-bottom: 1px solid #E5E7EB;
  
  &:last-child {
    text-align: center;
  }
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    color: #6366F1;
  }
  
  span {
    font-weight: 500;
    color: #111827;
  }
`;

const StatusBadge = styled.div`
  padding: 4px 12px;
  background: ${props => props.status === 'active' ? '#ECFDF5' : '#FEF2F2'};
  color: ${props => props.status === 'active' ? '#065F46' : '#991B1B'};
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  
  &.edit {
    color: #6366F1;
    
    &:hover {
      background: #EEF2FF;
    }
  }
  
  &.delete {
    color: #EF4444;
    
    &:hover {
      background: #FEF2F2;
    }
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  right: 20px;
  top: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  width: 300px;
  z-index: 100;
  display: ${props => props.show ? 'block' : 'none'};
`;

const FilterMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  button {
    background: transparent;
    border: none;
    color: #6B7280;
    cursor: pointer;
    display: flex;
    padding: 0;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #4B5563;
    margin-bottom: 8px;
  }
  
  select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #E5E7EB;
    font-size: 14px;
    color: #111827;
    background-color: white;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #6366F1;
    }
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  
  button {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    &.reset {
      background: white;
      color: #4B5563;
      border: 1px solid #E5E7EB;
      
      &:hover {
        background: #F9FAFB;
      }
    }
    
    &.apply {
      background: #6366F1;
      color: white;
      border: none;
      
      &:hover {
        background: #4F46E5;
      }
    }
  }
`;

const EmptyMessage = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #6B7280;
  
  svg {
    color: #D1D5DB;
    margin-bottom: 12px;
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
`;

const ClientSupplierInterface = () => {
  // Sample data
  const initialClients = [
    { id: 1, name: 'Ana Martínez', identification: 'AM-34567890', phone: '+1 (555) 345-6789', status: 'active', email: 'ana@example.com', credit: 2500 },
    { id: 2, name: 'Carlos Rodríguez', identification: 'CR-12345678', phone: '+1 (555) 123-4567', status: 'active', email: 'carlos@example.com', credit: 1500 },
    { id: 3, name: 'María González', identification: 'MG-87654321', phone: '+1 (555) 987-6543', status: 'active', email: 'maria@example.com', credit: 3000 },
    { id: 4, name: 'Juan Pérez', identification: 'JP-23456789', phone: '+1 (555) 234-5678', status: 'inactive', email: 'juan@example.com', credit: 500 },
    { id: 5, name: 'Elena Gómez', identification: 'EG-56789012', phone: '+1 (555) 567-8901', status: 'inactive', email: 'elena@example.com', credit: 750 },
    { id: 6, name: 'Roberto Sánchez', identification: 'RS-45678901', phone: '+1 (555) 456-7890', status: 'active', email: 'roberto@example.com', credit: 1800 },
    { id: 7, name: 'Lucía Hernández', identification: 'LH-78901234', phone: '+1 (555) 789-0123', status: 'active', email: 'lucia@example.com', credit: 2100 },
    { id: 8, name: 'Francisco López', identification: 'FL-67890123', phone: '+1 (555) 678-9012', status: 'active', email: 'francisco@example.com', credit: 3200 }
  ];
  
  const initialSuppliers = [
    { id: 1, name: 'Suministros Globales', identification: 'SG-12345', phone: '+1 (555) 222-3333', status: 'active', email: 'contacto@suministros.com', credit: 5000 },
    { id: 2, name: 'Distribuidora del Este', identification: 'DE-54321', phone: '+1 (555) 444-5555', status: 'active', email: 'info@distribuidora.com', credit: 7500 },
    { id: 3, name: 'Productos Industriales', identification: 'PI-67890', phone: '+1 (555) 666-7777', status: 'inactive', email: 'ventas@productos.com', credit: 3000 }
  ];
  
  const [isClient, setIsClient] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState(initialClients);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [balance] = useState(4500);
  
  // Filter states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [creditFilter, setCreditFilter] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Handle deletion
  const handleDelete = (id) => {
    if (isClient) {
      setClients(clients.filter(client => client.id !== id));
    } else {
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    }
  };
  
  // Apply filters
  const applyFilters = () => {
    const newFilters = [];
    
    if (statusFilter !== 'all') {
      newFilters.push({ type: 'status', value: statusFilter });
    }
    
    if (creditFilter !== 'all') {
      newFilters.push({ type: 'credit', value: creditFilter });
    }
    
    setActiveFilters(newFilters);
    setShowFilterMenu(false);
  };
  
  // Remove a specific filter
  const removeFilter = (filterType) => {
    setActiveFilters(activeFilters.filter(filter => filter.type !== filterType));
    
    if (filterType === 'status') {
      setStatusFilter('all');
    } else if (filterType === 'credit') {
      setCreditFilter('all');
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setCreditFilter('all');
    setActiveFilters([]);
  };
  
  // Filter and search data
  const getFilteredData = () => {
    const currentData = isClient ? clients : suppliers;
    
    return currentData.filter(item => {
      // Apply search filter
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Apply status filter
      const statusFilterActive = activeFilters.find(filter => filter.type === 'status');
      if (statusFilterActive && item.status !== statusFilterActive.value) {
        return false;
      }
      
      // Apply credit filter
      const creditFilterActive = activeFilters.find(filter => filter.type === 'credit');
      if (creditFilterActive) {
        const credit = item.credit;
        if (creditFilterActive.value === 'low' && credit >= 1000) return false;
        if (creditFilterActive.value === 'medium' && (credit < 1000 || credit >= 3000)) return false;
        if (creditFilterActive.value === 'high' && credit < 3000) return false;
      }
      
      return true;
    });
  };
  
  const filteredData = getFilteredData();
  
  return (
    <Container>
      <Header>
        <h1>Cliente y Proveedor</h1>
      </Header>
      
      <ScrollableArea>
        <BalanceCard>
          <div>
            <h2>Saldo Total</h2>
            <span>${balance.toFixed(2)}</span>
          </div>
          <DollarSign size={24} />
        </BalanceCard>
        
        <Content>
          <ActionBar>
            <TabGroup>
              <Tab active={isClient} onClick={() => setIsClient(true)}>
                <User size={16} />
                Clientes
              </Tab>
              <Tab active={!isClient} onClick={() => setIsClient(false)}>
                <Briefcase size={16} />
                Proveedores
              </Tab>
            </TabGroup>
            
            <ButtonGroup>
              <Button className="outline">
                <DollarSign size={16} />
                Cobros
              </Button>
              <Button className="primary">
                <User size={16} />
                Agregar {isClient ? 'Cliente' : 'Proveedor'}
              </Button>
            </ButtonGroup>
          </ActionBar>
          
          <SearchFilters>
            <SearchBar>
              <SearchInput>
                <Search size={16} color="#9CA3AF" />
                <input 
                  type="text" 
                  placeholder={`Buscar ${isClient ? 'cliente' : 'proveedor'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInput>
            </SearchBar>
            
            {activeFilters.length > 0 && (
              <ActiveFilters>
                {activeFilters.map(filter => (
                  <FilterTag key={filter.type}>
                    {filter.type === 'status' && `Estado: ${filter.value === 'active' ? 'Activo' : 'Inactivo'}`}
                    {filter.type === 'credit' && `Crédito: ${
                      filter.value === 'low' ? 'Bajo' : 
                      filter.value === 'medium' ? 'Medio' : 'Alto'
                    }`}
                    <button onClick={() => removeFilter(filter.type)}>
                      <X size={14} />
                    </button>
                  </FilterTag>
                ))}
              </ActiveFilters>
            )}
          </SearchFilters>
          
          <TableSection>
            <TableHeader>
              <h3>{isClient ? 'Clientes' : 'Proveedores'}</h3>
              <span>{filteredData.length} {isClient ? 'clientes' : 'proveedores'} encontrados</span>
            </TableHeader>
            
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <TableColumnHeader>Nombre</TableColumnHeader>
                    <TableColumnHeader>Identificación</TableColumnHeader>
                    <TableColumnHeader>Celular</TableColumnHeader>
                    <TableColumnHeader>Estado</TableColumnHeader>
                    <TableColumnHeader>Correo</TableColumnHeader>
                    <TableColumnHeader>Crédito</TableColumnHeader>
                    <TableColumnHeader>Acciones</TableColumnHeader>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <TableCell colSpan="7">
                        <EmptyMessage>
                          {isClient ? <User size={32} /> : <Briefcase size={32} />}
                          <p>No se encontraron {isClient ? 'clientes' : 'proveedores'}</p>
                        </EmptyMessage>
                      </TableCell>
                    </tr>
                  ) : (
                    filteredData.map(item => (
                      <tr key={item.id}>
                        <TableCell>
                          <UserCell>
                            <User size={16} className="icon" />
                            <span>{item.name}</span>
                          </UserCell>
                        </TableCell>
                        <TableCell>{item.identification}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>
                          <StatusBadge status={item.status}>
                            {item.status === 'active' ? (
                              <>
                                <CheckCircle size={14} />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Inactivo
                              </>
                            )}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>${item.credit.toFixed(2)}</TableCell>
                        <TableCell>
                          <ActionButtons>
                            <IconButton className="edit">
                              <Edit size={16} />
                            </IconButton>
                            <IconButton 
                              className="delete"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </ActionButtons>
                        </TableCell>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </TableSection>
        </Content>
      </ScrollableArea>
      
      {/* Filter Menu */}
      <FilterMenu show={showFilterMenu}>
        <FilterMenuHeader>
          <h4>Filtros</h4>
          <button onClick={() => setShowFilterMenu(false)}>
            <X size={18} />
          </button>
        </FilterMenuHeader>
        
        <FilterGroup>
          <label>Estado</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label>Crédito</label>
          <select 
            value={creditFilter}
            onChange={(e) => setCreditFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="low">Bajo (&lt; $1,000)</option>
            <option value="medium">Medio ($1,000 - $3,000)</option>
            <option value="high">Alto (&gt; $3,000)</option>
          </select>
        </FilterGroup>
        
        <FilterActions>
          <button className="reset" onClick={resetFilters}>
            Resetear
          </button>
          <button className="apply" onClick={applyFilters}>
            Aplicar
          </button>
        </FilterActions>
      </FilterMenu>
    </Container>
  );
};

export default ClientSupplierInterface;