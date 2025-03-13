
import axios  from "axios";
import {ip} from './Taskprincipal';


export const ticketmostrar= async (data)=>
    await axios.post(`${ip}/api/ticket/mostrar`,data);

export const ticketeditar= async (data)=>
    await axios.post(`${ip}/api/ticket/editar`,data);