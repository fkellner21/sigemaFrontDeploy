import { TareaEquipo } from './enum/TareaEquipo';

export class TipoEquipo {
    id!: number;
    codigo!: string;
    nombre!: string;
    activo: boolean = true;
    tarea: TareaEquipo = TareaEquipo.Otras;
}
