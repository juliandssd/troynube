import { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para imprimir tickets con mejor manejo de errores
 * @returns {Object} Funciones y estado para manejar la impresión
 */
const usePrintTicket = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Envía un archivo a la API para imprimir
   * @param {File|Blob} file - El archivo PDF a imprimir
   * @param {string} printerName - El nombre de la impresora
   */
  const printTicket = async (file, printerName) => {
    setIsLoading(true);
    
    try {
      // Validaciones previas
      if (!file) {
        throw new Error("No se proporcionó ningún archivo para imprimir");
      }
      
      if (!printerName) {
        throw new Error("No se especificó el nombre de la impresora");
      }
      
      console.log("Datos de impresión:", {
        fileType: file.type,
        fileSize: file.size + " bytes",
        printerName
      });
      
      // Crear FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("printerName", printerName);
      
      // Realizar la solicitud a la API con mejor manejo de errores
      console.log("Enviando solicitud a la API de impresión...");
      const responseApi = await fetch("http://localhost:5075/api/print-ticket", {
        method: "POST",
        body: formData
      });
      
      // Obtener el texto de respuesta para análisis de error
      const responseText = await responseApi.text();
      
      if (responseApi.ok) {
        toast.success("El ticket se envió a imprimir correctamente.");
        return true;
      } else {
        // Intentar analizar el error como JSON
        let errorMessage = responseText;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || responseText;
        } catch (e) {
          // Si no es JSON, usar el texto tal cual
        }
        
        console.error("Error en el servidor:", {
          status: responseApi.status,
          statusText: responseApi.statusText,
          response: responseText
        });
        
        toast.error(`Error al imprimir (${responseApi.status}): ${errorMessage}`);
        return false;
      }
    } catch (err) {
      console.error("Error durante la impresión:", err);
      toast.error("Error al imprimir: " + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    printTicket,
    isLoading
  };
};

export default usePrintTicket;