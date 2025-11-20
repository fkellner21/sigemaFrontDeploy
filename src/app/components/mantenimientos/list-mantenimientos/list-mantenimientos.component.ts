import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MantenimientoFormComponent } from '../../mantenimientos/mantenimiento-form/mantenimiento-form.component';
import { Equipo } from '../../../models/equipo';
import { Mantenimiento } from '../../../models/mantenimiento';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import Swal from 'sweetalert2';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-list-mantenimientos',
    standalone: true,
    imports: [CommonModule, MantenimientoFormComponent, MatTableModule],
    templateUrl: './list-mantenimientos.component.html',
    styleUrls: ['./list-mantenimientos.component.css'],
})
export class ListMantenimientosComponent implements OnInit {
    @Input() equipo!: Equipo;
    @Output() cerrar = new EventEmitter<void>();

    mostrarFormulario = false;
    nuevoMantenimiento: Mantenimiento = new Mantenimiento();
    mantenimientos: Mantenimiento[] = [];
    isLoading = false;
    displayedColumns: string[] = [
        'fecha',
        'detalle',
        'cantidad',
        'service',
        'acciones',
    ];
    dataSource = new MatTableDataSource<Mantenimiento>(this.mantenimientos);

    filtro = '';

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.filtro = filterValue;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    constructor(private mantenimientoService: MantenimientoService, public authservice: AuthService) {}

    ngOnInit() {
        this.cargarMantenimientos();
    }

    cargarMantenimientos() {
        if (this.equipo?.id) {
            this.isLoading = true;
            this.mantenimientoService
                .obtenerPorEquipo(this.equipo.id)
                .subscribe({
                    next: (mantenimientos) => {
                        this.mantenimientos = mantenimientos;
                        this.dataSource.data = this.mantenimientos;
                        this.isLoading = false;
                    },
                    error: (error) => {
                        this.isLoading = false;
                        Swal.fire(
                            'Error',
                            'No se pudo cargar los datos: ' + error.error,
                            'error'
                        );
                    },
                });
        } else {
            console.warn(
                'No se puede cargar mantenimientos: equipo o equipo.id es null/undefined'
            );
        }
    }

    cerrarModal() {
        this.cerrar.emit();
    }

    abrirFormulario(id: number) {
        this.mostrarFormulario = true;

        if (id && id > 0) {
            this.nuevoMantenimiento = {
                ...(this.mantenimientos.find((m) => m.id === id) ||
                    new Mantenimiento()),
            };

            this.nuevoMantenimiento.idEquipo = this.equipo?.id;
            this.nuevoMantenimiento.unidadMedida =
                this.equipo?.modeloEquipo?.unidadMedida;
        } else {
            this.nuevoMantenimiento = new Mantenimiento();
            this.nuevoMantenimiento.idEquipo = this.equipo?.id;
            this.nuevoMantenimiento.unidadMedida =
                this.equipo?.modeloEquipo?.unidadMedida;
            this.nuevoMantenimiento.fechaMantenimiento = new Date();
            this.nuevoMantenimiento.esService = false;
        }
    }

    cerrarFormulario() {
        this.mostrarFormulario = false;
    }

    recargarLista() {
        this.mostrarFormulario = false;
        this.cargarMantenimientos();
    }

    eliminarMantenimiento(id: number) {
        Swal.fire({
            title: '¿Eliminar mantenimiento?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.mantenimientoService.delete(id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Eliminado',
                            'Mantenimiento eliminado correctamente.',
                            'success'
                        );
                        this.cargarMantenimientos();
                    },
                    error: (err) => {
                        Swal.fire(
                            'Error',
                            'No se pudo eliminar: ' + err.error,
                            'error'
                        );
                    },
                });
            }
        });
    }
}
