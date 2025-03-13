import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { agregarCeros } from '../../agregarCeros';
import { serializacionmostrar } from '../../../Api/TaskSerializacion';
import { useAuthStore, useidmesa, useMovimientosStore } from '../../authStore';
import { ventaconfirmar } from '../../../Api/TaskventaYdetalle';
import { movimientomostraridmoviporusuario } from '../../../Api/TaskCajaYmovimiento';

// Contenedor principal que ocupa toda la altura y ancho disponible
const PageWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: transparent; // Cambio para adaptarse mejor al modal
  position: relative;
`;

// Franja oscura a la derecha
const DarkStrip = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 20%;
  height: 100%;
  z-index: 1;
`;

// Contenedor del contenido principal, centrado horizontalmente
const ContentArea = styled.div`
  display: flex;
  width: 80%; // Ocupa el espacio disponible sin la franja
  height: 100%;
  position: relative;
  z-index: 2;
`;

// Contenedor de los botones
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 85%; // Ajustado para que se vea mejor dentro del modal
  max-width: 280px;
  padding: 24px;
  border-radius: 24px 0 0 24px;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.07);
`;

const EnterLabel = styled.div`
  color: #64748b;
  text-align: center;
  width: 100%;
  margin-bottom: 40px;
  font-weight: 400;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  padding-right: 20px;
`;

// Mensaje de error para caja no habilitada
const ErrorMessage = styled.div`
  color: #ef4444;
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
  font-weight: 600;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  background-color: #fee2e2;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #fca5a5;
`;

const StyledButton = styled.button`
  background-color: ${props => props.disabled ? '#f1f5f9' : 'white'};
  border-radius: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  box-shadow: ${props => props.disabled ? 'none' : '0 8px 16px rgba(0, 0, 0, 0.06)'};
  width: 100%;
  margin-bottom: 20px;
  border: ${props => props.disabled ? '1px solid #e2e8f0' : 'none'};
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 10px 20px rgba(0, 0, 0, 0.08)'};
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 100%;
    background-color: ${props => {
      if (props.disabled) return '#cbd5e1';
      return props.color === 'green' ? '#84cc16' : '#ff49b8';
    }};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  width: 100%;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  margin-left: 10px;
