import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Unidad } from '../../models/Unidad';
import { Rol } from '../../models/enum/Rol';
import { UnidadService } from '../../services/unidad.service';
import { AuthService } from '../../services/auth.service';
import { TipoTramite } from '../../models/enum/TipoTramite';
import { EstadoTramite } from '../../models/enum/EstadoTramite';
import { TramiteService } from '../../services/tramite.service';
import { Tramite } from '../../models/tramite';
import Swal from 'sweetalert2';
import { TramiteEquipoFormComponent } from './tramite-equipo-form/tramite-equipo-form.component';
import { TramiteRepuestoFormComponent } from './tramite-repuesto-form/tramite-repuesto-form.component';
import { TramiteUsuarioFormComponent } from './tramite-usuario-form/tramite-usuario-form.component';
import { TramiteInfoFormComponent } from './tramite-info-form/tramite-info-form.component';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { TramiteDTO } from '../../models/DTO/tramiteDTO';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { DateRange, MatDateRangePicker } from '@angular/material/datepicker';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ArchivoDTO } from '../../models/DTO/archivoDTO';

@Component({
    selector: 'tramites',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTab,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TramiteEquipoFormComponent,
        TramiteRepuestoFormComponent,
        TramiteUsuarioFormComponent,
        TramiteInfoFormComponent,
        MatTabGroup,
        MatDateRangePicker,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
    ],
    templateUrl: './tramite.component.html',
    styleUrls: ['./tramite.component.css'],
})
export class TramitesComponent implements OnInit {
    displayedColumns: string[] = [
        'Origen',
        'Destino',
        'Fecha',
        'Solicitante',
        'Tipo',
        'Estado',
        'acciones',
    ];

    dataSource: any[] = [];
    dataSourceOriginal: any[] = [];
    isLoading: boolean = false;
    dataSourcePendientes: any[] = [];
    dataSourceFinalizados: any[] = [];
    filtroActual: string = '';

    mostrarFormularioEquipo: boolean = false;
    mostrarFormularioRepuesto: boolean = false;
    mostrarFormularioUsuario: boolean = false;
    mostrarFormularioInfo: boolean = false;

    estados!: { key: string; label: string }[];
    tipos!: { key: string; label: string }[];
    tiposParaFiltro!: { key: string; label: string }[];
    unidades!: any;
    Rol = Rol;
    TipoTramite = TipoTramite;
    EstadoTramite = EstadoTramite;
    tramiteSeleccionado: Tramite = new Tramite();
    unidadOrigen!: Unidad;
    usuario: Usuario = new Usuario();
    tipoTramite: TipoTramite = TipoTramite.Otros;
    form = new FormGroup({
        fechaRango: new FormGroup({
            start: new FormControl<Date>(
                new Date(new Date().setDate(new Date().getDate() - 7))
            ),
            end: new FormControl<Date>(new Date()),
        }),
    });

    constructor(
        private unidadService: UnidadService,
        private tramiteService: TramiteService,
        private usuarioService: UsuarioService,
        public authservice: AuthService
    ) {}

    getRolLabel(key: any): string {
        return this.Rol[key as keyof typeof Rol] ?? key;
    }

    getTipoLabel(key: any): string {
        return this.TipoTramite[key as keyof typeof TipoTramite] ?? key;
    }

    getEstadoLabel(key: any): string {
        return this.EstadoTramite[key as keyof typeof EstadoTramite] ?? key;
    }

