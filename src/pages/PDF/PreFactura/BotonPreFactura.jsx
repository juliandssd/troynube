import React, { useRef, useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import PreFactura from '../PDF/Factura/PreFactura';
import { prepararDatosPreFactura } from '../utils/printPreFactura';
import { obtenerDatosMesa } from '../Api/apiService'; // Reemplaza con tu API real

// Tu función existente para obtener impresoras
const obtenerImpresoras = async () => {
  try {
    const respuesta = await fetch('http://localhost:5075/api/list');
    if (respuesta.ok) {
      const impresoras = await respuesta.json();
      return impresoras;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener impresoras:', error);
    return [];
  }
};

// Componente botón de Pre Factura que puede usarse en cualquier parte
const BotonPreFactura = ({ mesaId, printerName = null }) => {
  const [imprimiendo, setImprimiendo] = useState(false);
  const [error, setError] = useState(null);
  const preFacturaRef = useRef(null);
  const [impresoraSeleccionada, setImpresoraSeleccionada] = useState(printerName);
  
  // Cargar impresora si no se especificó una
  useEffect(() => {
    const cargarImpresora = async () => {
      if (!printerName) {
        try {
          const impresoras = await obtenerImpresoras();
          if (impresoras && impresoras.length > 0) {
            // Usar la primera impresora disponible como predeterminada
            setImpresoraSeleccionada(impresoras[0].name);
          }
        } catch (err) {
          console.error("Error al cargar impresoras:", err);
        }
      }
    };
    
    cargarImpresora();
  }, [printerName]);
  
  const handleClick = async () => {
    if (imprimiendo) return;
    
    setImprimiendo(true);
    setError(null);
    
    try {
      // 1. Verificar si tenemos una impresora seleccionada
      if (!impresoraSeleccionada) {
        throw new Error("No hay ninguna impresora seleccionada.");
      }
      
      // 2. Obtener datos actuales de la mesa (reemplaza con tu API)
      const datosMesa = await obtenerDatosMesa(mesaId);
      
      // 3. Preparar datos para la pre-factura
      const datos = prepararDatosPreFactura({
        vendedor: datosMesa.mesero || 'ADMIN',
        mesa: mesaId,
        items: datosMesa.productos.map(p => ({
          cantidad: p.cantidad,
          producto: p.nombre,
          precio: p.precio,
          total: p.precio * p.cantidad
        })),
        subtotal: datosMesa.subtotal || 0,
        servicio: datosMesa.servicio || 0,
        total: datosMesa.total || 0
      });
      
      // 4. Actualizar datos en el componente PreFactura
      preFacturaRef.current.setReceiptData(datos);
      
      // 5. Ejecutar la impresión
      const resultado = await preFacturaRef.current.printTicket(impresoraSeleccionada);
      
      if (!resultado) {
        throw new Error(`Error al imprimir en ${impresoraSeleccionada}.`);
      }
      
      console.log(`Pre-factura impresa correctamente en ${impresoraSeleccionada}`);
    } catch (err) {
      console.error('Error al imprimir:', err);
      setError(err.message);
    } finally {
      setImprimiendo(false);
    }
  };
  
  return (
    <>
      <button 
        onClick={handleClick}
        disabled={imprimiendo || !impresoraSeleccionada}
        style={{
          opacity: (imprimiendo || !impresoraSeleccionada) ? 0.7 : 1,
          cursor: (imprimiendo || !impresoraSeleccionada) ? 'not-allowed' : 'pointer'
        }}
      >
        <Printer />
        <span>{imprimiendo ? 'Imprimiendo...' : 'Pre Factura'}</span>
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '4px', fontSize: '0.75rem' }}>
          Error: {error}
        </div>
      )}
      
      {/* Componente PreFactura oculto */}
      <div style={{ 
        position: 'absolute', 
        width: '1px', 
        height: '1px', 
        overflow: 'hidden', 
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}>
        <PreFactura ref={preFacturaRef} />
      </div>
    </>
  );
};

export default BotonPreFactura;