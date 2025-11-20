import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { modeloEquipo } from '../models/modeloEquipo';
import { ModeloEquipoDTO } from '../models/DTO/modeloEquipoDTO';
import { environment } from '../../environments/environment';
import { DocumentoModeloEquipo } from '../models/DocumentoModeloEquipo';
import { TipoRepuesto } from '../models/enum/TipoRepuesto';
import { Repuesto } from '../models/Repuesto';
import { Equipo } from '../models/equipo';

@Injectable({
    providedIn: 'root',
})
export class modeloService {

    constructor(private http: HttpClient) {
    }

    findAll(): Observable<modeloEquipo[]> {
        return this.http.get<modeloEquipo[]>(
            `${environment.apiUrl}/api/modelosEquipo`);
    }

    addNew(modelo: modeloEquipo): Observable<ModeloEquipoDTO> {
        let modeloDTO: ModeloEquipoDTO = ModeloEquipoDTO.toDTO(modelo);
        return this.http.post<ModeloEquipoDTO>(
            `${environment.apiUrl}/api/modelosEquipo`,
            modeloDTO);
    }
    edit(id: number, modelo: modeloEquipo): Observable<modeloEquipo> {
        let modeloDTO: ModeloEquipoDTO = ModeloEquipoDTO.toDTO(modelo);
        return this.http.put<modeloEquipo>(
            `${environment.apiUrl}/api/modelosEquipo/${id}`,
            modeloDTO);
    }

    cargarDocumentos(id: number): Observable<DocumentoModeloEquipo[]> {
        return this.http.get<DocumentoModeloEquipo[]>(
            `${environment.apiUrl}/api/modelosEquipo/${id}/documentos`);
    }

    subirDocumento(id: number, archivo: FormData) {
        return this.http.post(
            `${environment.apiUrl}/api/modelosEquipo/${id}/documentos`,
            archivo);
    }

    eliminarDocumento(id: number) {
        return this.http.delete(
            `${environment.apiUrl}/api/modelosEquipo/documentos/${id}`);
    }

    cargarRepuestos(id: number, tipo: TipoRepuesto): Observable<Repuesto[]> {
        return this.http.get<Repuesto[]>(
            `${environment.apiUrl}/api/modelosEquipo/${id}/repuestos/tipoRepuesto/${tipo}`);
    }
    editarRepuesto(repuesto: Repuesto): Observable<any> {
        return this.http.put(
            `${environment.apiUrl}/api/repuestos/${repuesto.id}`,
            repuesto);
    }
    crearRepuesto(repuesto: Repuesto) {
        return this.http.post(`${environment.apiUrl}/api/repuestos`, repuesto, {
            responseType: 'text',
        });
    }
    cargarEquipos(id: number): Observable<Equipo[]> {
        return this.http.get<Equipo[]>(
            `${environment.apiUrl}/api/modelosEquipo/${id}/equipos`);
    }
}