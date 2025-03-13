
import axios  from "axios";
import {ip} from './Taskprincipal';
//"https://eventoslive.vercel.app";
export const salonmostrarporidempresa= async (data)=>
    await axios.post(`${ip}/api/salon/mostrar`,data);


export const mesamostrarporidsalon= async (data)=>
    await axios.post(`${ip}/api/mesa/mostrar/por/id/salon`,data);


export const mesaoEstadoocupado= async (data)=>
    await axios.post(`${ip}/api/mesa/estado/ocupado`,data);

export const mesaliberar= async (data)=>
    await axios.post(`${ip}/api/mesa/pendiente`,data);

export const mesaocuparsinmesero= async (data)=>
    await axios.post(`${ip}/api/mesa/ocupar/sin/mesero`,data);


export const saloninsertar= async (data)=>
    await axios.post(`${ip}/api/salon/insertar/`,data);

export const mesamostrarconfigurar= async (data)=>
    await axios.post(`${ip}/api/salon/mostrar/configurar`,data);

export const mesaconfigurar= async (data)=>
    await axios.post(`${ip}/api/mesa/configurar`,data);

export const saloneliminar= async (data)=>
    await axios.post(`${ip}/api/salon/eliminar`,data);

export const mesainsertardinamicamente= async (data)=>
    await axios.post(`${ip}/api/mesa/insertar/dinamicamente`,data);

export const salonactualizar= async (data)=>
    await axios.post(`${ip}/api/salon/actualizar`,data);
