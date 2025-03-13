import React, { forwardRef, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import usePrintTicket from '../usePrintTicket';

// Styled components for rendering the receipt
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

const ColumnHeader = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
`;

const QuantityColumn = styled.div`
  width: 3.5rem;
  font-weight: bold;
`;

const ProductColumn = styled.div`
  flex: 1;
  font-weight: bold;
`;

const QuantityValue = styled.div`
  width: 3.5rem;
  font-weight: bold;
  margin-right: 0.8rem;
`;

const ProductValue = styled.div`
  flex: 1;
  font-weight: bold;
`;

const ItemRow = styled(Row)`
  margin-bottom: 0.6rem;
  padding-bottom: 0.1rem;
`;

// Loading indicator component
const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  font-style: italic;
`;

// Error message component
const ErrorMessage = styled.div`
  padding: 1rem;
  color: red;
  text-align: center;
`;

// Receipt component with forwardRef to expose methods
const Receipt = forwardRef(({ printerName, showPreview = false, initialData }, ref) => {
  // Local state for managing data and UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(initialData);
  
  // Initialize the printing hook
  const { printTicket, isLoading: isPrinting } = usePrintTicket();

  // Default data if not provided
  const defaultData = {
    titulo: 'COCINA',
    mesero: 'ADMIN',
    mesa: '1',
    fecha: '10-03-2025',
    hora: '13:47:05',
    items: [
      { cantidad: 1, producto: 'MOJICON DE QUESO' }
    ]
  };

  // Use local state with fallbacks
  const data = receiptData || initialData || defaultData;

  // Función interna para generar el PDF
  const generatePDFInternal = async () => {
    try {
      // Usar los datos más actuales disponibles
      const currentData = receiptData || initialData || defaultData;
      
      // Calcular la altura automáticamente basada en la cantidad de productos
      // Base: 4.0cm para encabezado + 0.75cm por cada producto
      const baseHeight = 4.0; // Altura base para encabezado
      const itemHeight = 0.75; // Reducido a 0.75cm para menos espacio entre ítems
      const calculatedHeight = baseHeight + (currentData.items.length * itemHeight);
      
      // Asegurar una altura mínima de 8cm
      const finalHeight = Math.max(8, calculatedHeight);
      
      // Crear el PDF con dimensiones calculadas
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'cm',
        format: [8, 34], // 8cm ancho x altura calculada
        hotfixes: ['px_scaling']
      });

      // Título centrado en la parte superior - AUMENTADO DE 12 A 16
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(currentData.titulo, 4, 0.5, { align: 'center' });

      // Información del encabezado - AUMENTADO DE 9 A 12
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mesero: ${currentData.mesero}`, 0.5, 1);
      doc.text(`Mesa: ${currentData.mesa}`, 0.5, 1.4);
      doc.text(`Hora: ${currentData.fecha} ${currentData.hora}`, 0.5, 1.8);

      // Línea separadora
      doc.setLineWidth(0.01);
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(0.5, 2.1, 7.5, 2.1);

      // Encabezados de columnas
      doc.setFont('helvetica', 'bold');
      doc.text('Cant', 0.5, 2.5);
      doc.text('Producto', 2.0, 2.5);
      
      // Línea adicional para separar encabezado de los ítems
      doc.setLineWidth(0.01);
      doc.setLineDash([0.1, 0.1], 0);
      doc.line(0.5, 2.7, 7.5, 2.7);

      // Lista de productos - con más espacio después del encabezado
      doc.setFont('helvetica', 'bold');
      let yPos = 3.2; // Aumentado de 2.9 a 3.2 para separar más del encabezado
      const lineSpacing = 0.75; // Reducido de 0.9 a 0.75 para menos espacio entre ítems
      
      currentData.items.forEach(item => {
        doc.text(item.cantidad.toString(), 0.5, yPos);
        doc.text(item.producto, 2.0, yPos); // Aumentado de 1.5 a 2.0 para más separación
        yPos += lineSpacing;
      });

      // Convert to blob
      const pdfBlob = doc.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    // Method to generate PDF blob
    generatePDF: generatePDFInternal,

    // Method to print the ticket
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
    
    // Get the current data
    getCurrentData: () => receiptData || initialData || defaultData,
    
    // Set new receipt data
    setReceiptData: (newData) => {
      setReceiptData(newData);
    }
  }));

  // Show loading state if data is being fetched
  if (isLoading) {
    return <LoadingMessage>Cargando datos del recibo...</LoadingMessage>;
  }

  // Show error message if there was an error fetching data
  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <ReceiptContainer id="receipt-container" isVisible={showPreview}>
      <Header>
        <Title>{data.titulo}</Title>
        <Row>
          <Label>Mesero:</Label>
          <Value bold>{data.mesero}</Value>
        </Row>
        <Row>
          <Label>Mesa:</Label>
          <Value>{data.mesa}</Value>
        </Row>
        <Row>
          <Label>Hora:</Label>
          <Value>{`${data.fecha} ${data.hora}`}</Value>
        </Row>
      </Header>
      
      <Separator />
      
      <ColumnHeader>
        <QuantityColumn>Cant</QuantityColumn>
        <ProductColumn>Producto</ProductColumn>
      </ColumnHeader>
      
      {/* Safely render items if they exist */}
      {data.items && data.items.length > 0 ? (
        data.items.map((item, index) => (
          <ItemRow key={index}>
            <QuantityValue>{item.cantidad}</QuantityValue>
            <ProductValue>{item.producto}</ProductValue>
          </ItemRow>
        ))
      ) : (
        <ItemRow>
          <ProductValue>No hay productos para mostrar</ProductValue>
        </ItemRow>
      )}
    </ReceiptContainer>
  );
});

export default Receipt;