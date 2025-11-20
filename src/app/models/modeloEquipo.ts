import { DocumentoModeloEquipo } from "./DocumentoModeloEquipo";
import { UnidadMedida } from "./enum/UnidadMedida";
import { Equipo } from "./equipo";
import { Marca } from "./marca";
import { Repuesto } from "./Repuesto";
import { ServiceModelo } from "./serviceModelo";
import { TipoEquipo } from "./tipoEquipo";

    export class modeloEquipo{
        id!:number;
        anio!:number;
        modelo!:string;
        capacidad!:number;
        marca!:Marca;
        tipoEquipo!:TipoEquipo;
        equipos!:Array<Equipo>;
        repuestos!:Array<Repuesto>;
        unidadMedida!:UnidadMedida;
        documentos!:Array<DocumentoModeloEquipo>;
        frecuenciaUnidadMedida!: number;
        frecuenciaTiempo!: number;
        idServiceModelo!:number;
        serviceModelo!:ServiceModelo;
    }