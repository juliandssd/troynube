
import axios  from "axios";
import {ip} from './Taskprincipal';


export const usuariovalidarpassword= async (data)=>
    await axios.post(`${ip}/api/usuario/validar/pass`,data);

export const usuariomostrarporidempresa= async (data)=>
    await axios.post(`${ip}/api/usuario/mostrar/por/idempresa`,data);


export const usuarioinsertar= async (data)=>
    await axios.post(`${ip}/api/usuario/insertar/`,data);


export const usuarioeliminar= async (data)=>
    await axios.post(`${ip}/api/usuario/eliminar`,data);