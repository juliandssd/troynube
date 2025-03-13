
import axios  from "axios";
import {ip} from './Taskprincipal';

export const grupomostrarventa= async (data)=>
    await axios.post(`${ip}/api/grupo/mostrar/venta`,data);

export const productomostrarporcategoria= async (data)=>
    await axios.post(`${ip}/api/producto/mostrar/por/categoria`,data);

export const grupomostraraconfigurar= async (data)=>
    await axios.post(`${ip}/api/grupo/mostrar/a/configurar`,data);

export const grupoeliminar= async (data)=>
    await axios.post(`${ip}/api/grupo/eliminar`,data);

export const grupoproductoinsertar= async (data)=>
    await axios.post(`${ip}/api/grupo/producto/insertar`,data);

export const productomostrarcodigo= async (data)=>
    await axios.post(`${ip}/api/producto/por/codigo`,data);

export const productoinsertar= async (data)=>
    await axios.post(`${ip}/api/producto/insertar`,data);

export const productomostrarporidgrupo= async (data)=>
    await axios.post(`${ip}/api/producto/mostrar/por/idgrupo`,data);

export const productoeliminar= async (data)=>
    await axios.post(`${ip}/api/producto/eliminar`,data);

export const grupoeditar= async (data)=>
    await axios.post(`${ip}/api/grupoediter`,data);

export const productobuscar= async (data)=>
    await axios.post(`${ip}/api/producto/buscar`,data);