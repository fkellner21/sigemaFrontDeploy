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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'tramite-equipo-form',
    imports: [CommonModule, FormsModule, MatTabsModule, MatTableModule],
    templateUrl: './tramite-equipo-form.component.html',
    styleUrl: './tramite-equipo-form.component.css',
})
export class TramiteEquipoFormComponent {
    @Input() tramite!: Tramite;
    @Input() unidades!: Unidad[];
    @Output() cancelEventEmiter = new EventEmitter();
    @Output() newTramiteEventEmitter: EventEmitter<Tramite> =
        new EventEmitter();
    isLoading = false;
    estadoOptions: { key: string; label: string }[] = [];
    tipoTramiteOptions: { key: string; label: string }[] = [];
    equipos: Equipo[] = [];
    estadoTramite = EstadoTramite;
    nuevaActuacion: string = '';
    dataSourceVisualizaciones: any[] = [];
    displayedColumnsVisualizaciones: string[] = ['usuario', 'descripcion', 'fecha'];

    constructor(
        private tramiteService: TramiteService,
        private equiposService: MaquinaService
    ) {
        if (this.tramite == null) {
            this.tramite = new Tramite();
            this.tramite.tipoTramite = TipoTramite.BajaEquipo;
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

        if(this.tramite.equipo != null){
            this.equipos.push(this.tramite.equipo);
        }

        this.dataSourceVisualizaciones = (
            this.tramite.visualizaciones ?? []
        ).sort((a, b) => {
            const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return fechaB - fechaA;
        });
    }

    private enumToOptions(enumObj: any): { key: string; label: string }[] {
        return Object.entries(enumObj).map(([key, label]) => ({
            key,
            label: label as string,
        }));
    }
    compareEquipos(e1: Equipo, e2: Equipo): boolean {
        return e1 && e2 ? e1.id === e2.id : e1 === e2;
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
