import axios  from "axios";
import {ip} from './Taskprincipal';

export const movimientoinsertar= async (data)=>
    await axios.post(`${ip}/api/movimiento/insertar`,data);


export const cajamostrarporidempresa= async (data)=>
    await axios.post(`${ip}/api/caja/mostrar/por/idempresa`,data);


export const movimientomostraridmoviporusuario= async (data)=>
    await axios.post(`${ip}/api/movimientocaja/mostrar/por/usuario`,data);

export const movimientomostrarcerrarcaja= async (data)=>
    await axios.post(`${ip}/api/movientocaja/mostrar/cierre`,data);


export const cajagastoingreso= async (data)=>
    await axios.post(`${ip}/api/cajaegreso/ingreso`,data);


export const controldecobrosmostrar= async (data)=>
    await axios.post(`${ip}/api/controlcobros/mostrar`,data);

export const domiciliomostrar= async (data)=>
    await axios.post(`${ip}/api/domicilio/mostrar`,data);

export const movimientocerrar= async (data)=>
    await axios.post(`${ip}/api/movimientocaja/cerrar/turno`,data);