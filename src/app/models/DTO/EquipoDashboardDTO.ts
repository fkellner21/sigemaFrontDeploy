import { EstadoEquipo } from "../enum/EstadoEquipo";
import { TareaEquipo } from "../enum/TareaEquipo";
import { UnidadMedida } from "../enum/UnidadMedida";

export class EquipoDashboardDTO{
    matricula?:string;
    unidad?:string;
    anio?:number;
    observaciones?:string;
    cantidadUnidadMedida?:number;
    unidadMedida?:UnidadMedida;
    capacidad?:number;
    marca?:string;
    tipoEquipo?:string;
    tareaEquipo?:TareaEquipo;
    latitud?:number;
    longitud?:number;
    fechaUltimaPosicion?:Date;
    estado?:EstadoEquipo;
}