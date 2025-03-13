import React from 'react';
import styled from 'styled-components';
import FudoHero from './FudoHero';
import RegistroForm from './RegistreEmpresa';

// Layout Container
const MainContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const ColumnsContainer = styled.div`
  display: flex;
  min-height: 70vh;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BottomRow = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

const RightColumnContent = styled.div`
  h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;

    h3 {
      font-size: 1.5rem;
      color: #6366F1;
      margin-bottom: 0.5rem;
    }

    p {
      color: #666;
      font-size: 0.875rem;
    }
  }
`;

// Main Component
const PanelEmpresa = () => {
  return (
    <MainContainer>
      <ColumnsContainer>
        <Column>
          <FudoHero />
        </Column>
        <Column>
        <RegistroForm/>
        </Column>
      </ColumnsContainer>

      <BottomRow>
        <h2>Información Adicional</h2>
        <p>Aquí puedes agregar contenido adicional que se extienda horizontalmente</p>
      </BottomRow>
    </MainContainer>
  );
};

export default PanelEmpresa;