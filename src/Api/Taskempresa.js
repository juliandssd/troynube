
import axios  from "axios";
import {ip} from './Taskprincipal';
export const empresainsertar= async (data)=>
    await axios.post(`${ip}/api/empresa/insertar`,data);

export const empresaporcentajepropina= async (data)=>
    await axios.post(`${ip}/api/empresa/mostrar/porcentaje`,data);