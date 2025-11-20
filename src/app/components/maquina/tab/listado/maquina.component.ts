import {
    Component,
    EventEmitter,
    input,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Equipo } from '../../../../models/equipo';
import { MaquinaService } from '../../../../services/equipo.service';
import { modeloEquipo } from '../../../../models/modeloEquipo';
import { TipoEquipo } from '../../../../models/tipoEquipo';
import { Marca } from '../../../../models/marca';
import Swal from 'sweetalert2';

import { MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MaquinaFormComponent } from './maquina-form/maquina-form.component';
import { AuthService } from '../../../../services/auth.service';
import { ListMantenimientosComponent } from '../../../mantenimientos/list-mantenimientos/list-mantenimientos.component';
import { ArchivoDTO } from '../../../../models/DTO/archivoDTO';

@Component({
    selector: 'maquina',
    imports: [
        CommonModule,
        FormsModule,
        MaquinaFormComponent,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSelectModule,
        MatOptionModule,
        ListMantenimientosComponent,
    ],
    templateUrl: './maquina.component.html',
    styleUrls: ['./maquina.component.css'],
})
export class MaquinaComponent {
    maquinaSelected: Equipo = new Equipo();
    open: boolean = false;
    dataSource!: MatTableDataSource<Equipo>;
    openMantenimientos: boolean = false;

    @Input() maquinas: Equipo[] = [];
    @Input() isLoadingMaquinas = false;
    @Input() modelos: modeloEquipo[] = [];
    @Input() tiposEquipo: TipoEquipo[] = [];
    @Input() marcas: Marca[] = [];

    @Output() actualizarMaquinasEventEmmiter: EventEmitter<void> =
        new EventEmitter();

    displayedColumns: string[] = [
        'unidad',
        'tipoMaquina',
        'matricula',
        'marca',
        'modelo',
        'estado',
        'capacidad',
        'tiempoDeTrabajo',
        'acciones',
    ];

    constructor(
        private service: MaquinaService,
        public authservice: AuthService
    ) {}

    refresh(): void {
        this.actualizarMaquinasEventEmmiter.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['maquinas'] && this.maquinas) {
            this.dataSource = new MatTableDataSource(this.maquinas);
        }

        this.dataSource.filterPredicate = (
            data: Equipo,
            filter: string
        ): boolean => {
            const filterValue = filter.trim().toLowerCase();

            // Crear un string con todos los campos relevantes para la búsqueda
            const dataStr = `
      ${data.unidad?.nombre || ''}
      ${data.modeloEquipo?.tipoEquipo?.codigo || ''}
      ${data.matricula || ''}
      ${data.modeloEquipo?.marca?.nombre || ''}
      ${data.modeloEquipo?.modelo || ''}
      ${data.estado || ''}
      ${data.modeloEquipo?.capacidad?.toString() || ''}
      ${data.cantidadUnidadMedida?.toString() || ''}
      ${data.modeloEquipo?.unidadMedida || ''}
    `.toLowerCase();

            return dataStr.includes(filterValue);
        };

        if (changes['modelos'] && this.modelos) {
            this.modelos = [...this.modelos];
        }

        if (changes['tiposEquipo'] && this.tiposEquipo) {
            this.tiposEquipo = [...this.tiposEquipo];
        }

        if (changes['marcas'] && this.marcas) {
            this.marcas = [...this.marcas];
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    setNew() {
        this.maquinaSelected = new Equipo();
        this.open = true;
    }

    setOpen() {
        this.open = !this.open;
    }

    setSelectedMaquina(maquina: Equipo) {
        this.maquinaSelected = maquina;
        this.setOpen();
    }

    abrirMantenimientos(maquina: Equipo) {
        this.maquinaSelected = maquina;
        this.openMantenimientos = true;
    }

    setOpenMantenimientos() {
        this.openMantenimientos = false;
    }

    addMaquina(maquina: Equipo) {
        if (maquina.id > 0) {
            this.service.edit(maquina.id, maquina).subscribe({
                next: (archivos) => {
                    if (archivos && archivos.length > 0) {
                        this.descargarArchivos(archivos);
                    }
                    Swal.fire(
                        'Editado',
                        'Máquina actualizada correctamente',
                        'success'
                    );
                    this.refresh();
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'No se pudo editar la máquina. ' + err.error,
                        'error'
                    );
                    this.refresh();
                },
            });
        } else {
            this.service.addNew(maquina).subscribe({
                next: (archivos) => {
                    if (archivos && archivos.length > 0) {
                        this.descargarArchivos(archivos);
                    }
                    Swal.fire(
                        'Guardado',
                        'Máquina agregada con éxito',
                        'success'
                    );
                    this.refresh();
                },
                error: (err) => {
                    Swal.fire(
                        'Error',
                        'No se pudo agregar la máquina. ' + err.error,
                        'error'
                    );
                    this.refresh();
                },
            });
        }
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

    deleteMaquina(id: number) {
        let texto = 'Se generará un trámite para dar de baja el equipo';

        if (
            this.authservice.getRol() === 'ROLE_ADMIN' ||
            this.authservice.getRol() === 'ROLE_BRIGADA'
        ) {
            texto = 'Esta acción no se puede deshacer';
        }

        Swal.fire({
            title: '¿Está seguro?',
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.delete(id).subscribe({
                    next: (archivos) => {
                        if (archivos && archivos.length > 0) {
                            this.descargarArchivos(archivos);
                        }

                        if (
                            this.authservice.getRol() === 'ROLE_ADMIN' ||
                            this.authservice.getRol() === 'ROLE_BRIGADA'
                        ) {
                            Swal.fire(
                                'Eliminado',
                                'La máquina fue eliminada, y se generó un trámite informativo',
                                'success'
                            );
                        } else {
                            Swal.fire(
                                'Trámite generado',
                                'Se generó un trámite para dar de baja el equipo',
                                'success'
                            );
                        }

                        this.refresh();
                    },
                    error: (err) => {
                        if (
                            this.authservice.getRol() === 'ROLE_ADMIN' ||
                            this.authservice.getRol() === 'ROLE_BRIGADA'
                        ) {
                            Swal.fire(
                                'Error',
                                'No se pudo eliminar la máquina. ' + err.error,
                                'error'
                            );
                        } else {
                            Swal.fire(
                                'Error',
                                'No se pudo generar el trámite para dar de baja el equipo. ' +
                                    err.error,
                                'error'
                            );
                        }
                    },
                });
            }
        });
    }
}
