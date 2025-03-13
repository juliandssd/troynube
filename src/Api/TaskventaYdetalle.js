
import axios  from "axios";
import {ip} from './Taskprincipal';


export const ventainsertar= async (data)=>
    await axios.post(`${ip}/api/venta/insertar`,data);

export const detallemostrar= async (data)=>
    await axios.post(`${ip}/api/detalle/mostrar`,data);

export const ventaenviar= async (data)=>
    await axios.post(`${ip}/api/venta/enviar`,data);

export const ventaimprimirbahia= async (data)=>
    await axios.post(`${ip}/api/venta/imprimir/bahia`,data);

export const ventaimprimircocina= async (data)=>
    await axios.post(`${ip}/api/venta/imprimir/cocina`,data);

export const ordencocinainsertar= async (data)=>
    await axios.post(`${ip}/api/ordencocina/insertar`,data);

export const detalletotalapagar= async (data)=>
    await axios.post(`${ip}/api/detalle/mostrar/total/apagar`,data);

export const detalleeliminar= async (data)=>
    await axios.post(`${ip}/api/detalle/eliminar`,data);

export const detalleeditarnota= async (data)=>
    await axios.post(`${ip}/api/detalle/editar/nota`,data);

export const detalleeditarcantidad= async (data)=>
    await axios.post(`${ip}/api/detalle/editar/cantidad`,data);

export const ventaconfirmar= async (data)=>
    await axios.post(`${ip}/api/venta/confirmar`,data);

export const ventagastomostrarmaximo= async (data)=>
    await axios.post(`${ip}/api/venta/mostrar/idmovi`,data);

export const ventagastoinsertar= async (data)=>
    await axios.post(`${ip}/api/venta/gasto/insertar`,data);

export const gastomostraporidmovi= async (data)=>
    await axios.post(`${ip}/api/gasto/mostrar/por/idmovi`,data);

export const gastoeliminar= async (data)=>
    await axios.post(`${ip}/api/gasto/eliminar`,data);

export const ventagastoconfirmar= async (data)=>
    await axios.post(`${ip}/api/venta/gasto/confirmar`,data);
