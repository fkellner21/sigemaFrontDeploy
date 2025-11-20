import { Observable } from 'rxjs';
import { TipoEquipo } from '../models/tipoEquipo';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class tipoEquipoService {

    constructor(private http: HttpClient) {}

    findAll(): Observable<TipoEquipo[]> {
        return this.http.get<TipoEquipo[]>(
            `${environment.apiUrl}/api/tiposEquipos/activos/true`,
        );
    }

    addNew(tipoEquipo: TipoEquipo): Observable<TipoEquipo> {
        return this.http.post<TipoEquipo>(
            `${environment.apiUrl}/api/tiposEquipos/`,
            tipoEquipo
        );
    }
    edit(id: number, tipoEquipo: TipoEquipo): Observable<TipoEquipo> {
        return this.http.put<TipoEquipo>(
            `${environment.apiUrl}/api/tiposEquipos/${id}`,
            tipoEquipo
        );
    }
}
