import React, { useMemo } from 'react';
import styled from 'styled-components';

// Contenedor principal con layout horizontal y más compacto
const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  background-color: white;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  width: 100%;
  max-width: 1100px;
  margin: 0;
  padding: 15px;
`;

// Título principal más ligero y moderno
const MainTitle = styled.h1`
  width: 100%;
  color: #222;
  text-align: left;
  font-weight: 500;
  font-size: 1.5rem;
  margin-bottom: 15px;
  letter-spacing: -0.5px;
`;

// Sección financiera moderna y compacta
const FinancialSection = styled.div`
  background-color: white;
  color: #222;
  flex: 1;
  min-width: 225px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 12px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  letter-spacing: -0.3px;
`;

// Fila de datos financieros más compacta
const FinancialRow = styled.div`
  display: grid;
  grid-template-columns: auto 80px;
  margin-bottom: 6px;
  line-height: 1.4;
  font-size: 0.9rem;
`;

const Label = styled.span`
  text-align: left;
  color: #444;
  padding-right: 10px;
`;

const Value = styled.span`
  text-align: right;
  font-weight: ${props => props.total ? '600' : 'normal'};
  color: ${props => props.total ? '#1a73e8' : '#333'};
`;

// Línea separadora más sutil
const Divider = styled.div`
  height: 1px;
  background-color: #f1f1f1;
  margin: 8px 0;
`;

// Componente para el título de Crédito Aperturado
const CreditTitle = styled.div`
  width: 100%;
  text-align: center;
  margin: 2px 0 8px 0;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #333;
  letter-spacing: 0.2px;
`;

// Función para formatear números con separador de miles (punto)
const formatNumber = (number) => {
  // Manejar valores undefined, null o no numéricos
  if (number === undefined || number === null) {
    return "0";
  }
  
  // Asegurar que es un número
  const num = Number(number);
  
  // Verificar si es un número válido
  if (isNaN(num)) {
    return "0";
  }
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Componente principal
const FinancialDashboard = React.memo(({data, dinero = [], egresoingreso = [], controlcobros = [], domicilio = []}) => {
  // Cálculos memoizados para evitar recálculos en cada renderizado
  const totalCaja = useMemo(() => {
    return Number(dinero[0] || 0) + Number(egresoingreso[1] || 0) - Number(egresoingreso[0] || 0);
  }, [dinero, egresoingreso]);
  
  const totalVentas = useMemo(() => {
    return Number(dinero[0] || 0) + 
           Number(dinero[1] || 0) + 
           Number(dinero[2] || 0) + 
           Number(dinero[3] || 0) + 
           Number(controlcobros[0] || 0) + 
           Number(controlcobros[1] || 0) + 
           Number(dinero[4] || 0);
  }, [dinero, controlcobros]);

  // Para evitar errores, añadimos verificaciones a los datos
  const safeData = useMemo(() => ({
    Efectivoinicial: data?.Efectivoinicial || 0
  }), [data]);

  return (
    <Container>
      <MainTitle>Detalles Financieros</MainTitle>
      
      {/* Sección de Dinero en Caja */}
      <FinancialSection>
        <SectionTitle>Dinero en Caja</SectionTitle>
        <FinancialRow>
          <Label>Fondo de caja:</Label>
          <Value>$ {formatNumber(safeData.Efectivoinicial)}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Ventas en efectivo:</Label>
          <Value>$ {formatNumber(dinero[0])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Ingresos varios:</Label>
          <Value>$ {formatNumber(egresoingreso[1])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Gastos varios:</Label>
          <Value>$ {formatNumber(egresoingreso[0])}</Value>
        </FinancialRow>
        <Divider />
        <FinancialRow>
          <Label>Total:</Label>
          <Value total>$ {formatNumber(totalCaja)}</Value>
        </FinancialRow>
      </FinancialSection>
      
      {/* Sección de Ventas Totales */}
      <FinancialSection>
        <SectionTitle>Ventas Totales</SectionTitle>
        <FinancialRow>
          <Label>En Efectivo:</Label>
          <Value>$ {formatNumber(dinero[0])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Datafono:</Label>
          <Value>$ {formatNumber(dinero[1])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Qr:</Label>
          <Value>$ {formatNumber(dinero[2])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Transfe:</Label>
          <Value>$ {formatNumber(dinero[3])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>C. Efectivo:</Label>
          <Value>$ {formatNumber(controlcobros[0])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>C. Tarjeta:</Label>
          <Value>$ {formatNumber(controlcobros[1])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Nequi:</Label>
          <Value>$ {formatNumber(dinero[4])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Propina B:</Label>
          <Value>$ {formatNumber(controlcobros[3])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Propina E:</Label>
          <Value>$ {formatNumber(controlcobros[2])}</Value>
        </FinancialRow>
        <Divider />
        <FinancialRow>
          <Label>Total:</Label>
          <Value total>$ {formatNumber(totalVentas)}</Value>
        </FinancialRow>
      </FinancialSection>
      
      {/* Sección de Domicilio */}
      <FinancialSection>
        <SectionTitle>Domicilio</SectionTitle>
        <FinancialRow>
          <Label>A Domicilio:</Label>
          <Value>$ {formatNumber(domicilio[0])}</Value>
        </FinancialRow>
        <FinancialRow>
          <Label>Cobros Domi:</Label>
          <Value>$ {formatNumber(domicilio[1])}</Value>
        </FinancialRow>
        <Divider />
        <CreditTitle>CRÉDITO APERTURADO</CreditTitle>
        <FinancialRow>
          <Label>A Crédito:</Label>
          <Value>$ {formatNumber(domicilio[2])}</Value>
        </FinancialRow>
        <Divider />
        <FinancialRow>
          <Label>Total:</Label>
          <Value total>$ {formatNumber(domicilio[2])}</Value>
        </FinancialRow>
      </FinancialSection>
    </Container>
  );
});

FinancialDashboard.displayName = 'FinancialDashboard';

export default FinancialDashboard;