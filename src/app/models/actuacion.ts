import { Tramite } from "./tramite";
import { Usuario } from "./usuario";

export class Actuacion{
    id?: number;
    tramite?:Tramite;
    usuario?: Usuario;
    fecha?: Date;
    descripcion?: string;
}