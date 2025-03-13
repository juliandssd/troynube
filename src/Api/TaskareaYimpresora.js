
import axios  from "axios";
import {ip} from './Taskprincipal';


export const areamostrarporidempresa= async (data)=>
    await axios.post(`${ip}/api/area/mostrar/por/idempresa`,data);

export const impresorainsertar= async (data)=>
    await axios.post(`${ip}/impresora/insertar`,data);

export const impresoramostrar= async (data)=>
    await axios.post(`${ip}/api/impresora/mostrar`,data);

export const impresoramostrarseleccionada= async (data)=>
    await axios.post(`${ip}/api/impresora/seleccionada/mostrar`,data);
