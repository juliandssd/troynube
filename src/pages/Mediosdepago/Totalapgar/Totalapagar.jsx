import React from 'react';
import styled from 'styled-components';

const TotalContainer = styled.div`
  font-family: Arial, sans-serif;
  font-weight: bold;
  background-color: #FFFFFF;
  font-size: 30px;
  color: #000;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
`;

function Totalapagar({ total }) {
  // Formatear el número con punto como separador de miles
  const formatearTotal = (valor) => {
    // Verificar si el valor está vacío, es nulo o no es un número
    if (valor === undefined || valor === null || valor === '' || isNaN(valor)) {
      return '0';
    }
    
    // Método manual para garantizar formato con punto como separador de miles
    const numero = Math.round(Number(valor)); // Redondear a entero
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <TotalContainer>
      Total: ${formatearTotal(total)}
    </TotalContainer>
  );
}

export default Totalapagar;