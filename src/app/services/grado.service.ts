import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Grado } from '../models/grado';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class gradoService {

    constructor(private http: HttpClient) {
    }

    findAll(): Observable<Grado[]> {
        return this.http.get<Grado[]>(`${environment.apiUrl}/api/grados`);
    }

    addNew(grado: Grado): Observable<Grado> {
        return this.http.post<Grado>(
            `${environment.apiUrl}/api/grados`,
            grado);
    }
    edit(id: number, grado: Grado): Observable<Grado> {
        return this.http.put<Grado>(
            `${environment.apiUrl}/api/grados/${id}`,
            grado);
    }
}
