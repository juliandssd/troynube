import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { movimientocerrar } from '../../../Api/TaskCajaYmovimiento';
import { useNavigate } from 'react-router-dom';

// Componentes estilizados
const Container = styled.div`
  font-family: Arial, sans-serif;
  padding: 10px 20px;
  background-color: white;
  color: #333;
  max-width: 1100px;
  margin: 0; 
  font-size: 16px; /* Base font size increased */
`;

const Header = styled.div`
  font-size: 24px; /* Increased from 18px */
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  letter-spacing: 0.5px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Period = styled.div`
  font-size: 16px; /* Increased from 12px */
  margin-bottom: 8px;
  color: #666;
  background-color: #f9f9f9;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
`;

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 25px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 10px;
`;

const Card = styled.div`
  font-size: 18px; /* Increased from 14px */
  font-weight: 600;
  background-color: #f0f7ff;
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
`;

const ProfitCard = styled(Card)`
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

const ExpectedCard = styled(Card)`
  text-align: center;
  min-width: 200px;
`;

const ActualCard = styled(Card)`
  text-align: right;
  min-width: 220px;
`;

const FieldLabel = styled.span`
  font-size: 16px; /* Increased from 12px */
  color: #666;
  margin-bottom: 2px;
`;

const ProfitValue = styled.span`
  font-size: 22px; /* Increased from 18px */
  color: #333;
`;

const ExpectedValue = styled.div`
  font-size: 24px; /* Increased from 20px */
  font-weight: 600;
  margin: 2px 0;
  color: #6366F1;
`;

const InputContainer = styled.div`
  position: relative;
  margin: 5px 0;
`;

const Input = styled.input`
  font-size: 24px; /* Increased from 20px */
  border: none;
  border-bottom: 2px solid #6366F1;
  width: 180px;
  text-align: center;
  padding: 1px 0;
  outline: none;
  transition: all 0.3s ease;
  background-color: transparent;
`;

const DifferenceValue = styled.span`
  font-size: 20px; /* Increased from 16px */
  font-weight: 600;
  color: #6366F1;
  text-align: center;
  margin-top: 6px;
  background-color: #f9f9f9;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  min-width: 280px;
  justify-content: flex-start;
`;

const BaseButton = styled.button`
  font-size: 18px; /* Increased from 14px */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  border-radius: 6px;
`;

const PrimaryButton = styled(BaseButton)`
  background-color: ${props => props.hover ? '#5253d4' : '#6366F1'};
  color: white;
  border: none;
  padding: 8px 16px;
  width: 130px;
  box-shadow: ${props => props.hover ? 
    '0 6px 16px rgba(99, 102, 241, 0.4)' : 
    '0 4px 12px rgba(99, 102, 241, 0.25)'};
  transform: ${props => props.hover ? 'translateY(-2px)' : 'none'};
`;

const SecondaryButton = styled(BaseButton)`
  background-color: ${props => props.hover ? '#f0f1fe' : 'transparent'};
  color: #6366F1;
  border: 2px solid #6366F1;
  padding: 6px 14px;
  box-shadow: ${props => props.hover ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none'};
  transform: ${props => props.hover ? 'translateY(-2px)' : 'none'};
`;

// Función de utilidad para formatear fechas (colocada fuera del componente)
const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleString(); // Return current date instead of '...'
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toLocaleString(); // Return current date on error too
  }
};

const CuadreDeCaja = React.memo(({ data = {} }) => {
  // Force component to render immediately without waiting for data
  useEffect(() => {
    // This ensures the component renders immediately
    document.title = document.title;
  }, []);

  // Estado para el valor de "¿Cuánto hay realmente?"
  const [valorReal, setValorReal] = useState(0);
  const navigate = useNavigate();
  
  // Estados para efectos hover en botones
  const [hoverCerrar, setHoverCerrar] = useState(false);
  const [hoverEfectivo, setHoverEfectivo] = useState(false);
  
  // Datos seguros (para evitar errores con undefined o null)
  const safeData = useMemo(() => ({
    Nombre: data?.Nombre || '',
    fechainicio: data?.fechainicio || null,
    fechafin: data?.fechafin || null,
    id_movi: data?.id_movi || null
  }), [data]);
  
  // Handlers memoizados para eventos hover
  const handleCerrarEnter = useCallback(() => setHoverCerrar(true), []);
  const handleCerrarLeave = useCallback(() => setHoverCerrar(false), []);
  const handleEfectivoEnter = useCallback(() => setHoverEfectivo(true), []);
  const handleEfectivoLeave = useCallback(() => setHoverEfectivo(false), []);
  
  // Handler memoizado para cambio de valor
  const handleValorRealChange = useCallback((e) => {
    setValorReal(e.target.value);
  }, []);
  
  const btncerrarcaja = async () => {
    try {
      const data = {
        id_movi: safeData.id_movi,
        ingreso: 0,
        egreso: 0,
        efectivo: 0,
        tarjeta: 0,
        efectivocalculado: 0,
        efectivoreal: 0,
        efectivodiferente: 0 
      }
      const response = await movimientocerrar(data);
      if (response.data.data > 0) {
        navigate('/login', {replace: true});
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  // Hide any parent "Cargando datos..." message as soon as component renders
  useEffect(() => {
    const loadingElements = document.querySelectorAll('*');
    loadingElements.forEach(el => {
      if (el.textContent === 'Cargando datos...') {
        el.style.display = 'none';
      }
    });
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <Header>{safeData.Nombre}</Header>
        <Period>
          {formatDate(safeData.fechainicio)} — {formatDate(safeData.fechafin)} (Turno Actual)
        </Period>
      </HeaderContainer>
      
      <FlexContainer>
        <SecondaryButton
          hover={hoverEfectivo}
          onMouseEnter={handleEfectivoEnter}
          onMouseLeave={handleEfectivoLeave}
        >
          Efectivo
        </SecondaryButton>
        <ButtonContainer>
          <PrimaryButton
            hover={hoverCerrar}
            onMouseEnter={handleCerrarEnter}
            onMouseLeave={handleCerrarLeave}
            onClick={btncerrarcaja}
          >
            Cerrar Caja
          </PrimaryButton>
        </ButtonContainer>
        
        <ActualCard>
          <FieldLabel>¿Cuánto hay realmente?</FieldLabel>
          <InputContainer>
            <Input 
              type="text" 
              value={valorReal} 
              onChange={handleValorRealChange}
            />
          </InputContainer>
        </ActualCard>
      </FlexContainer>
    </Container>
  );
});

CuadreDeCaja.displayName = 'CuadreDeCaja';

export default CuadreDeCaja;