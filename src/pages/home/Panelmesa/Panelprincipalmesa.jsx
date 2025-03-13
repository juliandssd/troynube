import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Panelsalon from "./PanelSalon";
import Panelmesa from "./PanelMesa";
import { salonmostrarporidempresa } from "../../../Api/Tasksalon";

// Contenedor principal con prevención explícita de scroll horizontal
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  gap: 10px;
  overflow-x: hidden;
  
  /* Asegurar que los hijos no causen overflow */
  & > * {
    max-width: 100%;
    overflow-x: hidden;
  }
`;

// Exponer tablesBySalonCache al objeto window para poder limpiarlo desde otros componentes
if (typeof window !== 'undefined' && !window.tablesBySalonCache) {
  window.tablesBySalonCache = {};
}

// Componente principal mejorado con capacidad de forzar actualizaciones
const Panelprincipalmesa = ({ data, onViewChange, forceRefresh }) => {
  const [id_salon, setid_salon] = useState(null);
  const [salon, setsalon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Key para controlar el ciclo de vida de Panelmesa
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Referencia para rastrear si ya se procesó el forceRefresh actual
  const processedRefreshRef = useRef(false);
  const prevForceRefreshRef = useRef(forceRefresh);
  
  // Efecto para prevenir scroll horizontal a nivel de documento
  useEffect(() => {
    // Guardar estilos originales
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    
    // Establecer overflow-x: hidden en body y html
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.width = '100%';
    document.documentElement.style.width = '100%';
    
    // Restaurar estilos originales al desmontar
    return () => {
      document.body.style.overflowX = originalBodyOverflowX;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.body.style.width = '';
      document.documentElement.style.width = '';
    };
  }, []);
  
  // Limpiar todo el caché de mesas y forzar una actualización completa
  const forceTotalRefresh = useCallback(() => {
    
    // Limpiar caché global
    if (window.tablesBySalonCache) {
      window.tablesBySalonCache = {};
    }
    
    // Incrementar la key para forzar una recreación completa del componente Panelmesa
    setRefreshKey(prev => prev + 1);
    
    // Marcar como procesado
    processedRefreshRef.current = true;
  }, []);
  
  // Efecto para detectar cambios en forceRefresh
  useEffect(() => {
    // Solo ejecutar cuando forceRefresh cambia de false a true
    if (forceRefresh && !prevForceRefreshRef.current && !processedRefreshRef.current) {
      forceTotalRefresh();
    }
    
    // Reiniciar el estado de procesamiento cuando forceRefresh vuelve a false
    if (!forceRefresh && prevForceRefreshRef.current) {
      processedRefreshRef.current = false;
    }
    
    // Actualizar la referencia del valor anterior
    prevForceRefreshRef.current = forceRefresh;
  }, [forceRefresh, forceTotalRefresh]);
  
  // Cargar datos de salones
  useEffect(() => {
    const fetchData = async () => {
      if (!data || !data[1]) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await salonmostrarporidempresa({id: data[1]});
        
        if (response.data.data && response.data.data.length > 0) {
          setsalon(response.data.data);
          // Mantener el id_salon actual si ya existe, de lo contrario usar el primero
          setid_salon(prev => prev || response.data.data[0].id_salon);
        } else {
          setsalon([]);
          setid_salon(null);
        }
      } catch (error) {
        console.error("Error al cargar los salones:", error);
        setsalon([]);
        setid_salon(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [data]);

  // Manejador para cambiar de salón con capacidad de forzar refresco
  const handleSalonChange = useCallback((newSalonId) => {
    if (newSalonId === id_salon) return; // No hacer nada si es el mis
    
    // Actualizar el id_salon seleccionado
    setid_salon(newSalonId);
    
    // Incrementar la key para forzar una recreación completa del componente Panelmesa
    setRefreshKey(prev => prev + 1);
  }, [id_salon]);

  // Si está cargando y no hay salones todavía, mostramos un indicador

  // Si no hay salones después de cargar, mostrar mensaje
  if (!isLoading && salon.length === 0) {
    return <div style={{ overflowX: "hidden", maxWidth: "100%" }}>No hay salones disponibles</div>;
  }

  return (
    <MainContainer>
      <Panelsalon 
        data={salon} 
        setid_salon={handleSalonChange} 
        currentSalonId={id_salon}
      />
      {id_salon && (
        <Panelmesa 
          key={`mesa-${id_salon}-${refreshKey}`} 
          id_salon={id_salon} 
          onViewChange={onViewChange} 
          forceRefresh={true} // Siempre true para forzar la carga inicial en cada recreación
        />
      )}
    </MainContainer>
  );
};

export default Panelprincipalmesa;