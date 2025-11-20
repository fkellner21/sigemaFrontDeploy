import { Repuesto } from './Repuesto';

export class RepuestoMantenimiento {
    id!: number;
    idRepuesto!: number;
    repuesto!: Repuesto;
    cantidadUsada: number = 0;
}
