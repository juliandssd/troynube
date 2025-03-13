import React, { useState } from 'react';
import styled from 'styled-components';
import MenuHorizontal from './Menudeopciones';
import {
  ChefHat,
  Store,
  Smartphone,
  Printer,
  FileText,
  Receipt,
  FileDigit,
  Users,
  ShieldCheck,
  Plus,
  Settings,
  Trash2,
  BarChart3
} from 'lucide-react';
import Usuarioprincipal from './Usuario/UsuarioPrincipal';
import Configuracionbarraprincipal from './Barraconfiguracion/Configuracionbarraprincipal';
import ReceiptImpresora from '../Ticket/Receipt';

// Componentes estilizados para la estructura principal
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh; /* Added to take up full viewport height */
  margin: 0;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
`;

const FilaVerde = styled.div`
  background-color: white;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`;

const ContentContainer = styled.div`
  background-color: #fafafa;
  flex: 1; /* This will make it take up all remaining space */
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Componentes para el contenido específico de cada sección
const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem 0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
  }
`;

const ContentWrapper = styled.div`
  padding: 0 2rem 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f1f5f9;
    color: ${props => props.delete ? '#ef4444' : '#2563eb'};
  }
`;

const CardContent = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

// Para simplificar, solo mostraré contenido detallado para algunas secciones
const GenericContent = ({ icon, title }) => (
  <>
    <ContentHeader>
      <Title>
        {icon}
        {title}
      </Title>
      <Button>
        <Plus size={16} />
        Agregar
      </Button>
    </ContentHeader>
    
    <ContentWrapper>
      <Card>
        <CardContent>
          <p>Configuración de {title}</p>
          <p>Esta sección le permite administrar {title.toLowerCase()}</p>
        </CardContent>
      </Card>
    </ContentWrapper>
  </>
);

const Panelprincipalconfiguraciones = () => {
  const [activeItem, setActiveItem] = useState(1);

  // Función para renderizar el contenido correcto según el ítem activo
  const renderContent = () => {
    switch (activeItem) {
      case 1:
        return <Configuracionbarraprincipal icon={<BarChart3 size={24} />} title="Barra" />;
      case 2:
        return <GenericContent icon={<Store size={24} />} title="Cajas" />;
      case 3:
        return <Usuarioprincipal icon={<Users size={24} />} title="Usuario" />;
      case 4:
        return <GenericContent icon={<FileDigit size={24} />} title="Empresa" />;
      case 5:
        return <GenericContent icon={<Receipt size={24} />} title="Caja Cerrada" />;
      case 6:
        return <ReceiptImpresora />;
      case 7:
        return <Receipt icon={<ChefHat size={24} />} title="Reporte" />;
      default:
        return <div>Seleccione una opción del menú</div>;
    }
  };

  return (
    <Container>
      <FilaVerde>
        <MenuHorizontal activeItem={activeItem} setActiveItem={setActiveItem} />
      </FilaVerde>
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </Container>
  );
};

export default Panelprincipalconfiguraciones;