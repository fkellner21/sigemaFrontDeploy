import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { Tramite } from '../../../models/tramite';
import Swal from 'sweetalert2';
import { Actuacion } from '../../../models/actuacion';
import { TipoTramite } from '../../../models/enum/TipoTramite';
import { EstadoTramite } from '../../../models/enum/EstadoTramite';
import { TramiteService } from '../../../services/tramite.service';
import { Unidad } from '../../../models/Unidad';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipo } from '../../../models/equipo';
import { MaquinaService } from '../../../services/equipo.service';
import { modeloService } from '../../../services/modelo.service';
import { Repuesto } from '../../../models/Repuesto';
import { TipoRepuesto } from '../../../models/enum/TipoRepuesto';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'tramite-repuesto-form',
    imports: [CommonModule, FormsModule, MatTabsModule, MatTableModule],
    templateUrl: './tramite-repuesto-form.component.html',
    styleUrl: './tramite-repuesto-form.component.css',
})
export class TramiteRepuestoFormComponent {
    @Input() tramite: Tramite = new Tramite();
    @Input() unidades!: Unidad[];
    @Output() cancelEventEmiter = new EventEmitter();
    @Output() newTramiteEventEmitter: EventEmitter<Tramite> =
        new EventEmitter();
    isLoading = false;
    estadoOptions: { key: string; label: string }[] = [];
    tipoTramiteOptions: { key: string; label: string }[] = [];
    equipos: Equipo[] = [];
    estadoTramite = EstadoTramite;
    repuestos: Repuesto[] = [];
    nuevaActuacion: string = '';
    dataSourceVisualizaciones: any[] = [];
    displayedColumnsVisualizaciones: string[] = [
        'usuario',
        'descripcion',
        'fecha',
    ];

    constructor(
        private tramiteService: TramiteService,
        private equiposService: MaquinaService,
        private modeloService: modeloService
    ) {
        if (this.tramite == null) {
            this.tramite = new Tramite();
        }
    }

    ngOnInit() {
        this.estadoOptions = this.enumToOptions(EstadoTramite);
        this.tipoTramiteOptions = this.enumToOptions(TipoTramite);

        this.tramite.actuaciones = (this.tramite.actuaciones ?? []).sort(
            (a, b) => {
                const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
                const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
                return fechaB - fechaA;
            }
        );
        this.equiposService.findAll().subscribe({
            next: (resp) => {
                this.equipos = resp;
            },
            error: (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar el formulario',
                    text:
                        'Ocurrió un error al cargar los equipos. ' +
                        error.error.message,
                });
            },
        });
        
        if (this.tramite.equipo?.modeloEquipo.id) {
            this.modeloService
                .cargarRepuestos(
                    this.tramite.equipo?.modeloEquipo.id,
                    TipoRepuesto.Lubricante
                )
                .subscribe({
                    next: (resp) => {
                        this.repuestos = resp;
                    },
                    error: (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cargar el formulario',
                            text:
                                'Ocurrió un error al cargar los repuestos. ' +
                                error.error.message,
                        });
                    },
                });
        }

        if (this.tramite.equipo?.modeloEquipo.id) {
            this.modeloService
                .cargarRepuestos(
                    this.tramite.equipo?.modeloEquipo.id,
                    TipoRepuesto.Pieza
                )
                .subscribe({
                    next: (resp) => {
                        resp.forEach(r => {
                            this.repuestos.push(r);
                        });
                    },
                    error: (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cargar el formulario',
                            text:
                                'Ocurrió un error al cargar los repuestos. ' +
                                error.error.message,
                        });
                    },
                });
        }

        this.dataSourceVisualizaciones = (
            this.tramite.visualizaciones ?? []
        ).sort((a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return fechaB - fechaA;
        });

    }


    compareEquipos(e1: Equipo, e2: Equipo): boolean {
        return e1 && e2 ? e1.id === e2.id : e1 === e2;
    }

    compareRpuestos(r1: Repuesto, r2: Repuesto): boolean {
        return r1 && r2 ? r1.id == r2.id : r1 == r2;
    }

    onEquipoChange() {
        const modeloId = this.tramite.equipo?.modeloEquipo?.id;
        if (modeloId) {
            this.modeloService
                .cargarRepuestos(modeloId, TipoRepuesto.Lubricante)
                .subscribe({
                    next: (resp) => {
                        this.repuestos = resp;
                        this.tramite.repuesto = null as any;
                    },
                    error: (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cargar los repuestos',
                            text:
                                'Ocurrió un error al cargar los repuestos. ' +
                                error.error.message,
                        });
                    },
                });
        } else {
            this.repuestos = [];
            this.tramite.repuesto = null as any;
        }

        if (modeloId) {
            this.modeloService
                .cargarRepuestos(modeloId, TipoRepuesto.Pieza)
                .subscribe({
                    next: (resp) => {
                        resp.forEach(r => {
                            this.repuestos.push(r);
                        });
                        this.tramite.repuesto = null as any;
                    },
                    error: (error) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cargar los repuestos',
                            text:
                                'Ocurrió un error al cargar los repuestos. ' +
                                error.error.message,
                        });
                    },
                });
        }
    }

    private enumToOptions(enumObj: any): { key: string; label: string }[] {
        return Object.entries(enumObj).map(([key, label]) => ({
            key,
            label: label as string,
        }));
    }

    onSubmit() {
        this.newTramiteEventEmitter.emit(this.tramite ?? new Tramite());
    }
    onCancel() {
        this.cancelEventEmiter.emit();
    }

    guardarActuacion() {
        if (!this.nuevaActuacion.trim()) {
            return;
        }

        const textoActuacion = this.nuevaActuacion.trim();
        let actuacion = new Actuacion();
        actuacion.descripcion = textoActuacion;
        actuacion.fecha = new Date();

        this.tramiteService
            .newActuacion(this.tramite.id ?? 0, actuacion)
            .subscribe({
                next: () => {
                    this.nuevaActuacion = '';
                    actuacion = new Actuacion();

                    this.recargarTramite();

                    setTimeout(() => {
                        this.textareas.forEach((textarea) => {
                            const el =
                                textarea.nativeElement as HTMLTextAreaElement;
                            this.autoGrow(el);
                        });
                    }, 100);
                },
                error: (error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar la actuación',
                        text:
                            error.error.message ||
                            'Ocurrió un error al guardar la actuación.',
                    });
                },
            });
    }

    recargarTramite() {
        if (this.tramite.id != null && this.tramite.id != 0) {
            this.tramiteService.findById(this.tramite.id ?? 0).subscribe({
                next: (tramiteBuscado: Tramite) => {
                    this.tramite.actuaciones = tramiteBuscado.actuaciones ?? [];

                    this.tramite.actuaciones = (
                        this.tramite.actuaciones ?? []
                    ).sort((a, b) => {
                        const fechaA = a.fecha
                            ? new Date(a.fecha).getTime()
                            : 0;
                        const fechaB = b.fecha
                            ? new Date(b.fecha).getTime()
                            : 0;
                        return fechaB - fechaA;
                    });
                },
                error: (err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text:
                            'Ocurrió un error al cargar el tramite. ' +
                            err.error,
                    });
                },
            });
        }
    }

    @ViewChildren('txtDesc') textareas!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.textareas.forEach((textarea) => {
            const el = textarea.nativeElement as HTMLTextAreaElement;
            this.autoGrow(el);
        });
    }

    autoGrow(element: HTMLTextAreaElement) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }
}
