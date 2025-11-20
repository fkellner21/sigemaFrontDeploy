import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Mantenimiento } from '../../../models/mantenimiento';
import { Equipo } from '../../../models/equipo';
import { UnidadMedida } from '../../../models/enum/UnidadMedida';
import { TipoRepuesto } from '../../../models/enum/TipoRepuesto';
import { Repuesto } from '../../../models/Repuesto';
import { modeloService } from '../../../services/modelo.service';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import Swal from 'sweetalert2';
import { MantenimientoDTO } from '../../../models/DTO/mantenimientoDTO';
import { RepuestoMantenimiento } from '../../../models/RepuestoMantenimiento';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'mantenimiento-form',
    standalone: true,
    imports: [CommonModule, FormsModule, MatTableModule],
    templateUrl: './mantenimiento-form.component.html',
})
export class MantenimientoFormComponent implements OnInit {
    @Input() mantenimiento: Mantenimiento = new Mantenimiento();
    @Input() equipo!: Equipo;

    @Output() cerrarFormulario = new EventEmitter<void>();
    @Output() mantenimientoAgregado = new EventEmitter<void>();
    displayedRepuestoColumns: string[] = ['repuesto', 'cantidad', 'acciones'];
    dataSourceRepuestos = new MatTableDataSource<RepuestoMantenimiento>();

    unidadesDeMedida = [
        { label: 'Kilómetros', value: UnidadMedida.KMs },
        { label: 'Horas de trabajo', value: UnidadMedida.HT },
    ];

    tiposRepuesto = [
        { label: 'Pieza', value: TipoRepuesto.Pieza },
        { label: 'Lubricante', value: TipoRepuesto.Lubricante },
    ];

    tipoRepuestoSeleccionado: TipoRepuesto = TipoRepuesto.Pieza;
    TipoRepuesto = TipoRepuesto;
    repuestos: Repuesto[] = [];
    repuestoSeleccionado: RepuestoMantenimiento = new RepuestoMantenimiento();

    constructor(
        private modeloService: modeloService,
        private mantenimientoService: MantenimientoService, public authservice: AuthService
    ) {}

    ngOnInit(): void {

        if (
            typeof this.mantenimiento.unidadMedida === 'string' &&
            Object.values(UnidadMedida).includes(
                this.mantenimiento.unidadMedida
            )
        ) {
            this.mantenimiento.unidadMedida = this.mantenimiento
                .unidadMedida as UnidadMedida;
        }

        if (this.equipo?.modeloEquipo?.id) {
            this.obtenerRepuestosDelEquipo(
                this.equipo,
                this.tipoRepuestoSeleccionado
            );
        }

        this.dataSourceRepuestos.data =
            this.mantenimiento.repuestosMantenimiento || [];
    }

