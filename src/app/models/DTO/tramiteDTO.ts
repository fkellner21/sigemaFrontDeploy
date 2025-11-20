import { TipoTramite } from "../enum/TipoTramite";
import { Tramite } from "../tramite";

export class TramiteDTO {
    tipoTramite?: TipoTramite;
    idUnidadOrigen?: number;
    idUnidadDestino?: number;
    idEquipo?: number;
    idRepuesto?: number;
    idUsuarioBaja?: number;
    texto?: string;

    static toDto(tramite:Tramite):TramiteDTO{
        let salida = new TramiteDTO();

        salida.tipoTramite = tramite.tipoTramite;
        salida.idEquipo = tramite.equipo?.id??0;
        salida.idRepuesto = tramite.repuesto?.id??0;
        salida.idUnidadDestino = tramite.idUnidadDestino??0;
        salida.idUnidadOrigen = tramite.idUnidadOrigen??0;
        salida.idUsuarioBaja = tramite.idUsuarioBajaSolicitada??0;
        salida.texto = tramite.texto??'';

        return salida;
    }

}