    ngOnInit() {
        this.estados = Object.keys(EstadoTramite).map((key) => ({
            key: key,
            label: EstadoTramite[key as keyof typeof EstadoTramite],
        }));

        this.tipos = Object.keys(TipoTramite)
            .filter(
                (key) =>
                    key !== 'BajaEquipo' &&
                    key !== 'AltaEquipo' &&
                    key !== 'AltaUsuario' &&
                    key !== 'BajaUsuario'
            )
            .map((key) => ({
                key: key,
                label: TipoTramite[key as keyof typeof TipoTramite],
            }));

        this.tiposParaFiltro = Object.keys(TipoTramite).map((key) => ({
            key: key,
            label: TipoTramite[key as keyof typeof TipoTramite],
        }));

        this.unidadService.findAll().subscribe((unidadesRecibidas) => {
            this.unidades = unidadesRecibidas ?? [];
        });

        const idUnidad = this.authservice.getIdUnidad();
        if (idUnidad != null) {
            this.unidadService.findById(idUnidad).subscribe((unidad) => {
                this.unidadOrigen = unidad;
            });
        }

        const idUsuario = this.authservice.getIdUsuario();
        if (idUsuario != null) {
            this.usuarioService.findById(idUsuario).subscribe((user) => {
                this.usuario = user;
            });
        }

        this.cargarTramites();
    }

    onDateRangeSelected() {
        const fechaRango = this.form.get('fechaRango')?.value;
        if (fechaRango?.start && fechaRango?.end) {
            this.cargarTramites();
        }
    }

    cargarTramites() {
        this.isLoading = true;

        const fechaGroup = this.form.get('fechaRango') as FormGroup;
        const start = fechaGroup.get('start')?.value as Date;
        const end = fechaGroup.get('end')?.value as Date;
        const desde = start.toISOString().substring(0, 10);
        const hasta = end.toISOString().substring(0, 10);

        this.tramiteService.findAll(desde, hasta).subscribe({
            next: (data) => {
                this.dataSourceOriginal = data;
                this.filtrarTramites();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar los trámites:', err.error);
                this.isLoading = false;
            },
        });
    }

    filtrarTramites() {
        const filtro = this.filtroActual.trim().toLowerCase();

        const filtrados = this.dataSourceOriginal.filter((tramite) => {
            const origen = tramite.unidadOrigen?.nombre?.toLowerCase() ?? '';
            const destino = tramite.unidadDestino?.nombre?.toLowerCase() ?? '';
            const fecha = tramite.fechaInicio
                ? new Date(tramite.fechaInicio)
                      .toLocaleDateString()
                      .toLowerCase()
                : '';
            const solicitante =
                tramite.usuario?.nombreCompleto?.toLowerCase() ?? '';
            const tipo =
                this.tiposParaFiltro
                    .find((t) => t.key === tramite.tipoTramite)
                    ?.label.toLowerCase() ?? '';
            const estado =
                this.estados
                    .find((e) => e.key === tramite.estado)
                    ?.label.toLowerCase() ?? '';

            return (
                origen.includes(filtro) ||
                destino.includes(filtro) ||
                fecha.includes(filtro) ||
                solicitante.includes(filtro) ||
                tipo.includes(filtro) ||
                estado.includes(filtro)
            );
        });

        this.dataSourcePendientes = filtrados.filter(
            (t) => t.estado === 'Iniciado' || t.estado === 'EnTramite'
        );

        this.dataSourceFinalizados = filtrados
            .filter((t) => t.estado === 'Aprobado' || t.estado === 'Rechazado')
            .sort(
                (a, b) =>
                    new Date(b.fechaInicio).getTime() -
                    new Date(a.fechaInicio).getTime()
            );
    }

    applyFilter(event: Event) {
        this.filtroActual = (event.target as HTMLInputElement).value;
        this.filtrarTramites();
    }

