import { UnidadMedida } from '../enum/UnidadMedida';
import { RepuestoMantenimiento } from '../RepuestoMantenimiento';

export class MantenimientoDTO {
    id?: number;
    fechaRegistro?: string;
    fechaMantenimiento?: string;
    descripcion?: string;
    idEquipo?: number;
    unidadMedida?: UnidadMedida;
    cantidadUnidadMedida?: number;
    esService?: boolean;
    repuestosMantenimiento: RepuestoMantenimiento[] = [];
}
