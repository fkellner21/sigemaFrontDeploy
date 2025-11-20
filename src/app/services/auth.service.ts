import { Injectable } from '@angular/core';
import { LoginDTO } from '../models/login';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginRespuestaDTO } from '../models/DTO/loginRespuestaDTO';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { tipoEquipoService } from './tipoEquipo.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private rolUsuario: string | null = null;
    private idUnidad: number | null = null;
    private idUsuario: number | null = null;
    private baseUrl = `${environment.apiUrl}/api/login`;

    constructor(
        private http: HttpClient,
        private tipoEquipoService: tipoEquipoService
    ) {}

    setRol(rol: string): void {
        this.rolUsuario = rol;
    }

    getRol(): string | null {
        return this.rolUsuario;
    }

    setIdUnidad(idUnidad: number): void {
        this.idUnidad = idUnidad;
    }

    getIdUnidad(): number | null {
        return this.idUnidad;
    }

    setIdUsuario(idUsuario: number): void {
        this.idUsuario = idUsuario;
    }

    getIdUsuario(): number | null {
        return this.idUsuario;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
        this.rolUsuario = null;
        this.idUnidad = null;
        this.idUsuario = null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    login(loginDTO: LoginDTO): Observable<LoginRespuestaDTO> {
    return this.http.post<LoginRespuestaDTO>(this.baseUrl, loginDTO).pipe(
        map(res => {
            if (res && res.token) {
                localStorage.setItem('token', res.token);
                this.setRol(res.rol);
                this.setIdUnidad(res.idUnidad);
                this.setIdUsuario(res.idUsuario);
            }
            return res;
        })
    );
    }

    isTokenValid(): Promise<boolean> {
        const token = localStorage.getItem('token');
        
        if (!token || token.split('.').length !== 3) {
            return Promise.resolve(false);
        }

        return firstValueFrom(
        this.tipoEquipoService.findAll().pipe(
            map(() => true),
            catchError((err) => {
                console.error('Error al validar token:', err);
                return of(false);
            })
        )
        ).catch(err => {
            console.error('Error inesperado:', err);
            return false;
        });
    }
}
