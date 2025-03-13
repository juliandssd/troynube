import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import CuadreDeCaja from './CerrarcajaHedear/CuadreDeCaja';
import FinancialDashboard from './CerrarCajaDetallado/FinancialDashboard';
import CheeseSalesDashboard from './CerrarCajaDetalleproducto/CheeseSalesDashboard';
import { useAuthStore, useMovimientosStore } from '../authStore';
import { cajagastoingreso, controldecobrosmostrar, domiciliomostrar, movimientomostrarcerrarcaja } from '../../Api/TaskCajaYmovimiento';

// Estilos globales para garantizar que el contenedor pueda ocupar toda la altura y ancho
const GlobalStyle = styled.div`
  height: 100vh; /* Usa toda la altura visible del viewport */
  width: 100vw; /* Usa todo el ancho visible del viewport */
  font-family: Arial, sans-serif;
  overflow: hidden; /* Evita barras de desplazamiento en el contenedor global */
  background-color: #f9f9f9;
`;

// Contenedor (columna) con scroll y alineado a la izquierda
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0; /* Quita el margin auto para que no esté centrado */
  overflow-y: auto; /* Scroll vertical para todo el contenido */
  align-items: flex-start; /* Alinea el contenido a la izquierda */

  /* Personalización del scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

// Título principal
const MainTitle = styled.h1`
  width: 100%;
  color: #333;
  text-align: center;
  font-weight: 500;
  padding: 15px 0;
  margin: 0;
  border-bottom: 1px solid #eaeaea;
  background-color: white;
`;

// Filas con diferentes secciones de contenido
const Row1 = styled.div`
  min-height: 160px;
  background-color: white;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: 20px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding-left: 10px;
    min-height: 60px;
  }
`;

// Fila 2 con las tres columnas financieras
const Row2 = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start; /* Alinea el contenido a la izquierda */
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid #eaeaea;
`;

// Fila 3 con el dashboard de ventas
const Row3 = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  background-color: white;
  padding: 0; /* Quita el padding para que CheeseSalesDashboard use su propio padding */
`;

// Contenedor para el FinancialDashboard
const DashboardWrapper = styled.div`
  width: 100%;
`;

// Contenedor para el CheeseSalesDashboard
const SalesDashboardWrapper = styled.div`
  width: 100%;
  background-color: white;
`;

// Componente de carga
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  font-size: 18px;
  color: #6366F1;
`;

// Componente de error
const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  font-size: 16px;
  color: #ef4444;
  background-color: #fee2e2;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 20px;
`;

const Cerrarcajaprincipal = React.memo(() => {
    const authData = useAuthStore((state) => state.authData);
    const { fetchMovimientos, setupPusher, movimientos } = useMovimientosStore();
    const [dinero, setDinero] = useState([]);
    const [egresoingreso, setEgresoingreso] = useState([]);
    const [controlcobros, setControlcobros] = useState([]);
    const [domicilio, setDomicilio] = useState([]);
    const [data, setData] = useState({
      Nombre: '',
      fechainicio: '',
      fechafin: '',
      Efectivoinicial: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoizar el movimiento.data para evitar bucles infinitos
    const movimientoData = useMemo(() => movimientos?.data, [movimientos]);

    // Memoizar funciones para fetch de datos
    const fetchIngresoEgreso = useCallback(async() => {
      if (!movimientoData) return;
      
      try {
        const response = await cajagastoingreso({id_movi: movimientoData});
        if (response.data && response.data.data) {
          setEgresoingreso(response.data.data);
        }
      } catch (error) {
        console.error('Error al cargar ingreso/egreso:', error);
      }
    }, [movimientoData]);

    const fetchControlCobros = useCallback(async() => {
      if (!movimientoData) return;
      
      try {
        const response = await controldecobrosmostrar({id_movi: movimientoData});
        if (response.data && response.data.data) {
          setControlcobros(response.data.data);
        }
      } catch (error) {
        console.error('Error al cargar control de cobros:', error);
      }
    }, [movimientoData]);

    const fetchCobroDomicilio = useCallback(async() => {
      if (!movimientoData) return;
      
      try {
        const response = await domiciliomostrar({id_movi: movimientoData});
        if (response.data && response.data.data) {
          setDomicilio(response.data.data);
        }
      } catch (error) {
        console.error('Error al cargar datos de domicilio:', error);
      }
    }, [movimientoData]);

    // Efecto para cargar los movimientos iniciales
    useEffect(() => {
      if (!authData || !authData[0]) return;
      
      fetchMovimientos(authData[0]);
      const cleanupPusher = setupPusher(authData[0]);
      
      return () => {
        if (cleanupPusher && typeof cleanupPusher === 'function') {
          cleanupPusher();
        }
      };
    }, [authData, fetchMovimientos, setupPusher]);

    // Efecto principal para cargar datos
    useEffect(() => {
      const fetchMainData = async () => {
        if (!movimientoData) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await movimientomostrarcerrarcaja({id_movi: movimientoData});
          if (response.data && response.data.data) {
            setDinero(response.data.venta || []);
            setData(response.data.data || {});
          } else {
            setError('No se recibieron datos válidos');
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          setError('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMainData();
      fetchIngresoEgreso();
      fetchControlCobros();
      fetchCobroDomicilio();
    }, [movimientoData, fetchIngresoEgreso, fetchControlCobros, fetchCobroDomicilio]);

    return (
      <GlobalStyle>
        <Container>
          <Row1>
            {isLoading ? (
              <LoadingIndicator>Cargando datos...</LoadingIndicator>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <CuadreDeCaja data={data} />
            )}
          </Row1>
          
          <Row2>
            <DashboardWrapper>
              <FinancialDashboard 
                data={data} 
                dinero={dinero} 
                domicilio={domicilio}
                egresoingreso={egresoingreso} 
                controlcobros={controlcobros} 
              />
            </DashboardWrapper>
          </Row2>
          
          <Row3>
            <SalesDashboardWrapper>
              <CheeseSalesDashboard />
            </SalesDashboardWrapper>
          </Row3>
        </Container>
      </GlobalStyle>
    );
});

Cerrarcajaprincipal.displayName = 'Cerrarcajaprincipal';

export default Cerrarcajaprincipal;