import { Rol } from "./enum/Rol";
import { Grado } from "./grado";
import { Unidad } from "./Unidad";

    export class Usuario{
        id!:number;
        nombreCompleto!:string;
        password!:string;
        idGrado!:number;
        idUnidad!:number;
        telefono!:number;
        rol!:Rol;
        cedula!:string;
        grado:Grado = new Grado();
        unidad:Unidad = new Unidad();
        activo:boolean = true;
    }