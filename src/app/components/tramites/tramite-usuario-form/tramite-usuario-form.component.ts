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
import { EstadoTramite } from '../../../models/enum/EstadoTramite';
import { TipoTramite } from '../../../models/enum/TipoTramite';
import { TramiteService } from '../../../services/tramite.service';
import { Unidad } from '../../../models/Unidad';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'tramite-usuario-form',
    imports: [CommonModule, FormsModule, MatTabsModule, MatTableModule],
    templateUrl: './tramite-usuario-form.component.html',
    styleUrl: './tramite-usuario-form.component.css',
})
export class TramiteUsuarioFormComponent {
    @Input() tramite: Tramite = new Tramite();
    @Input() unidades!: Unidad[];
    @Output() cancelEventEmiter = new EventEmitter();
    @Output() newTramiteEventEmitter: EventEmitter<Tramite> =
        new EventEmitter();
    isLoading = false;
    estadoOptions: { key: string; label: string }[] = [];
    tipoTramiteOptions: { key: string; label: string }[] = [];
    nuevaActuacion: string = '';
    dataSourceVisualizaciones: any[] = [];
    displayedColumnsVisualizaciones: string[] = ['usuario', 'descripcion','fecha'];
    estadoTramite = EstadoTramite;
    constructor(private tramiteService: TramiteService) {
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
