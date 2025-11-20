import { TipoRepuesto } from "./enum/TipoRepuesto";
import { modeloEquipo } from "./modeloEquipo";

export class Repuesto{
    id!:number;
    modelo!:modeloEquipo;
    tipo!:TipoRepuesto;
    nombre!:string;
    caracteristicas!:string;
    cantidad!:number;
    observaciones!:string;
    codigoSICE!:string;
    idModelo!: number;
}