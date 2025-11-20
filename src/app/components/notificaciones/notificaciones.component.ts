import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Notificacion } from '../../models/notificacion';
import { MatTableModule } from '@angular/material/table';
import { NotificacionesService } from '../../services/notificacion.service';
import { TramiteEquipoFormComponent } from '../tramites/tramite-equipo-form/tramite-equipo-form.component';
import { TramiteRepuestoFormComponent } from '../tramites/tramite-repuesto-form/tramite-repuesto-form.component';
import { TramiteUsuarioFormComponent } from '../tramites/tramite-usuario-form/tramite-usuario-form.component';
import { TramiteInfoFormComponent } from '../tramites/tramite-info-form/tramite-info-form.component';
import { Unidad } from '../../models/Unidad';
import { Tramite } from '../../models/tramite';
import Swal from 'sweetalert2';
import { TramiteDTO } from '../../models/DTO/tramiteDTO';
import { TramiteService } from '../../services/tramite.service';

@Component({
    selector: 'notificaciones',
    imports: [
        RouterModule,
        CommonModule,
        MatTableModule,
        TramiteEquipoFormComponent,
        TramiteRepuestoFormComponent,
        TramiteUsuarioFormComponent,
        TramiteInfoFormComponent,
    ],
    templateUrl: './notificaciones.component.html',
})
export class NotificacionesComponent implements OnInit, OnChanges {
    @Input() notificaciones!: Notificacion[];
    @Input() unidades!: Unidad[];

    dataSourceNotificaciones: any[] = [];
    displayedColumnsNotificaciones: string[] = [
        'Descripcion',
        'Fecha',
        'acciones',
    ];
    isLoading = false;
    @Output() actualizarNotificaciones = new EventEmitter();
    @Output() cancelEventEmiter = new EventEmitter();
    mostrarFormularioEquipo: boolean = false;
    mostrarFormularioRepuesto: boolean = false;
    mostrarFormularioUsuario: boolean = false;
    mostrarFormularioInfo: boolean = false;
    tramiteSeleccionado!: Tramite;

    constructor(
        private notificacionesService: NotificacionesService,
        private tramiteService: TramiteService
    ) {}

    ngOnInit() {
        this.notificaciones = (this.notificaciones ?? []).sort((a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return fechaB - fechaA;
        });

        this.dataSourceNotificaciones = (this.notificaciones ?? []).sort(
            (a, b) => {
                const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
                const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
                return fechaB - fechaA;
            }
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['notificaciones'] &&
            changes['notificaciones'].currentValue
        ) {
            this.notificaciones = (this.notificaciones ?? []).sort((a, b) => {
                const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
                const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
                return fechaB - fechaA;
            });

            this.dataSourceNotificaciones = [...this.notificaciones];
        }
    }

    onCancel() {
        this.cancelEventEmiter.emit();
    }

    abrirTramite(idTramite: number) {
        this.tramiteService.findById(idTramite).subscribe({
            next: (tramite:Tramite) => {
                this.tramiteSeleccionado = tramite;
                this.tramiteSeleccionado.idUnidadDestino = 
                    tramite.unidadDestino?.id ?? 0;
                this.tramiteSeleccionado.idUnidadOrigen =
                    tramite.unidadOrigen?.id ?? 0;
                this.tramiteSeleccionado.idEquipo = tramite.equipo?.id ?? 0;
                this.tramiteSeleccionado.idRepuesto = tramite.repuesto?.id ?? 0;
                this.tramiteSeleccionado.tipoTramite = tramite.tipoTramite;
                this.tramiteSeleccionado.estado = tramite.estado;
                if (
                    tramite.tipoTramite?.toString() === "AltaEquipo" ||
                    tramite.tipoTramite?.toString() === "BajaEquipo"
                ) {
                    this.mostrarFormularioEquipo = true;
                } else if (
                    tramite.tipoTramite?.toString() === "SolicitudRepuesto"
                ) {
                    this.mostrarFormularioRepuesto = true;
                } else if (
                    tramite.tipoTramite?.toString() === "AltaUsuario" ||
                    tramite.tipoTramite?.toString() === "BajaUsuario"
                ) {
                    this.mostrarFormularioUsuario = true;
                } else if (
                    tramite.tipoTramite?.toString() === "Otros" ||
                    tramite.tipoTramite?.toString() === "PedidoInformacion"
                ) {
                    this.mostrarFormularioInfo = true;
                }
            },
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el trámite. ' + err.error,
                });
            },
        });
    }

    eliminar(id: number) {
        this.notificacionesService.delete(id).subscribe({
            next: (resp) => {
                this.notificaciones = this.notificaciones.filter(
                    (n) => n.id !== id
                );
                this.dataSourceNotificaciones =
                    this.dataSourceNotificaciones.filter((n) => n.id !== id);

                this.actualizarNotificaciones.emit();
            },
            error: (err) => {
                console.error('Error al eliminar la notificación:', err);
            },
        });
    }

    cerrarFormularios() {
        this.tramiteSeleccionado = new Tramite();
        this.mostrarFormularioEquipo = false;
        this.mostrarFormularioInfo = false;
        this.mostrarFormularioRepuesto = false;
        this.mostrarFormularioUsuario = false;
        this.actualizarNotificaciones.emit();
    }

    guardarTramite(tramiteObj: any) {
        this.isLoading = true;
        var tramite: TramiteDTO = TramiteDTO.toDto(tramiteObj);

        const request$ = tramiteObj.id
            ? this.tramiteService.edit(tramiteObj.id, tramite)
            : this.tramiteService.addNew(tramite);

        request$.subscribe({
            next: () => {
                this.cerrarFormularios();

                Swal.fire({
                    icon: 'success',
                    title: tramiteObj.id
                        ? 'Tramite actualizado'
                        : 'Tramite creado',
                    text: tramiteObj.id
                        ? 'El tramite ha sido actualizado correctamente.'
                        : 'El tramite ha sido creado correctamente.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            error: (err) => {
                this.isLoading = false;

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text:
                        'Ocurrió un error al guardar el tramite. ' + err.error,
                });
            },
        });
    }
}