    abrirFormularioTramite(idTramite?: number) {
        if (idTramite != null && idTramite != 0) {
            this.tramiteService.findById(idTramite ?? 0).subscribe({
                next: (tramite: Tramite) => {
                    this.tramiteSeleccionado = tramite;
                    this.tramiteSeleccionado.idUnidadDestino =
                        tramite.unidadDestino?.id ?? 0;
                    this.tramiteSeleccionado.idUnidadOrigen =
                        tramite.unidadOrigen?.id ?? 0;
                    this.tramiteSeleccionado.idEquipo = tramite.equipo?.id ?? 0;
                    this.tramiteSeleccionado.idRepuesto =
                        tramite.repuesto?.id ?? 0;
                    this.tramiteSeleccionado.tipoTramite = tramite.tipoTramite;
                    this.tramiteSeleccionado.estado = tramite.estado;

                    this.mostrarFormulario(tramite);
                },
                error: (err) => {
                    console.log(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text:
                            'Ocurrió un error al cargar el tramite. ' +
                            err.error,
                    });
                },
            });
        } else {
            this.tramiteSeleccionado = new Tramite();
            this.tramiteSeleccionado.tipoTramite = this.tipoTramite;
            this.tramiteSeleccionado.estado = EstadoTramite.Iniciado;
            this.tramiteSeleccionado.fechaInicio = new Date();
            this.tramiteSeleccionado.unidadOrigen = this.unidadOrigen;
            this.tramiteSeleccionado.idUnidadOrigen =
                this.unidadOrigen?.id ?? 0;
            this.tramiteSeleccionado.usuario = this.usuario;
            this.mostrarFormulario(this.tramiteSeleccionado);
        }
    }

    mostrarFormulario(tramite: Tramite) {
        this.mostrarFormularioEquipo = false;
        this.mostrarFormularioInfo = false;
        this.mostrarFormularioRepuesto = false;
        this.mostrarFormularioUsuario = false;

        switch (tramite.tipoTramite?.valueOf()) {
            case 'BajaEquipo':
            case 'AltaEquipo':
                this.mostrarFormularioEquipo = true;
                break;

            case 'SolicitudRepuesto':
                this.mostrarFormularioRepuesto = true;
                break;

            case 'AltaUsuario':
            case 'BajaUsuario':
                this.mostrarFormularioUsuario = true;
                break;

            default:
                this.mostrarFormularioInfo = true;
                break;
        }
    }

    cerrarFormularios() {
        this.tramiteSeleccionado = new Tramite();
        this.mostrarFormularioEquipo = false;
        this.mostrarFormularioInfo = false;
        this.mostrarFormularioRepuesto = false;
        this.mostrarFormularioUsuario = false;
    }

    guardarTramite(tramiteObj: any) {
        this.isLoading = true;
        var tramite: TramiteDTO = TramiteDTO.toDto(tramiteObj);

        const request$ = tramiteObj.id
            ? this.tramiteService.edit(tramiteObj.id, tramite)
            : this.tramiteService.addNew(tramite);

        request$.subscribe({
            next: () => {
                this.cargarTramites();
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

    eliminarTramite(id: number) {
        if (confirm('¿Está seguro de eliminar este tramite?')) {
            this.tramiteService.delete(id).subscribe(() => {
                this.cargarTramites();
            });
        }
    }

    aprobarTramite(id: number) {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.tramiteService
                    .changeEstado(id, EstadoTramite.Aprobado)
                    .subscribe({
                        next: (archivos) => {
                            if (archivos && archivos.length > 0) {
                                this.descargarArchivos(archivos);
                            }
                            Swal.fire(
                                'Aprobado',
                                'Se aprobó el trámite',
                                'success'
                            );
                            this.cargarTramites();
                        },
                        error: (err) => {
                            Swal.fire(
                                'Error',
                                'No se pudo aprobar el trámite. ' + err.error,
                                'error'
                            );
                            this.cargarTramites();
                        },
                    });
            }
        });
    }

    rechazarTramite(id: number) {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.tramiteService
                    .changeEstado(id, EstadoTramite.Rechazado)
                    .subscribe({
                        next: (archivos) => {
                            if (archivos && archivos.length > 0) {
                                this.descargarArchivos(archivos);
                            }
                            Swal.fire(
                                'Rechazado',
                                'El trámite fue rechazado',
                                'success'
                            );
                            this.cargarTramites();
                        },
                        error: (err) => {
                            Swal.fire(
                                'Error',
                                'No se pudo rechazar el trámite. ' + err.error,
                                'error'
                            );
                        },
                    });
            }
        });
    }

    descargarArchivos(archivos: ArchivoDTO[]) {
        archivos.forEach((archivo) => {
            const link = document.createElement('a');
            link.href =
                'data:application/octet-stream;base64,' + archivo.archivo;
            link.download = archivo.nombre;
            link.click();
        });
    }
}
