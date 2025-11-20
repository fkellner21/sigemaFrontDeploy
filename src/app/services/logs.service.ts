import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LogsService {
    private baseUrl = `${environment.apiUrl}/api/logs`;

    constructor(private http: HttpClient) {}

    getLogs(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}`);
    }

    descargarLogPorFecha(fecha: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/descargar/${fecha}`, {
            responseType: 'blob',
        });
    }
}