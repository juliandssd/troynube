import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Navbar from '../menuopciones/Menuopciones';
import Panelprincipalmesa from '../Panelmesa/Panelprincipalmesa';
import { useAuthStore, useidmesa, useIdVentaStore, useImpresoraInit, useMovimientosStore, useserialPC } from '../../authStore';
import ColumnasColoreadas from '../../Puntoventa/PuntoventaPrincipal';
import Productoconfiguracionprincipal from '../../Productoconfiguracion/Confiproducto/ConfiguracionPrincipal';
import ImpresoraPrincipal from '../../Impresora/ImpresoraPrincipal';
import Egresoyingresoprincipal from '../../Egresoeingreso/Egresoyingresoprincipal';
import ClientSupplierInterface from '../../Cliente/ClientSupplierInterface';
import Panelprincipalconfiguraciones from '../../Configuracion/Panelprincipalconfiguraciones';
import Cerrarcajaprincipal from '../../Cerrarcaja/Cerrarcajaprincipal';
import Receipt from '../../PDF/Comanda/Ticket';
import { ordencocinainsertar, ventaimprimirbahia, ventaimprimircocina } from '../../../Api/TaskventaYdetalle';
import { impresoramostrarseleccionada } from '../../../Api/TaskareaYimpresora';

// Definimos los estilos del componente
const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const NavbarWrapper = styled.header`
  width: 100%;
  max-width: 100%;
  flex: 0 0 auto;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  
  nav {
    width: 100% !important;
    max-width: 100% !important;
    position: relative !important;
    left: 0 !important;
    right: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
`;

