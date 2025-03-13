import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 300px;
  font-family: Arial, sans-serif;
`;

const Section = styled.div`
  text-align: center;
  &:first-child {
    margin-right: auto;
  }
  &:last-child {
    margin-left: auto;
  }
`;

const Label = styled.h2`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-family: Arial, sans-serif;
`;

const Value = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  font-family: Arial, sans-serif;
`;

const StockCounter = () => {
  return (
    <Container>
      <Section>
        <Label>Cuenta</Label>
        <Value>0</Value>
      </Section>
      <Section>
        <Label>Total Stock</Label>
        <Value>0</Value>
      </Section>
    </Container>
  );
};

export default StockCounter;