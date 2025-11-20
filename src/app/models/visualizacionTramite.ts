import { Tramite } from './tramite';
import { Usuario } from './usuario';

export class VisualizacionTramite {
    id!: number;
    fecha?: Date;
    usuario?: Usuario;
    tramite?: Tramite;
    descripcion?: string;
}
