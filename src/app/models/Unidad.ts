import { UnidadEmail } from "./UnidadEmail";

export class Unidad {
    id!: number;
    nombre!: string;
    latitud!: number;
    longitud!: number;
    esGranUnidad: boolean = false;
    emails: UnidadEmail[] = [];
}