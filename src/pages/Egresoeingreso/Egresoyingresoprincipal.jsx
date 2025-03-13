import React from 'react';
import styled from 'styled-components';
import GastosCaja from './Egreso/GastosCaja';
import IngresoCaja from './Ingreso/IngresoCaja';

// Contenedor principal
const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  flex: 1;
  font-family: Arial, Helvetica, sans-serif;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Primera columna
const FirstColumn = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  border-right: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
`;

// Segunda columna
const SecondColumn = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 50%;
  }
`;

// Filas para cada columna
const Row = styled.div`
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  color: #555;
  letter-spacing: 0.5px;
`;

// Área de total en la segunda columna
const TotalArea = styled.div`
  width: 100%;
  height: 60px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  padding-left: 25px;
  font-weight: 500;
  border-top: 1px solid #eaeaea;
  font-size: 16px;
  color: #333;
`;

// Estilo para el símbolo "$"
const DollarSymbol = styled.span`
  margin: 0 5px;
  font-size: 1.1em;
  color: #555;
`;

// Estilo para el valor
const Amount = styled.span`
  font-size: 1.3em;
  font-weight: 500;
  color: #222;
`;

const Egresoyingresoprincipal = () => {
  return (
    <Container>
      <FirstColumn>
        <Row><GastosCaja/></Row>
        <TotalArea>
          <span>Total:</span>
          <DollarSymbol>$</DollarSymbol>
          <Amount>0.00</Amount>
        </TotalArea>
      </FirstColumn>
      <SecondColumn>
        <Row><IngresoCaja/></Row>
        <TotalArea>
          <span>Total:</span>
          <DollarSymbol>$</DollarSymbol>
          <Amount>0.00</Amount>
        </TotalArea>
      </SecondColumn>
    </Container>
  );
};

export default Egresoyingresoprincipal;