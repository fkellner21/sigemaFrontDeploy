import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Equipo } from '../models/equipo';
import { EquipoDashboardDTO } from '../models/DTO/EquipoDashboardDTO';
import { environment } from '../../environments/environment';
import { ArchivoDTO } from '../models/DTO/archivoDTO';

@Injectable({
    providedIn: 'root',
})
export class MaquinaService {
    private baseUrl = `${environment.apiUrl}/api/equipos`;

    constructor(private http: HttpClient) {}

    // Listado de máquinas
    findAll(): Observable<Equipo[]> {
        return this.http.get<Equipo[]>(this.baseUrl).pipe(
            map((equipos) =>
                equipos.map((equipo) => {
                    if (equipo.unidad) {
                        equipo.idUnidad = equipo.unidad.id;
                    }
                    if (equipo.modeloEquipo) {
                        equipo.idModeloEquipo = equipo.modeloEquipo.id;
                    }
                    return equipo;
                })
            )
        );
    }

    // Listado para dashboard
    findAllDashboard(): Observable<EquipoDashboardDTO[]> {
        return this.http.get<EquipoDashboardDTO[]>(`${this.baseUrl}/dashboard`);
    }

    // Crear una nueva máquina (devuelve archivos generados)
    addNew(maquina: Equipo): Observable<ArchivoDTO[]> {
        return this.http.post<ArchivoDTO[]>(this.baseUrl, maquina);
    }

    // Obtener máquina por ID
    findById(id: number): Observable<Equipo> {
        return this.http.get<Equipo>(`${this.baseUrl}/${id}`).pipe(
            map((equipo) => {
                if (equipo.unidad) {
                    equipo.idUnidad = equipo.unidad.id;
                }
                if (equipo.modeloEquipo) {
                    equipo.idModeloEquipo = equipo.modeloEquipo.id;
                }
                return equipo;
            })
        );
    }

    // Editar una máquina (devuelve archivos generados)
    edit(id: number, maquina: Equipo): Observable<ArchivoDTO[]> {
        return this.http.put<ArchivoDTO[]>(`${this.baseUrl}/${id}`, maquina);
    }

    // Eliminar una máquina (devuelve archivos generados)
    delete(id: number): Observable<ArchivoDTO[]> {
        return this.http.delete<ArchivoDTO[]>(`${this.baseUrl}/${id}`);
    }

    // Descargar reporte de indicadores (formato Blob)
    generarReporteIndicadoresGestion(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/reporteIndicadoresGestion`, {
            responseType: 'blob',
        });
    }

    generarReportePrevisiones(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/reporteInformePrevisiones`, {
            responseType: 'blob',
        });
    }
}