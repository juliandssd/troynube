import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import usePrintTicket from '../usePrintTicket';

// Styled components para renderizar el recibo
const ReceiptContainer = styled.div`
  width: 80mm;
  font-family: monospace;
  font-size: 13px;
  background-color: white;
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  position: ${props => props.isVisible ? 'static' : 'absolute'};
  left: ${props => props.isVisible ? 'auto' : '-9999px'};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
`;

const Subtitle = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
`;

const CompanyName = styled.div`
  font-size: 1rem;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span``;

const Value = styled.span`
  ${props => props.bold && 'font-weight: bold;'}
`;

const Separator = styled.div`
  border-top: 1px dashed #aaa;
  margin: 0.5rem 0;
`;

// Componentes mejorados para las columnas de encabezado - orden reordenado
const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #aaa;
`;

const ProductColumn = styled.div`
  flex: 1;
  padding-left: 0.25rem;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const QuantityColumn = styled.div`
  width: 2.5rem;
  text-align: center;
  font-weight: bold;
  padding: 0 0.25rem;
`;

const PriceColumn = styled.div`
  width: 5rem;
  text-align: right;
  font-weight: bold;
  padding-right: 0.5rem;
`;

const TotalColumn = styled.div`
  width: 5rem;
  text-align: right;
  font-weight: bold;
`;

// Componentes para las filas de datos en estructura horizontal
const ItemRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.1rem;
`;

const ProductValue = styled.div`
  flex: 1;
  padding-left: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const QuantityValue = styled.div`
  width: 2.5rem;
  text-align: center;
  padding: 0 0.25rem;
`;

const PriceValue = styled.div`
  width: 5rem;
  text-align: right;
  padding-right: 0.5rem;
`;

const TotalValue = styled.div`
  width: 5rem;
  text-align: right;
`;

// Estilos mejorados para la sección de totales
const TotalsSection = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.6rem;
  padding: 0 0.5rem;
`;

const SummaryLabel = styled.div`
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  text-align: right;
  margin-right: 1rem;
  min-width: 5rem;
`;

const SummaryValue = styled.div`
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  text-align: right;
  min-width: 5rem;
`;

const TotalRow = styled(SummaryRow)`
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #aaa;
  font-size: 1.1rem;
`;

// Componente indicador de carga
const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  font-style: italic;
`;

// Componente mensaje de error
const ErrorMessage = styled.div`
  padding: 1rem;
  color: red;
  text-align: center;
`;