    formatDateOnly(input: string | Date): string {
        const date =
            typeof input === 'string' ? new Date(input + 'T00:00:00') : input;
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onSubmit(form: NgForm): void {
        if (form.valid) {
            const mantenimientoDTO = new MantenimientoDTO();

            mantenimientoDTO.id = this.mantenimiento.id;
            mantenimientoDTO.idEquipo = this.equipo?.id;
            mantenimientoDTO.descripcion = this.mantenimiento.descripcion;
            mantenimientoDTO.unidadMedida = this.mantenimiento.unidadMedida;
            mantenimientoDTO.cantidadUnidadMedida =
                this.mantenimiento.cantidadUnidadMedida;
            mantenimientoDTO.esService = this.mantenimiento.esService;
            mantenimientoDTO.repuestosMantenimiento = this.mantenimiento.repuestosMantenimiento || [];

            if (this.mantenimiento.fechaMantenimiento) {
                mantenimientoDTO.fechaMantenimiento = this.formatDateOnly(
                    this.mantenimiento.fechaMantenimiento
                );
            }

            if (this.mantenimiento.fechaRegistro) {
                mantenimientoDTO.fechaRegistro = this.formatDateOnly(
                    this.mantenimiento.fechaRegistro
                );
            }

            if (mantenimientoDTO.id && mantenimientoDTO.id > 0) {
                this.mantenimientoService
                    .edit(mantenimientoDTO.id, mantenimientoDTO)
                    .subscribe({
                        next: () => {
                            Swal.fire(
                                'Éxito',
                                'Mantenimiento actualizado correctamente',
                                'success'
                            );
                            this.mantenimientoAgregado.emit();
                            form.resetForm();
                        },
                        error: (e) => {
                            Swal.fire(
                                'Error',
                                'No se pudo actualizar el mantenimiento. '+e.error,
                                'error'
                            );
                        },
                    });
            } else {
                this.mantenimientoService.addNew(mantenimientoDTO).subscribe({
                    next: () => {
                        Swal.fire(
                            'Éxito',
                            'Mantenimiento agregado correctamente',
                            'success'
                        );
                        this.mantenimientoAgregado.emit();
                        form.resetForm();
                    },
                    error: (e) => {
                        Swal.fire(
                            'Error',
                            'No se pudo agregar el mantenimiento. '+e.error,
                            'error'
                        );
                    },
                });
            }
        }
    }

    compareRpuestos(r1: Repuesto, r2: Repuesto): boolean {
        return r1 && r2 ? r1.id === r2.id : r1 === r2;
    }

    onOpen(): void {
        this.cerrarFormulario.emit();
    }

    onUnidadMedidaChange(): void {
        this.mantenimiento.cantidadUnidadMedida = 0;
    }

    obtenerRepuestosDelEquipo(equipo: Equipo, tipo: TipoRepuesto): void {
        const idModelo = equipo.modeloEquipo.id;
        this.modeloService.cargarRepuestos(idModelo, tipo).subscribe({
            next: (data) => {
                this.repuestos = data;
            },
            error: (err) => {
                console.error('Error al cargar repuestos:', err);
            },
        });
    }

    onTipoRepuestoChange(): void {
        if (
            this.equipo?.modeloEquipo?.id &&
            this.tipoRepuestoSeleccionado != null
        ) {
            this.obtenerRepuestosDelEquipo(
                this.equipo,
                this.tipoRepuestoSeleccionado
            );
        }
    }

    onAddRepuesto() {
        if (
            this.repuestoSeleccionado.idRepuesto &&
            this.repuestoSeleccionado.cantidadUsada > 0
        ) {
            const repuesto = this.repuestos.find(
                (r) => r.id === this.repuestoSeleccionado.idRepuesto
            );

            if (!repuesto) {
                Swal.fire(
                    'Error',
                    'El repuesto seleccionado no existe en la lista',
                    'error'
                );
                return;
            }

            const repuestoMantenimiento = new RepuestoMantenimiento();
            repuestoMantenimiento.idRepuesto =
                this.repuestoSeleccionado.idRepuesto;
            repuestoMantenimiento.cantidadUsada =
                this.repuestoSeleccionado.cantidadUsada;
            repuestoMantenimiento.repuesto = repuesto;

            if (!this.mantenimiento.repuestosMantenimiento) {
                this.mantenimiento.repuestosMantenimiento = [];
            }

            this.mantenimiento.repuestosMantenimiento.push(
                repuestoMantenimiento
            );

            this.dataSourceRepuestos.data =
                this.mantenimiento.repuestosMantenimiento;
            this.repuestoSeleccionado = new RepuestoMantenimiento();
        } else {
            Swal.fire(
                'Error',
                'Debe seleccionar un repuesto y una cantidad válida',
                'error'
            );
        }
    }

    onRemoveRepuesto(index: number) {
        if (this.mantenimiento.repuestosMantenimiento) {
            this.mantenimiento.repuestosMantenimiento.splice(index, 1);
            this.dataSourceRepuestos.data =
                this.mantenimiento.repuestosMantenimiento;
        }
    }
}
