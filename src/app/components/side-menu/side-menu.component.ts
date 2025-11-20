import { Component, EventEmitter, OnDestroy, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Notificacion } from '../../models/notificacion';
import { Subscription } from 'rxjs';
import { MaquinaService } from '../../services/equipo.service';

@Component({
    selector: 'side-menu',
    standalone: true,
    imports: [
        RouterModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatBadgeModule,
        CommonModule,
    ],
    templateUrl: './side-menu.component.html',
    styleUrl: './side-menu.component.css',
})

export class SideMenuComponent implements OnInit, OnDestroy {
    isConfigOpen = false;
    @Input() notificaciones: Notificacion[] = [];
    
    @Output() abrirPerfilEvent = new EventEmitter<void>();
    @Output() abrirNotificacionesEvent = new EventEmitter<void>();
    @Output() cargarNotificacionesEvent = new EventEmitter<void>();
    @Output() abrirLogsEvent = new EventEmitter<void>();

    isReportesOpen = false;
    roles!: { key: string; label: string }[];

    intervaloSub?: Subscription;

    constructor(
        private router: Router,
        private authService: AuthService,
        private maquinaService: MaquinaService
    ) {}

    ngOnInit() {
        this.authService
            .isTokenValid()
            .then((isValid) => {
                if (!isValid) {
                    this.router.navigate(['/login']);
                }else{
                    this.cargarNotificacionesEvent.emit();
                    setInterval(() => {
                    this.cargarNotificacionesEvent.emit();
                    }, 15 * 60 * 1000);
                }
            })
            .catch(() => {
                this.router.navigate(['/login']);
            });
    }

    ngOnDestroy(): void {
        if (this.intervaloSub) {
            this.intervaloSub.unsubscribe();
        }
    }

    obtenerRolUsuario(){
        return this.authService.getRol();
    }

    toggleConfig() {
        this.isConfigOpen = !this.isConfigOpen;
    }

    toggleReportes(){
        this.isReportesOpen = !this.isReportesOpen;
    }

    onClick(event: MouseEvent) {
        const el = event.currentTarget as HTMLElement;
        setTimeout(() => el.blur(), 0);
        localStorage.clear();
        this.router.navigate(['/login']);
    }

    abrirModalNotificaciones() {
        this.abrirNotificacionesEvent.emit();
    }

    abrirModalPerfil() {
        this.abrirPerfilEvent.emit();
    }

    abrirLogs(){
        this.abrirLogsEvent.emit();
    }

        generarReporteIndicadoresGestion() {
            this.maquinaService.generarReporteIndicadoresGestion().subscribe({
                next: (blob: Blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
    
                    link.href = url;
                    link.download = 'INDICADORES_DE_GESTIÓN.xlsx';
    
                    document.body.appendChild(link);
                    link.click();
    
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo generar el reporte. ' + err.error,
                        icon: 'error',
                    });
                },
            });
        }
    
        generarReportePrevisiones() {
            this.maquinaService.generarReportePrevisiones().subscribe({
                next: (blob: Blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
    
                    link.href = url;
                    link.download = 'PREVISIONES_AÑO_PROXIMO.xlsx';
    
                    document.body.appendChild(link);
                    link.click();
    
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo generar el reporte. ' + err.error,
                        icon: 'error',
                    });
                },
            });
        }
}