`;

const IconInner = styled.div`
  width: 28px;
  height: 28px;
  background-color: ${props => {
    if (props.disabled) return '#cbd5e1';
    return props.color === 'green' ? '#84cc16' : '#ff49b8';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const IconCore = styled.div`
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 4px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ButtonTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: ${props => props.disabled ? '#94a3b8' : '#1e293b'};
  font-family: 'Arial', sans-serif;
  text-align: left;
  line-height: 1.2;
`;

const ButtonSubtitle = styled.span`
  font-weight: 600;
  font-size: 20px;
  color: ${props => props.disabled ? '#94a3b8' : '#1e293b'};
  font-family: 'Arial', sans-serif;
  text-align: left;
  margin-bottom: 4px;
`;

const SubText = styled.span`
  font-size: 12px;
  color: ${props => props.disabled ? '#94a3b8' : '#64748b'};
  font-family: 'Arial', sans-serif;
  text-align: left;
`;

// Componente del botón
const ElectronicaButton = ({ color = 'pink', onClick, disabled }) => {
  return (
    <StyledButton color={color} onClick={onClick} disabled={disabled}>
      <ButtonContent>
        <IconContainer>
          <IconInner color={color} disabled={disabled}>
            <IconCore />
          </IconInner>
        </IconContainer>
        <TextContainer>
          <ButtonSubtitle disabled={disabled}>Cobrar </ButtonSubtitle>
          <SubText disabled={disabled}>
            {disabled ? 'No disponible: abra caja primero' : 'Toque para continuar'}
          </SubText>
        </TextContainer>
      </ButtonContent>
    </StyledButton>
  );
};

// Componente de demostración
const ElectronicaButtonDemo = ({ paymentInfo = {}, consecutivoweb, onPrincipalClick }) => {
  const authData = useAuthStore((state) => state.authData);
  const empresaId = useMemo(() => authData[1], [authData]);
  const { tableId } = useidmesa();
  const clientIdRef = useRef(window.clientInstanceId);
  const { fetchMovimientos, setupPusher, movimientos } = useMovimientosStore();
  const [Cero,setCero]=useState(null);
  const [cajaDisponible, setCajaDisponible] = useState(false);
  
  useEffect(()=>{
    const Fetdata=async()=>{
      try {
        const response =await serializacionmostrar({serie:'F',id_empresa:empresaId})
        const consecutivo=response.data.data.Numerofin;
        const CantidadCero=response.data.data.Cantidad;
        setCero(agregarCeros(consecutivo.toString(), CantidadCero));
      } catch (error) {
      }
    }
    Fetdata();
  },[authData[1]])

  useEffect(() => {
    // Cargar movimientos iniciales
    fetchMovimientos(authData[0]);
    
    // Configurar Pusher para actualizaciones en tiempo real
    const cleanupPusher = setupPusher(authData[0]);
    
    // Limpieza cuando el componente se desmonte
    return () => {
      cleanupPusher();
    };
  }, [authData[0], fetchMovimientos, setupPusher]);
  
  // Verificar si hay caja disponible cuando cambian los movimientos
  useEffect(() => {
    // Verificamos si movimientos tiene datos válidos
    const hayMovimientos = movimientos && movimientos.data;
    setCajaDisponible(!!hayMovimientos);
    console.log("Estado de caja:", hayMovimientos ? "Habilitada" : "No habilitada");
  }, [movimientos]);
  
  // Función para manejar el clic en el botón
  const aperturarventa=async(data)=>{
    try {
      const response=await ventaconfirmar(data);
      if (response.data.data>0) {
        if (onPrincipalClick) {
          // Pequeño retraso para asegurar que la respuesta se procese correctamente
          setTimeout(() => {
            onPrincipalClick();
          }, 100);
        }
      }
    } catch (error) {
      
    }
  }

  const Cobrar=async()=>{
    // Si no hay caja disponible, mostramos una alerta y cancelamos la operación
    if (!cajaDisponible) {
      alert('No puede cobrar sin abrir una caja primero');
      return;
    }
    
    try {
      let { 
        efectivo, 
        datafono, 
        credito, 
        cambio, 
        restante, 
        tipoPago, 
        referenciaTarjeta,
        propina,
        totalAPagar,
        id_venta,
        id_cliente,
        nombre_cliente
      } = paymentInfo;
      // Verificar si efectivo, datafono o credito están vacíos y asignarles 0
      efectivo = efectivo || 0;
      datafono = datafono || 0;
      credito = credito || 0;
      credito = credito || 0;
      propina=propina ||0;
      cambio=cambio ||0;
      // Eliminar puntos decimales y convertir a entero
      efectivo = parseInt(efectivo.toString().replace(".", ""));
      datafono = parseInt(datafono.toString().replace(".", ""));
      credito = parseInt(credito.toString().replace(".", ""));
      propina = parseInt(propina.toString().replace(".", ""));
      cambio = parseInt(cambio.toString().replace(".", ""));
      const data={
        id_venta:id_venta,
        id_cliente:id_cliente,
        numerocDoc:Cero,
        MontoTotal:totalAPagar,
        Tipo_de_pago:tipoPago,
        Iva:0,
        Saldo:cambio,
        Pago:efectivo,
        PorcentajeIva:0,
        Vuelto:cambio,
        Efectivo:efectivo,
        Tarjeta:datafono,
        propina:propina,
        id_movi:movimientos.data,
        empleado:"-",
        cuentaCredito:credito,
        referenciaTarjeta:referenciaTarjeta,
        comprobante:"Factura pos",
        fecha:new Date().toISOString().slice(0, 19).replace('T', ' '),
        id_mesa:tableId,
        id_navegador:clientIdRef.current,
        id_empresa:empresaId,
        consecutivoweb:consecutivoweb
      }
      if (restante==="0") {
        if (credito>0) {
          if (nombre_cliente==="GENERICO") {
            alert('SELECCIONE UN CLIENTES');
          }else{
            await aperturarventa(data);
          }
        }else{
         await aperturarventa(data);
        }
      }else{
        alert('Error de pago');
      }

    } catch (error) {
      
    }
  }

  return (
    <PageWrapper>
      <DarkStrip />
      <ContentArea>
        <Container>
          <EnterLabel>(ENTER)</EnterLabel>
          
          {!cajaDisponible && (
            <ErrorMessage>
              Debe abrir una caja antes de realizar cobros
            </ErrorMessage>
          )}
          
          <ElectronicaButton 
            color="pink" 
            onClick={() => Cobrar()}
            disabled={!cajaDisponible}
          />
          
          <ElectronicaButton 
            color="green" 
            onClick={() => Cobrar()}
            disabled={!cajaDisponible}
          />
        </Container>
      </ContentArea>
    </PageWrapper>
  );
};

export default ElectronicaButtonDemo;