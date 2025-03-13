
import axios  from "axios";
import {ip} from './Taskprincipal';


export const serializacionmostrar= async (data)=>
    await axios.post(`${ip}/api/serializacion/mostrar`,data);