// Componente PreFactura con forwardRef para exponer métodos
const PreFactura = forwardRef(({ printerName, showPreview = false, initialData }, ref) => {
  // Estado local para gestionar datos y estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(initialData);
  
  // Inicializar el hook de impresión
  const { printTicket, isLoading: isPrinting } = usePrintTicket();

  // Datos por defecto si no se proporcionan
  const defaultData = {
    titulo: 'PRE FACTURA',
    empresa: 'TROY',
    bancoInfo: 'Bancolombia Ahorros',
    vendedor: 'ADMIN',
    mesa: '1',
    fecha: '10/03/2025',
    hora: '1:47:03 p.m.',
    items: [
      { cantidad: 1, producto: 'MOJICON DE QUESO', precio: 2000, total: 2000 }
    ],
    subtotal: 2000,
    servicio: 0,
    total: 2000
  };

  // Usar estado local con fallbacks
  const data = receiptData || initialData || defaultData;

  const generatePDFInternal = async () => {
    try {
      // Usar los datos más actuales disponibles
      const currentData = receiptData || initialData || defaultData;
      
      // Calcular la altura automáticamente basada en la cantidad de productos
      const baseHeight = 6.0; // Altura base para encabezado
      const itemHeight = 0.75; // Altura por cada ítem
      const totalsHeight = 3.0; // Altura para sección de totales
      const calculatedHeight = baseHeight + (currentData.items.length * itemHeight) + totalsHeight;
      
      // Asegurar una altura mínima de 8cm
      const finalHeight = Math.max(8, calculatedHeight);
      
      // Crear el PDF con dimensiones calculadas
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'cm',
        format: [8, finalHeight],
        hotfixes: ['px_scaling']
      });

      // Título centrado en la parte superior
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(currentData.titulo, 4, 0.5, { align: 'center' });
      
      // Nombre de la empresa
      doc.setFontSize(14);
      doc.text(currentData.empresa, 4, 1.0, { align: 'center' });
      
      // Información bancaria
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(currentData.bancoInfo, 4, 1.5, { align: 'center' });

      // Información del encabezado
      doc.setFontSize(10);
      doc.text(`Vendedor: ${currentData.vendedor}`, 0.5, 2.1);
      doc.text(`Fecha: ${currentData.fecha} ${currentData.hora}`, 0.5, 2.5);
      doc.text(`Mesa: ${currentData.mesa}`, 0.5, 2.9);

      // Línea separadora
      doc.setLineWidth(0.01);
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(0.5, 3.2, 7.5, 3.2);

      // Encabezados de columnas - Con orden modificado
      doc.setFont('helvetica', 'bold');
      doc.text('Producto', 1.0, 3.6); // Alineado a la izquierda
      doc.text('Cant', 4.5, 3.6, { align: 'center' }); // Centrado
      doc.text('Precio', 5.8, 3.6, { align: 'right' }); // Alineado a la derecha
      doc.text('Total', 7.3, 3.6, { align: 'right' }); // Alineado a la derecha
      
      // Línea adicional para separar encabezado de los ítems
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(0.5, 3.8, 7.5, 3.8);

      // Lista de productos - Orden modificado
      doc.setFont('helvetica', 'normal');
      let yPos = 4.3;
      const lineSpacing = 0.75;
      
      currentData.items.forEach(item => {
        // Limitamos el producto a una longitud máxima para evitar desbordamiento
        const productoRecortado = item.producto.length > 20 
          ? item.producto.substring(0, 17) + '...' 
          : item.producto;
          
        doc.text(productoRecortado, 1.0, yPos); // Alineado a la izquierda
        doc.text(item.cantidad.toString(), 4.5, yPos, { align: 'center' }); // Centrado
        doc.text(item.precio.toString(), 5.8, yPos, { align: 'right' }); // Alineado a la derecha
        doc.text(item.total.toString(), 7.3, yPos, { align: 'right' }); // Alineado a la derecha
        yPos += lineSpacing;
      });
      
      // Línea separadora antes de totales
      yPos += 0.3;
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(0.5, yPos, 7.5, yPos);
      yPos += 0.6;
      
      // Sección de totales
      doc.text("Sub Total: ", 5.0, yPos, { align: 'right' });
      doc.text(currentData.subtotal.toString(), 7.3, yPos, { align: 'right' });
      yPos += lineSpacing + 0.2;
      
      doc.text("Servicio: ", 5.0, yPos, { align: 'right' });
      doc.text(currentData.servicio.toString(), 7.3, yPos, { align: 'right' });
      yPos += lineSpacing + 0.2;
      
      // Línea separadora antes del total final
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(4.5, yPos, 7.5, yPos);
      yPos += 0.6;
      
      // Total final
      doc.setFont('helvetica', 'bold');
      doc.text("Total: ", 5.0, yPos, { align: 'right' });
      doc.text(currentData.total.toString(), 7.3, yPos, { align: 'right' });

      // Convertir a blob
      const pdfBlob = doc.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    // Método para generar PDF blob
    generatePDF: generatePDFInternal,

    // Método para imprimir el ticket
    printTicket: async (overridePrinterName) => {
      try {
        // Registramos que estamos imprimiendo
        setIsLoading(true);
        
        // Usar los datos más actuales
        const currentData = receiptData || initialData || defaultData;
        
        // Informar si nos faltan datos
        if (!currentData || !currentData.items || currentData.items.length === 0) {
          console.warn("Datos de impresión incompletos, usando datos por defecto");
        }
        
        // Generar el PDF
        const pdfBlob = await generatePDFInternal();
        
        if (!pdfBlob) {
          console.error("No se pudo generar el PDF para imprimir");
          setIsLoading(false);
          return false;
        }
        
        // Usar el nombre de impresora proporcionado o el del prop
        const targetPrinter = overridePrinterName || printerName;
        
        if (!targetPrinter) {
          console.error("No se especificó ninguna impresora");
          setIsLoading(false);
          return false;
        }
        
        // Log de impresión
        console.log(`Imprimiendo en ${targetPrinter} con datos:`, currentData);
        
        // Ejecutar la función de impresión
        const success = await printTicket(pdfBlob, targetPrinter);
        
        // Registrar el resultado
        console.log(`Resultado de impresión: ${success ? "ÉXITO" : "FALLÓ"}`);
        
        setIsLoading(false);
        return success;
      } catch (error) {
        console.error("Error en printTicket:", error);
        setIsLoading(false);
        return false;
      }
    },
    
    // Exponer el estado de carga 
    isLoading: () => isLoading || isPrinting,
    
    // Obtener los datos actuales
    getCurrentData: () => receiptData || initialData || defaultData,
    
    // Establecer nuevos datos de recibo
    setReceiptData: (newData) => {
      setReceiptData(newData);
    }
  }));

  // Mostrar estado de carga si los datos se están cargando
  if (isLoading) {
    return <LoadingMessage>Cargando datos de la factura...</LoadingMessage>;
  }

  // Mostrar mensaje de error si hubo un error al cargar los datos
  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  // Calcular el subtotal (suma de todos los totales de items)
  const calculateSubtotal = () => {
    if (!data.items || data.items.length === 0) return 0;
    return data.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  // Formato de moneda para mostrar valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <ReceiptContainer isVisible={showPreview}>
      <Header>
        <Title>{data.titulo}</Title>
        <Subtitle>{data.empresa}</Subtitle>
        <CompanyName>{data.bancoInfo}</CompanyName>
        <Separator />
        <Row>
          <Label>Vendedor:</Label>
          <Value>{data.vendedor}</Value>
        </Row>
        <Row>
          <Label>Fecha:</Label>
          <Value>{`${data.fecha} ${data.hora}`}</Value>
        </Row>
        <Row>
          <Label>Mesa:</Label>
          <Value>{data.mesa}</Value>
        </Row>
      </Header>
      
      <Separator />
      
      {/* Encabezados de columna con mejor alineación */}
      <ColumnHeader>
        <ProductColumn>Producto</ProductColumn>
        <QuantityColumn>Cant</QuantityColumn>
        <PriceColumn>Precio</PriceColumn>
        <TotalColumn>Total</TotalColumn>
      </ColumnHeader>
      
      {/* Renderización de items en estructura horizontal con Producto primero */}
      {data.items && data.items.length > 0 ? (
        data.items.map((item, index) => (
          <ItemRow key={index}>
            <ProductValue>{item.producto}</ProductValue>
            <QuantityValue>{item.cantidad}</QuantityValue>
            <PriceValue>{formatCurrency(item.precio)}</PriceValue>
            <TotalValue>{formatCurrency(item.total)}</TotalValue>
          </ItemRow>
        ))
      ) : (
        <ItemRow>
          <ProductValue>No hay productos para mostrar</ProductValue>
        </ItemRow>
      )}
      
      <Separator />
      
      {/* Sección de totales con mejor alineación */}
      <TotalsSection>
        <SummaryRow>
          <SummaryLabel>Sub Total:</SummaryLabel>
          <SummaryValue>{formatCurrency(data.subtotal || calculateSubtotal())}</SummaryValue>
        </SummaryRow>
        
        <SummaryRow>
          <SummaryLabel>Servicio:</SummaryLabel>
          <SummaryValue>{formatCurrency(data.servicio || 0)}</SummaryValue>
        </SummaryRow>
        
        <TotalRow>
          <SummaryLabel bold>Total:</SummaryLabel>
          <SummaryValue bold>
            {formatCurrency(
              data.total || 
              (data.subtotal + data.servicio) || 
              calculateSubtotal()
            )}
          </SummaryValue>
        </TotalRow>
      </TotalsSection>
    </ReceiptContainer>
  );
});

export default PreFactura;
