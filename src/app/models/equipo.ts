import { EstadoEquipo } from "./enum/EstadoEquipo";
import { modeloEquipo } from "./modeloEquipo";
import { Unidad } from "./Unidad";


export class Equipo{
    id!:number;
    matricula!:string;
    observaciones!:string;
    cantidadUnidadMedida!:number;
    latitud!:number;
    logitud!:number;
    fechaUltimaPosicion!:Date;
    modeloEquipo!:modeloEquipo;
    estado!:EstadoEquipo;
    unidad!:Unidad;
    idModeloEquipo?:number;
    idUnidad!:number;
    activo:boolean = true;
    numeroMotor!:string;
}