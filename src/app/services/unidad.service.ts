// unidad.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unidad } from '../models/Unidad';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UnidadService {
    token: string | null = null;
    headers: HttpHeaders = new HttpHeaders();

    constructor(private http: HttpClient) {
    }

    findAll(): Observable<Unidad[]> {
        return this.http.get<Unidad[]>(`${environment.apiUrl}/api/unidades`);
    }

    findById(id: number): Observable<Unidad> {
        return this.http.get<Unidad>(
            `${environment.apiUrl}/api/unidades/${id}`);
    }

    addNew(unidad: Unidad): Observable<Unidad> {
        return this.http.post<Unidad>(
            `${environment.apiUrl}/api/unidades`,
            unidad);
    }

    edit(id: number, unidad: Unidad): Observable<Unidad> {
        return this.http.put<Unidad>(
            `${environment.apiUrl}/api/unidades/${id}`,
            unidad);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/api/unidades/${id}`);
    }
}