const HiddenContainer = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  max-width: 100%;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  
  > * {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const Homepanel = () => {
  // Función de registro de depuración para el proceso de impresión
  const debugLog = (message, data = null) => {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    console.log(`[PRINT ${timestamp}] ${message}`, data ? data : '');
  };

  // Inicialización de impresoras para cada área
  // IMPORTANTE: useImpresoraInit directamente devuelve el nombre de la impresora como string
  const impresoraDataCocina = useImpresoraInit('cocina');
  const DEFAULT_PRINTER = 'POS-80C';
  
  // Estados para almacenar las impresoras para cada área - null significa "no imprimir"
  const [impresoraBar, setImpresoraBar] = useState(null);
  const [impresoraCocina, setImpresoraCocina] = useState(null);
  const [impresoraAsados, setImpresoraAsados] = useState(null);
  
  // Estado para rastrear si las impresoras se han cargado
  const [impresorasCargadas, setImpresorasCargadas] = useState(false);
  
  // Estado para rastrear si necesitamos refrescar los datos
  const [refreshImpresoras, setRefreshImpresoras] = useState(0);

  // Función para forzar la recarga de impresoras
  const recargarImpresoras = () => {
    debugLog("Forzando recarga de impresoras desde la base de datos");
    setRefreshImpresoras(prev => prev + 1);
  };
  
  // Efecto para procesar los datos de useImpresoraInit
  // IMPORTANTE: useImpresoraInit ya retorna directamente el nombre de la impresora
  useEffect(() => {
    if (impresoraDataCocina !== null && impresoraDataCocina !== undefined) {
      debugLog('Datos recibidos de useImpresoraInit("cocina"):', impresoraDataCocina);
      
      // useImpresoraInit ya devuelve el nombre de la impresora como string
      if (typeof impresoraDataCocina === 'string' && impresoraDataCocina.trim() !== '') {
        console.log(impresoraDataCocina);
        setImpresoraCocina(impresoraDataCocina);
        debugLog(`Impresora para cocina actualizada a: ${impresoraDataCocina}`);
      } else {
        debugLog('useImpresoraInit no devolvió un nombre de impresora válido:', impresoraDataCocina);
      }
    }
  }, [impresoraDataCocina]);
  
  // Efecto para recargar periódicamente las impresoras (cada 5 minutos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      recargarImpresoras();
      debugLog("Recargando configuración de impresoras automáticamente");
    }, 300000); // Cada 5 minutos
    
    return () => clearInterval(intervalo);
  }, []);

  // Verificar al iniciar la aplicación
  useEffect(() => {
    // Hacer una verificación inicial después de un breve retraso
    const timer = setTimeout(() => {
      debugLog("Verificación inicial de impresoras...");
      
      if (!impresoraBar && !impresoraCocina && !impresoraAsados) {
        debugLog("¡ADVERTENCIA! Ninguna impresora está configurada después de la carga inicial.");
        debugLog("Forzando recarga...");
        recargarImpresoras();
      } else {
        debugLog("Estado inicial de impresoras:", {
          bar: impresoraBar || "NO CONFIGURADA",
          cocina: impresoraCocina || "NO CONFIGURADA",
          asados: impresoraAsados || "NO CONFIGURADA"
        });
      }
    }, 5000); // Verificar después de 5 segundos
    
    return () => clearTimeout(timer);
  }, [impresoraBar, impresoraCocina, impresoraAsados]);
  
  // Función para verificar el estado actual de las impresoras
  const verificarImpresorasActuales = () => {
    debugLog("ESTADO ACTUAL DE IMPRESORAS:", {
      bar: impresoraBar ? impresoraBar : "NO CONFIGURADA",
      cocina: impresoraCocina ? impresoraCocina : "NO CONFIGURADA",
      asados: impresoraAsados ? impresoraAsados : "NO CONFIGURADA"
    });
    
    // Forzar una recarga de impresoras
    recargarImpresoras();
  };

  // Función para depurar la respuesta de la API
  const depurarRespuestaAPI = async () => {
    try {
      debugLog("Depurando llamada a impresoramostrarseleccionada...");
      
      // Obtener el serial desde el store
      const serialPC = useserialPC.getState();
      const serial = await serialPC.obtenerSerial();
      
      debugLog(`Serial obtenido: ${serial}`);
      
      // Realizar llamada directa a la API para cada área
      const areas = ['bar', 'cocina', 'asados'];
      
      for (const area of areas) {
        try {
          // IMPORTANTE: Llamada correcta según useImpresoraStore
          const response = await impresoramostrarseleccionada({
            serial: serial,
            nombre: area
          });
          
          debugLog(`Respuesta COMPLETA para ${area}:`, response);
          
          if (response && response.data) {
            debugLog(`Contenido response.data para ${area}:`, response.data);
            
            // La respuesta debería tener la impresora en data.data
            if (response.data.data !== undefined) {
              debugLog(`Valor response.data.data para ${area}: "${response.data.data}"`);
            }
          }
          
          // Comparar con el estado actual
          let estadoActual;
          switch (area) {
            case 'bar':
              estadoActual = impresoraBar;
              break;
            case 'cocina':
              estadoActual = impresoraCocina;
              break;
            case 'asados':
              estadoActual = impresoraAsados;
              break;
          }
          debugLog(`Estado actual para ${area}: ${estadoActual || 'null'}`);
        } catch (error) {
          debugLog(`Error al consultar ${area}:`, error);
        }
      }
      
      // Verificar también el hook useImpresoraInit
      debugLog('Valor actual de useImpresoraInit("cocina"):', impresoraDataCocina);
      
      // Forzar recarga
      debugLog('Forzando recarga de impresoras...');
      recargarImpresoras();
      
    } catch (error) {
      debugLog("Error en depuración:", error);
    }
  };
  
  // Exponer funciones de depuración al objeto window
  useEffect(() => {
    // Solo en modo desarrollo o depuración
    if (process.env.NODE_ENV !== 'production') {
      window.recargarImpresoras = recargarImpresoras;
      window.verificarImpresorasActuales = verificarImpresorasActuales;
      window.depurarRespuestaAPI = depurarRespuestaAPI;
    }
    
    return () => {
      // Limpiar al desmontar
      if (window.recargarImpresoras) {
        delete window.recargarImpresoras;
      }
      if (window.verificarImpresorasActuales) {
        delete window.verificarImpresorasActuales;
      }
      if (window.depurarRespuestaAPI) {
        delete window.depurarRespuestaAPI;
      }
    };
  }, []);

  // Efecto para cargar las impresoras - se ejecutará al inicio y cuando se solicite refresh
  useEffect(() => {
    // Función para cargar la impresora para cada área
    const cargarImpresoras = async () => {
      try {
        debugLog('Iniciando carga de impresoras desde la API (refresh #' + refreshImpresoras + ')');
        
        // Obtener el serial desde el store
        const serialPC = useserialPC.getState();
        const serial = await serialPC.obtenerSerial();
        
        if (!serial) {
          debugLog('No se pudo obtener el serial del PC');
          return;
        }
        
        debugLog(`Serial obtenido: ${serial}`);
        const areas = ['bar', 'cocina', 'asados'];
        
        for (const area of areas) {
          try {
            // FORMA CORRECTA DE LLAMAR A LA API:
            // Los parámetros van directamente como propiedades del objeto
            const response = await impresoramostrarseleccionada({
              serial: serial,
              nombre: area
            });
            
            // Depurar la respuesta completa
            debugLog(`Respuesta para ${area}:`, response);
            
            // Si hay una respuesta válida con datos
            if (response && response.data && response.data.data !== undefined) {
              const nombreImpresora = response.data.data;
              
              // Solo actualizar si es un nombre válido
              if (typeof nombreImpresora === 'string' && nombreImpresora.trim() !== '') {
                switch(area) {
                  case 'bar':
                    setImpresoraBar(nombreImpresora);
                    debugLog(`Impresora para bar actualizada a: ${nombreImpresora}`);
                    break;
                  case 'cocina':
                    // No sobreescribir si ya está configurada por useImpresoraInit
                    if (!impresoraCocina) {
                      setImpresoraCocina(nombreImpresora);
                      debugLog(`Impresora para cocina actualizada a: ${nombreImpresora}`);
                    }
                    break;
                  case 'asados':
                    setImpresoraAsados(nombreImpresora);
                    debugLog(`Impresora para asados actualizada a: ${nombreImpresora}`);
                    break;
                }
              } else {
                debugLog(`Nombre de impresora no válido para ${area}: "${nombreImpresora}"`);
              }
            } else {
              debugLog(`Sin datos de impresora para ${area}`);
            }
          } catch (error) {
            debugLog(`Error al cargar impresora para ${area}:`, error);
          }
        }
        
        // Verificar la configuración final después de un breve retraso
        setTimeout(() => {
          debugLog("CONFIGURACIÓN FINAL DE IMPRESORAS:", {
            bar: impresoraBar ? impresoraBar : "NO CONFIGURADA",
            cocina: impresoraCocina ? impresoraCocina : "NO CONFIGURADA",
            asados: impresoraAsados ? impresoraAsados : "NO CONFIGURADA"
          });
        }, 500);
        
        // Marcar las impresoras como cargadas
        setImpresorasCargadas(true);
        
      } catch (error) {
        debugLog('Error general al cargar las impresoras:', error);
        setImpresorasCargadas(true); // Marcar como cargadas aunque haya error
      }
    };
    
    cargarImpresoras();
  }, [refreshImpresoras]); // Se ejecutará cuando cambie refreshImpresoras

  // Obtener los datos de autenticación
  const authData = useAuthStore((state) => state.authData);
  const { fetchMovimientos, setupPusher, movimientos } = useMovimientosStore();
  const { tableId, setTableId } = useidmesa();
  
  // IMPORTANTE: Referencias independientes para cada impresora
  const barReceiptRef = useRef(null);
  const cocinaReceiptRef = useRef(null);
  const asadosReceiptRef = useRef(null);
  
  // Estado independiente para cada impresora
  const [barInfo, setBarInfo] = useState(null);
  const [cocinaInfo, setCocinaInfo] = useState(null);
  const [asadosInfo, setAsadosInfo] = useState(null);
  
  // Obtener los estados y acciones para el procesamiento de IDs de venta
  const { 
    idVentas, 
    processing, 
    setProcessing, 
    removeIdVenta,
    printTrigger
  } = useIdVentaStore();
  
  // Estado para controlar la visibilidad del Navbar
  const [navbarVisible, setNavbarVisible] = useState(true);
  
  // Estado para controlar la navegación por pasos
  const [navigationStep, setNavigationStep] = useState('inicial');
  
  // Key para forzar re-renderizado completo del panel de mesas
  const [mesasKey, setMesasKey] = useState(0);
  
  // Referencia para rastrear la vista anterior
  const prevViewRef = useRef(null);
  
  // MODIFICADO: Siempre comenzar con 'Cafetería' cuando se recarga la página
  const [currentView, setCurrentView] = useState('Cafetería');
  
  // Estado para la cola de impresión mejorada
  const [printQueue, setPrintQueue] = useState({
    active: false,
    currentId: null,
    processedCount: 0,
    lastProcessedTime: null
  });
  
  // Mantener un registro de IDs procesados para evitar duplicaciones
  const [processedIds, setProcessedIds] = useState(new Set());

  // Mantener un registro detallado de lo que se ha impreso
  const [printedJobs, setPrintedJobs] = useState({});

  // Añadir un estado para rastrear si los movimientos ya se han cargado
  const [movimientosCargados, setMovimientosCargados] = useState(false);

  // Efecto para asegurar que los movimientos se cargan correctamente
  useEffect(() => {
    if (fetchMovimientos && typeof fetchMovimientos === 'function' && !movimientosCargados) {
      console.log('Cargando datos de movimientos...');
      fetchMovimientos()
        .then(() => {
          console.log('Datos de movimientos cargados correctamente');
          setMovimientosCargados(true);
        })
        .catch(err => {
          console.error('Error al cargar datos de movimientos:', err);
        });
    }
  }, [fetchMovimientos, movimientosCargados]);

  // Monitorear el estado de movimientos para debugging
  useEffect(() => {
    console.log('Estado actual de movimientos:', movimientos);
  }, [movimientos]);
  
  // Función para procesar un único trabajo de impresión con manejo mejorado de errores
  const processNextPrintJob = async () => {
    // Si no hay IDs para procesar, marcar la cola como inactiva
    if (idVentas.length === 0) {
      debugLog('Cola de impresión vacía, marcando como inactiva');
      setPrintQueue(prev => ({
        ...prev,
        active: false,
        currentId: null,
        lastProcessedTime: Date.now()
      }));
      return;
    }
    
    // Obtener el origen de la impresión
    const printSource = useIdVentaStore.getState().printSource;
    
    // Registrar info adicional para depuración
    debugLog(`Detalle de origen: ${printSource}, Estado de la cola:`, {
      idVentas: idVentas,
      printSource: printSource,
      trigger: printTrigger
    });
    
    // Si el origen no es MenuComponent, no continuar con la impresión
    if (printSource !== 'MenuComponent') {
      debugLog(`Origen de impresión no válido: ${printSource}, se requiere 'MenuComponent'`);
      setPrintQueue(prev => ({
        ...prev,
        active: false,
        currentId: null,
        lastProcessedTime: Date.now()
      }));
      return;
    }
    
    // Tomar el primer ID de la cola
    const currentId = idVentas[0];
    
    // Actualizar estado para indicar qué ID se está procesando
    setPrintQueue(prev => ({
      ...prev,
      currentId: currentId,
      lastProcessedTime: Date.now()
    }));
    
    debugLog(`Procesando trabajo de impresión: ID ${currentId}`);
    
    // Rastrear si el ID ya fue eliminado
    let idRemoved = false;
    
    // Función para eliminar el ID de manera segura
    const safelyRemoveId = () => {
      if (!idRemoved) {
        debugLog(`Eliminando ID ${currentId} de la cola de forma segura`);
        removeIdVenta(currentId);
        idRemoved = true;
      }
    };
    
    // Función para continuar con el siguiente trabajo - GARANTIZA CONTINUACIÓN
    const continueToNextJob = (delay = 200) => {
      setTimeout(() => {
        // IMPORTANTE: Verificar la cola actual directamente del store
        const remainingIds = useIdVentaStore.getState().idVentas;
        
        if (remainingIds && remainingIds.length > 0) {
          debugLog(`Continuando con el siguiente trabajo. ${remainingIds.length} restantes: ${remainingIds.join(', ')}`);
          processNextPrintJob(); // Procesar el siguiente ID
        } else {
          debugLog('Procesamiento de cola completado, no hay más IDs');
          setPrintQueue(prev => ({
            ...prev,
            active: false,
            currentId: null,
            lastProcessedTime: Date.now()
          }));
        }
      }, delay);
    };
    
    try {
      // Verificar si este ID ya tiene registros de impresión
      const jobRecord = printedJobs[currentId] || {
        bar: false,
        cocina: false,
        asados: false,
        attempts: 0
      };
      
      // Incrementar el contador de intentos
      jobRecord.attempts += 1;
      
      // IMPORTANTE: ELIMINAMOS LA CONDICIÓN QUE LIMITA LOS INTENTOS
      // Ahora seguirá intentando imprimir sin importar cuántos intentos haya hecho
      
      // Mostrar información detallada del trabajo para depuración
      debugLog(`Trabajo de impresión ID ${currentId}, intento #${jobRecord.attempts}, estado anterior:`, jobRecord);
      
      // Actualizar el registro de trabajos
      setPrintedJobs(prev => ({
        ...prev,
        [currentId]: jobRecord
      }));
      
      // Esperar a que las impresoras se carguen antes de imprimir
      if (!impresorasCargadas) {
        debugLog('Esperando a que se carguen las impresoras...');
        setTimeout(() => processNextPrintJob(), 1000);
        return;
      }
      
      // Intentar imprimir
      debugLog(`Iniciando impresión para ID ${currentId}, intento #${jobRecord.attempts}`);
      const result = await probarImpresora(null, null, currentId, jobRecord);
      
      debugLog(`Resultado de impresión para ID ${currentId}:`, result);
      
      // Marcar el trabajo como procesado solo si se imprimió algo con éxito
      if (result.success) {
        debugLog(`Impresión exitosa para ID ${currentId} en al menos una impresora`);
        
        // Marcar como procesado para evitar duplicados futuros
        setProcessedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(currentId);
          return newSet;
        });
        
        // Actualizar el resultado de impresión
        setPrintedJobs(prev => ({
          ...prev,
          [currentId]: result.results
        }));
        
        // Limpiar de la cola y continuar con el siguiente
        safelyRemoveId();
      } else if (result.nothingToPrint) {
        // No había nada para imprimir, marcar como procesado
        debugLog(`No hay datos para imprimir para ID ${currentId}, marcando como procesado`);
        setProcessedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(currentId);
          return newSet;
        });
        
        // Limpiar de la cola y continuar con el siguiente
        safelyRemoveId();
      } else {
        // Hubo un error, pero no fue por falta de datos
        // AQUÍ ESTÁ EL CAMBIO CLAVE: NO eliminamos el ID de la cola para que lo intente de nuevo
        debugLog(`Impresión fallida para ID ${currentId}, reintentando en el próximo ciclo`);
        
        // Actualizamos lastProcessedTime para evitar que se detecte como atascado
        setPrintQueue(prev => ({
          ...prev,
          lastProcessedTime: Date.now()
        }));
        
        // Esperar un tiempo antes de intentar de nuevo (más largo para dar tiempo a solucionar problemas)
        setTimeout(() => {
          debugLog(`Reintentando procesamiento de cola después de fallo para ID ${currentId}`);
          
          // Verificar si todavía estamos procesando el mismo ID
          if (useIdVentaStore.getState().idVentas[0] === currentId) {
            // Reintentar
            processNextPrintJob();
          } else {
            // Si el ID cambió, continuamos con el siguiente
            continueToNextJob(100);
          }
        }, 3000); // Reintento cada 3 segundos
        
        // Terminar la ejecución actual sin eliminar el ID
        return;
      }
      
      // Actualizar estadísticas
      setPrintQueue(prev => ({
        ...prev,
        processedCount: prev.processedCount + 1,
        lastProcessedTime: Date.now()
      }));
      
      // Continuar con el siguiente trabajo si se eliminó el actual
      if (idRemoved) {
        continueToNextJob(200);
      }
      
    } catch (error) {
      debugLog(`Error inesperado procesando ID ${currentId}:`, error);
      
      // CAMBIO IMPORTANTE: En caso de error, no eliminamos el ID para reintentar
      debugLog(`Reintentando después de error para ID ${currentId}`);
      
      // Actualizar el estado
      setPrintQueue(prev => ({
        ...prev,
        lastProcessedTime: Date.now()
      }));
      
      // Esperar antes de reintentar
      setTimeout(() => {
        processNextPrintJob();
      }, 2000);
    }
  };
  
  // Iniciar el procesamiento de la cola cuando hay IDs o cuando se activa el trigger
  useEffect(() => {
    // Si la cola ya está activa, no hacer nada
    if (printQueue.active) return;
    
    // Si no hay IDs para procesar, no hacer nada
    if (idVentas.length === 0) return;
    
    // Obtener el origen de la impresión
    const printSource = useIdVentaStore.getState().printSource;
    
    debugLog(`Iniciando cola de impresión con ${idVentas.length} trabajos. Origen: ${printSource}, Trigger: ${printTrigger}`);
    
    // Solo procesar si el origen es válido
    if (printSource !== 'MenuComponent') {
      debugLog('Origen de impresión no válido, ignorando trigger');
      return;
    }
    
    // Establecer la cola como activa
    setPrintQueue(prev => ({
      ...prev,
      active: true,
      startTime: Date.now(),
      currentId: idVentas[0],
      lastProcessedTime: Date.now()
    }));
    
    // Pequeño retraso para asegurar que el estado se ha actualizado
    setTimeout(() => {
      processNextPrintJob();
    }, 200);
    
  }, [idVentas.length, printQueue.active, printTrigger]);
  
  // Limpiar IDs procesados antiguos periódicamente
  useEffect(() => {
    const clearOldProcessedIds = () => {
      if (processedIds.size > 1000) {
        debugLog(`Limpiando IDs procesados antiguos, tamaño actual: ${processedIds.size}`);
        const idsArray = Array.from(processedIds);
        const newIds = new Set(idsArray.slice(-1000)); // Mantener solo los últimos 1000
        setProcessedIds(newIds);
      }
      
      // También limpiar registros de trabajos antiguos
      if (Object.keys(printedJobs).length > 1000) {
        debugLog('Limpiando registros de trabajos antiguos');
        const jobKeys = Object.keys(printedJobs);
        const keysToKeep = jobKeys.slice(-1000); // Mantener solo los últimos 1000
        
        const newJobs = {};
        keysToKeep.forEach(key => {
          newJobs[key] = printedJobs[key];
        });
        
        setPrintedJobs(newJobs);
      }
    };
    
    const interval = setInterval(clearOldProcessedIds, 3600000); // 1 hora
    return () => clearInterval(interval);
  }, [processedIds, printedJobs]);
  
  // Effect para detectar si el procesamiento está atascado
  useEffect(() => {
    // Si la cola está activa y el último tiempo de procesamiento está disponible
    if (printQueue.active && printQueue.lastProcessedTime) {
      const stuckTimeout = 30000; // 30 segundos
      
      // Crear un temporizador para verificar si el procesamiento está atascado
      const timer = setTimeout(() => {
        const currentTime = Date.now();
        const timeSinceLastProcess = currentTime - printQueue.lastProcessedTime;
        
        // Si han pasado más de 30 segundos desde la última actualización, consideramos que está atascado
        if (timeSinceLastProcess > stuckTimeout) {
          debugLog('La cola de impresión parece estar atascada, reiniciando...', {
            stuckId: printQueue.currentId,
            timeSinceLastProcess: `${Math.round(timeSinceLastProcess / 1000)}s`
          });
          
          // Si hay un ID atascado, marcarlo como procesado para evitar bucles
          if (printQueue.currentId) {
            setProcessedIds(prev => {
              const newSet = new Set(prev);
              newSet.add(printQueue.currentId);
              return newSet;
            });
          }
          
          // Restablecer el estado y eliminar el ID atascado
          if (printQueue.currentId && idVentas.includes(printQueue.currentId)) {
            removeIdVenta(printQueue.currentId);
          }
          
          // Reiniciar la cola
          setPrintQueue(prev => ({
            ...prev,
            active: false,
            lastProcessedTime: currentTime
          }));
        }
      }, stuckTimeout);
      
      // Limpiar el temporizador cuando el componente se desmonte o el estado cambie
      return () => clearTimeout(timer);
    }
  }, [printQueue.active, printQueue.lastProcessedTime, printQueue.currentId, idVentas, removeIdVenta]);

  // Función mejorada para imprimir tickets con impresoras independientes y específicas para cada área
  const probarImpresora = async (event, impresoraNombre, id_venta, jobRecord = {}) => {
    if (event && typeof event === 'object' && event.stopPropagation) {
      event.stopPropagation();
    }
    
    debugLog(`=== INICIANDO TRABAJO DE IMPRESIÓN PARA ID: ${id_venta} ===`);
    debugLog(`Estado de las referencias de componentes:`, {
      barRef: barReceiptRef.current ? 'disponible' : 'null',
      cocinaRef: cocinaReceiptRef.current ? 'disponible' : 'null',
      asadosRef: asadosReceiptRef.current ? 'disponible' : 'null'
    });
    
    // Validar entrada
    if (!id_venta) {
      debugLog("No se proporcionó ID para impresión");
      return { 
        success: false, 
        nothingToPrint: false,
        results: {}
      };
    }
    
    // Verificar si la solicitud de impresión proviene del MenuComponent
    const printSource = useIdVentaStore.getState().printSource;
    
    if (printSource !== 'MenuComponent') {
      debugLog(`Impresión rechazada - Fuente incorrecta: ${printSource}, se requiere 'MenuComponent'`);
      return {
        success: false,
        nothingToPrint: true,
        results: { skipped: true, reason: 'invalid_source' }
      };
    }
    
    // Mostrar qué impresoras se usarán para cada área
    debugLog('Impresoras configuradas por área:', {
      bar: impresoraBar ? impresoraBar : 'NO CONFIGURADA',
      cocina: impresoraCocina ? impresoraCocina : 'NO CONFIGURADA',
      asados: impresoraAsados ? impresoraAsados : 'NO CONFIGURADA'
    });
    
    // Array de impresoras a utilizar
    const impresoras = ['bar', 'cocina', 'asados'];
    const resultados = {
      ...jobRecord,
      attempts: (jobRecord.attempts || 0) + 1
    };
    
    let alMenosUnaImpresion = false;
    let promesasImpresion = [];
    
    // Verificar qué impresoras tienen datos y preparar tickets
    for (const impresora of impresoras) {
      // Crear una promesa para cada impresora de forma independiente
      promesasImpresion.push(
        (async () => {
          try {
            // Primero verificamos si hay una impresora configurada para esta área
            let impresoraSeleccionada;
            
            switch (impresora) {
              case 'bar':
                impresoraSeleccionada = impresoraBar;
                break;
              case 'cocina':
                impresoraSeleccionada = impresoraCocina;
                break;
              case 'asados':
                impresoraSeleccionada = impresoraAsados;
                break;
              default:
                impresoraSeleccionada = null;
                break;
            }
            
            // Si no hay impresora configurada para esta área, registramos pero no imprimimos
            if (!impresoraSeleccionada) {
              debugLog(`No hay impresora configurada para ${impresora} - registrando sin imprimir`);
              
              // Registrar la orden como "procesada" sin imprimir
              try {
                const registroResponse = await btnordencocinainsertar(
                  id_venta,
                  'NO_IMPRESORA',  // Estado especial para indicar que no había impresora
                  impresora
                );
                debugLog(`Registro de orden sin imprimir para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                resultados[impresora] = true; // Marcamos como procesado pero no impreso
              } catch (registroError) {
                debugLog(`Error de base de datos durante registro de orden sin impresora para ${impresora}:`, registroError);
                resultados[impresora] = false;
              }
              
              return; // Salir de esta promesa y continuar con la siguiente área
            }
            
            debugLog(`Verificando datos - ID: ${id_venta}, impresora: ${impresora}`);
            
            // 1. Obtener los datos para esta impresora específica
            let response;
            try {
              response = await ventaimprimircocina({
                id_venta: id_venta,
                impresora: impresora
              });
              debugLog(`Respuesta API para ${impresora}: ${response?.status}`, 
                response?.data ? { dataLength: response.data?.data?.length || 0 } : 'Sin datos');
            } catch (apiError) {
              debugLog(`Error de base de datos o API para ${impresora}:`, apiError);
              
              // Registrar la orden como "procesada" con error de API
              try {
                const registroResponse = await btnordencocinainsertar(
                  id_venta,
                  'ERROR_API',  // Estado especial para indicar error de API
                  impresora
                );
                debugLog(`Registro de orden con error de API para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
              } catch (registroError) {
                debugLog(`Error de base de datos durante registro de orden con error de API para ${impresora}:`, registroError);
              }
              
              resultados[impresora] = false;
              return; // Salir de esta promesa
            }
            
            // Verificar si hay datos para imprimir
            if (!response?.data?.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
              debugLog(`No hay pedidos para ${impresora}, registrando como sin datos`);
              
              // Registrar la orden como "procesada" sin datos para imprimir
              try {
                const registroResponse = await btnordencocinainsertar(
                  id_venta,
                  'SIN_DATOS',  // Estado especial para indicar que no había datos para imprimir
                  impresora
                );
                debugLog(`Registro de orden sin datos para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
              } catch (registroError) {
                debugLog(`Error de base de datos durante registro de orden sin datos para ${impresora}:`, registroError);
              }
              
              resultados[impresora] = true; // No hay nada para imprimir (éxito)
              return; // Salir de esta promesa
            }
            
            const apiData = response.data.data;
            debugLog(`Datos recibidos de API para ${impresora}: ${apiData.length} elementos`, apiData[0]);
            alMenosUnaImpresion = true;
            
            // 2. Construir los datos para el ticket
            try {
              // Extraer información del primer elemento
              const firstItem = apiData[0] || {};
              const currentDate = new Date();
              
              // Transformar los datos
              const ticketData = {
                titulo: impresora.toUpperCase(),
                mesero: (firstItem.Nombre || 'ADMIN').toString(),
                mesa: (firstItem.mesa || '1').toString(),
                fecha: currentDate.toLocaleDateString(),
                hora: currentDate.toLocaleTimeString(),
                items: apiData.map(item => ({
                  cantidad: parseInt(item.Cant) || 1,
                  producto: (item.Descripcion || 'Sin descripción').toString()
                }))
              };
              
              debugLog(`TicketData para ${impresora}:`, ticketData);
              
              // 3. Seleccionar el componente Receipt y estado adecuado según la impresora
              let receiptComponent;
              
              switch (impresora) {
                case 'bar':
                  setBarInfo(ticketData);
                  receiptComponent = barReceiptRef;
                  break;
                case 'cocina':
                  setCocinaInfo(ticketData);
                  receiptComponent = cocinaReceiptRef;
                  break;
                case 'asados':
                  setAsadosInfo(ticketData);
                  receiptComponent = asadosReceiptRef;
                  break;
                default:
                  throw new Error(`Impresora desconocida: ${impresora}`);
              }
              
              // Log para depuración
              debugLog(`Usando impresora ${impresoraSeleccionada} para ${impresora}`);
              
              // 4. Esperar a que el estado se actualice antes de imprimir
              await new Promise(resolve => setTimeout(resolve, 1000)); // Aumentamos el tiempo de espera
              
              // 5. Verificar que receiptComponent existe
              if (!receiptComponent || !receiptComponent.current) {
                debugLog(`No se pudo acceder al componente Receipt para ${impresora}`);
                
                // Registrar la orden como "procesada" con error de componente
                try {
                  const registroResponse = await btnordencocinainsertar(
                    id_venta,
                    'ERROR_COMPONENTE',  // Estado especial para indicar error de componente
                    impresora
                  );
                  debugLog(`Registro de orden con error de componente para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                } catch (registroError) {
                  debugLog(`Error de base de datos durante registro de orden con error de componente para ${impresora}:`, registroError);
                }
                
                resultados[impresora] = false;
                return; // Salir de esta promesa
              }
              
              // 6. Imprimir
              debugLog(`Enviando a impresora: ${impresoraSeleccionada} - sección: ${impresora}`);
              let success = false;
              
              try {
                // Verificar si el método printTicket existe
                if (typeof receiptComponent.current.printTicket !== 'function') {
                  debugLog(`El método printTicket no existe en el componente de ${impresora}`);
                  // Intentar buscar otros métodos disponibles
                  const methods = Object.getOwnPropertyNames(receiptComponent.current);
                  debugLog(`Métodos disponibles en el componente:`, methods);
                  resultados[impresora] = false;
                  
                  // Registrar la orden con error de método
                  try {
                    const registroResponse = await btnordencocinainsertar(
                      id_venta,
                      'ERROR_METODO',
                      impresora
                    );
                    debugLog(`Registro de orden con error de método para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                  } catch (registroError) {
                    debugLog(`Error de base de datos durante registro de orden con error de método para ${impresora}:`, registroError);
                  }
                  
                  return;
                }
                
                success = await receiptComponent.current.printTicket(impresoraSeleccionada);
                debugLog(`Resultado directo de printTicket para ${impresora}: ${success}`);
                
                // Si la impresión falla, registrar el error pero seguir con el proceso
                if (!success) {
                  debugLog(`Impresión fallida para ${impresora}, registrando como ERROR_IMPRESION`);
                  try {
                    const registroResponse = await btnordencocinainsertar(
                      id_venta,
                      'ERROR_IMPRESION',
                      impresora
                    );
                    debugLog(`Registro de orden con error de impresión para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                  } catch (registroError) {
                    debugLog(`Error de base de datos durante registro de orden con error de impresión para ${impresora}:`, registroError);
                  }
                }
              } catch (printError) {
                debugLog(`Error de hardware de impresión para ${impresora}:`, printError);
                
                // Registrar la orden como "procesada" con error de hardware
                try {
                  const registroResponse = await btnordencocinainsertar(
                    id_venta,
                    'ERROR_HARDWARE',  // Estado especial para indicar error de hardware
                    impresora
                  );
                  debugLog(`Registro de orden con error de hardware para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                } catch (registroError) {
                  debugLog(`Error de base de datos durante registro de orden con error de hardware para ${impresora}:`, registroError);
                }
                
                resultados[impresora] = false;
                return; // Salir de esta promesa
              }
              
              debugLog(`Resultado de impresión ${impresora}: ${success ? "EXITOSO" : "FALLIDO"}`);
              resultados[impresora] = success;
              
              // 7. Si la impresión fue exitosa, registrar la orden en el sistema
              if (success) {
                debugLog(`Registrando orden impresa para ${impresora} con ID: ${id_venta}`);
                try {
                  const registroResponse = await btnordencocinainsertar(
                    id_venta,
                    'IMPRESO',
                    impresora
                  );
                  debugLog(`Resultado de registro de orden ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
                } catch (registroError) {
                  debugLog(`Error de base de datos durante registro de orden para ${impresora}:`, registroError);
                }
              }
              
            } catch (dataError) {
              debugLog(`Error procesando datos para ${impresora}:`, dataError);
              
              // Registrar la orden como "procesada" con error de datos
              try {
                const registroResponse = await btnordencocinainsertar(
                  id_venta,
                  'ERROR_DATOS',  // Estado especial para indicar error en el procesamiento de datos
                  impresora
                );
                debugLog(`Registro de orden con error de datos para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
              } catch (registroError) {
                debugLog(`Error de base de datos durante registro de orden con error de datos para ${impresora}:`, registroError);
              }
              
              resultados[impresora] = false;
            }
          } catch (error) {
            debugLog(`Error general en probarImpresora para ${impresora}:`, error);
            
            // Registrar la orden como "procesada" con error general
            try {
              const registroResponse = await btnordencocinainsertar(
                id_venta,
                'ERROR_GENERAL',  // Estado especial para indicar error general
                impresora
              );
              debugLog(`Registro de orden con error general para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
            } catch (registroError) {
              debugLog(`Error de base de datos durante registro de orden con error general para ${impresora}:`, registroError);
            }
            
            resultados[impresora] = false;
          }
        })()
      );
    }
    
    // Esperar a que todas las impresiones se completen
    await Promise.all(promesasImpresion);
    
    if (!alMenosUnaImpresion) {
      debugLog(`No se encontraron pedidos para imprimir para ID: ${id_venta}. Marcando como éxito.`);
      
      // Registrar todas las áreas como "SIN_PEDIDOS"
      try {
        for (const area of impresoras) {
          await btnordencocinainsertar(
            id_venta,
            'SIN_PEDIDOS',
            area
          );
          debugLog(`Registro de orden sin pedidos para ${area}: EXITOSO`);
        }
      } catch (error) {
        debugLog(`Error registrando orden sin pedidos: ${error}`);
      }
      
      return { 
        success: true, 
        nothingToPrint: true,
        results: resultados
      };
    }
    
    // Verificar si al menos una impresión fue exitosa
    const alMenosUnaExitosa = Object.values(resultados).some(result => result === true);
    debugLog(`Resultado de todas las impresiones: ${alMenosUnaExitosa ? "AL MENOS UNA EXITOSA" : "TODAS FALLIDAS"}`, resultados);
    debugLog(`=== TRABAJO DE IMPRESIÓN COMPLETADO PARA ID: ${id_venta} ===`);
    
    // Registrar cualquier área que no haya sido procesada aún
    for (const impresora of impresoras) {
      if (resultados[impresora] === undefined) {
        debugLog(`Área ${impresora} no procesada, registrando como NO_PROCESADA`);
        try {
          const registroResponse = await btnordencocinainsertar(
            id_venta,
            'NO_PROCESADA',
            impresora
          );
          debugLog(`Registro de orden no procesada para ${impresora}: ${registroResponse ? "EXITOSO" : "FALLIDO"}`);
        } catch (error) {
          debugLog(`Error registrando orden no procesada para ${impresora}: ${error}`);
        }
      }
    }
    
    return { 
      success: alMenosUnaExitosa, 
      nothingToPrint: false,
      results: resultados
    };
  };

  // Función mejorada para manejar errores de impresora y registrar en la base de datos
  const btnordencocinainsertar = async(id_venta, estado, tipo) => {
    try {
      if (!authData || !authData[1]) {
        debugLog(`No hay datos de autenticación o ID de empresa disponible para ${tipo}, estado ${estado}`);
        return null;
      }
      
      const data = {
        id_venta: id_venta,
        Estado: estado,
        tipo: tipo,
        id_empresa: authData[1]
      };
      
      debugLog(`Enviando registro a BD: ID ${id_venta}, Área ${tipo}, Estado ${estado}`);
      const response = await ordencocinainsertar(data);
      debugLog(`Respuesta de BD para registro ID ${id_venta}, Área ${tipo}: ${response ? "OK" : "ERROR"}`);
      
      return response;
    } catch (error) {
      debugLog(`Error en btnordencocinainsertar para ID ${id_venta}, Área ${tipo}, Estado ${estado}:`, error);
      
      // Reintentar el registro una vez en caso de error
      try {
        debugLog(`Reintentando registro para ID ${id_venta}, Área ${tipo}, Estado ${estado}`);
        const data = {
          id_venta: id_venta,
          Estado: `${estado}_REINTENTO`,
          tipo: tipo,
          id_empresa: authData[1]
        };
        
        const response = await ordencocinainsertar(data);
        debugLog(`Respuesta de BD en reintento: ${response ? "OK" : "ERROR"}`);
        return response;
      } catch (retryError) {
        debugLog(`Error en reintento de registro para ID ${id_venta}, Área ${tipo}:`, retryError);
        return null;
      }
    }
  };

  const ImprimirpedidosBahia = async(id_venta) => {
    try {
      const response = await ventaimprimirbahia({id_venta: id_venta});
      return response?.data?.data?.length > 0;
    } catch (error) {
      debugLog("Error en ImprimirpedidosBahia:", error);
      return false;
    }
  };
  
  // Efecto para guardar la vista actual cuando cambia
  useEffect(() => {
    if (currentView) {
      // Guardar la vista anterior antes de actualizar
      prevViewRef.current = localStorage.getItem('currentView');
      
      // Guardar la vista actual
      localStorage.setItem('currentView', currentView);
      
      // Si cambiamos a puntoventa, ocultamos el navbar
      if (currentView === 'puntoventa') {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }
      
      // Si estamos cambiando DE puntoventa A Cafetería, forzar actualización
      if (prevViewRef.current === 'puntoventa' && currentView === 'Cafetería') {
        // Incrementar key para forzar re-renderizado completo
        setMesasKey(prev => prev + 1);
        // Limpiar caché global si está disponible en window
        if (window.tablesBySalonCache) {
          window.tablesBySalonCache = {};
        }
      }
    }
  }, [currentView]);
  
  // Quitamos el efecto que redirigía a la vista principal cuando no hay movimientos
  // Este efecto estaba causando que el componente volviera a la vista principal
  // cuando se intentaba navegar a cerrarCaja sin datos completos
  
  // Agregamos un efecto para verificar y debug la navegación a cerrarCaja
  useEffect(() => {
    if (currentView === 'cerrarCaja') {
      console.log('NAVEGACIÓN DETECTADA: Vista actual es cerrarCaja');
      console.log('Estado de movimientos:', movimientos);
      
      // Si no hay datos de movimientos, intentar cargarlos
      if (!movimientos && fetchMovimientos && typeof fetchMovimientos === 'function') {
        console.log('Intentando cargar datos de movimientos automáticamente...');
        fetchMovimientos()
          .then(() => console.log('Carga automática de movimientos exitosa'))
          .catch(err => console.error('Error en carga automática:', err));
      }
    }
  }, [currentView, movimientos]);
  
  // Efecto para manejar la navegación por pasos
  useEffect(() => {
    // Si estamos en el paso "mesa-seleccionada" y la vista actual es "Cafetería",
    // entonces después de mostrar las mesas, navegamos al punto de venta
    if (navigationStep === 'mesa-seleccionada' && currentView === 'Cafetería' && tableId) {
      // Damos un pequeño retraso para asegurar que la UI se actualice primero
      const timer = setTimeout(() => {
        setCurrentView('puntoventa');
        // Reiniciamos el paso de navegación
        setNavigationStep('inicial');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [navigationStep, currentView, tableId]);
  
  // Manejador específico para el botón PRINCIPAL
  const handlePrincipalClick = () => {
    // Forzar la actualización de datos si venimos de puntoventa
    if (currentView === 'puntoventa') {
      // Incrementar key para forzar re-renderizado completo
      setMesasKey(prev => prev + 1);
      // Limpiar caché global si está disponible en window
      if (window.tablesBySalonCache) {
        window.tablesBySalonCache = {};
      }
    }
    
    // Siempre navegar a la vista de mesas (Cafetería)
    setCurrentView('Cafetería');
    // Reiniciar el paso de navegación
    setNavigationStep('inicial');
    // Mostrar el navbar
    setNavbarVisible(true);
  };

  // Función mejorada para cambiar la vista actual - SOLUCIÓN AL PROBLEMA DE CERRAR CAJA
  const handleViewChange = (newView, step) => {
    // Caso especial para el botón PRINCIPAL
    if (newView === 'principal') {
      handlePrincipalClick();
      return;
    }
    
    // Mostrar información de depuración para rastrear la navegación
    console.log(`Cambiando vista a: ${newView} (vista actual: ${currentView})`);
    
    // Forzar la actualización de vista inmediatamente
    if (step) {
      setNavigationStep(step);
    }
    
    // IMPORTANTE: Forzar el cambio de vista con setTimeout para asegurar que se procese
    // fuera del ciclo de eventos actual
    setTimeout(() => {
      setCurrentView(newView);
      console.log(`Vista actualizada a: ${newView}`);
      
      // Notificar al usuario si la navegación fue exitosa
      if (newView === 'cerrarCaja') {
        // Asegurarse de que los datos se cargan
        if (fetchMovimientos && typeof fetchMovimientos === 'function') {
          console.log('Cargando datos de movimientos para cerrarCaja...');
          fetchMovimientos()
            .then(() => console.log('Datos de movimientos cargados correctamente'))
            .catch(err => console.error('Error al cargar movimientos:', err));
        }
      }
    }, 0);
  };

  const renderComponent = () => {
    // Imprimir la vista actual para debugging
    console.log(`Renderizando componente para vista: "${currentView}"`);
    
    // Determinar qué componente mostrar según la vista actual
    switch (currentView) {
      case 'cerrarCaja':
        console.log('Renderizando componente CerrarCajaPrincipal');
        // Usar un key único para forzar re-renderizado completo
        return <Cerrarcajaprincipal key="cerrar-caja-component" />;
        
      case 'Cafetería':
        // Pasar la key para forzar re-renderizado completo cuando sea necesario
        return <Panelprincipalmesa 
                 key={`mesas-${mesasKey}`} 
                 data={authData} 
                 onViewChange={handleViewChange}
                 forceRefresh={currentView === 'Cafetería' && prevViewRef.current === 'puntoventa'} 
               />;
                
      case 'puntoventa':
        return <ColumnasColoreadas onPrincipalClick={handlePrincipalClick} />;
        
      case 'productos':
        return <Productoconfiguracionprincipal />;
        
      case 'egreso':
        return <Egresoyingresoprincipal/>;
        
      case 'impresora':
        return <ImpresoraPrincipal/>;
        
      case 'clientes':
        return <ClientSupplierInterface/>;
        
      case 'ajustes':
        return <Panelprincipalconfiguraciones/>;
        
      default:
        console.log(`Vista predeterminada (${currentView} no reconocida)`);
        return <Panelprincipalmesa 
                 key={`mesas-${mesasKey}`} 
                 data={authData} 
                 onViewChange={handleViewChange} 
               />;
    }
  };
  
  // Asegurarnos de que el botón de cerrarCaja siempre esté habilitado
  const isCerrarCajaDisabled = false; 
  
  // Debugging adicional para la interfaz de usuario
  useEffect(() => {
    console.log(`Estado actual de la aplicación: 
      - Vista actual: ${currentView}
      - Paso de navegación: ${navigationStep}
      - ¿Navbar visible?: ${navbarVisible}
      - ¿Datos de movimientos disponibles?: ${movimientos ? 'Sí' : 'No'}
    `);
  }, [currentView, navigationStep, navbarVisible, movimientos]);
  
  return (
    <Layout>
      {navbarVisible && (
        <NavbarWrapper>
          <Navbar 
            onViewChange={handleViewChange} 
            data={authData} 
            onPrincipalClick={handlePrincipalClick}
            isCerrarCajaDisabled={isCerrarCajaDisabled}
          />
        </NavbarWrapper>
      )}
      <Main>
        <ContentWrapper>
          {renderComponent()}
        </ContentWrapper>
      </Main>
      <HiddenContainer>
        {/* Componentes Receipt independientes para cada impresora */}
        <Receipt 
          ref={barReceiptRef} 
          printerName={impresoraBar || DEFAULT_PRINTER} // Usar DEFAULT_PRINTER solo para la referencia, no para imprimir
          initialData={barInfo}
        />
        <Receipt 
          ref={cocinaReceiptRef} 
          printerName={impresoraCocina || DEFAULT_PRINTER}
          initialData={cocinaInfo}
        />
        <Receipt 
          ref={asadosReceiptRef} 
          printerName={impresoraAsados || DEFAULT_PRINTER}
          initialData={asadosInfo}
        />
      </HiddenContainer>
    </Layout>
  );
};

export default Homepanel;