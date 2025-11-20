import { modeloEquipo } from "./modeloEquipo";

export class DocumentoModeloEquipo{
    id!:number;
    nombreArchivo!:string;
    rutaArchivo!:string;
    modeloEquipo!:modeloEquipo;
    fechaSubida!:Date;
}