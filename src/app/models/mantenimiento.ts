import { UnidadMedida } from "./enum/UnidadMedida";
import { RepuestoMantenimiento } from "./RepuestoMantenimiento";

export class Mantenimiento{
    id?: number;
    fechaRegistro?: Date;
    fechaMantenimiento?: Date;
    descripcion?: string;
    idEquipo?: number;
    unidadMedida?: UnidadMedida;
    cantidadUnidadMedida?: number;
    esService?: boolean;
    repuestosMantenimiento?: RepuestoMantenimiento[];
}