import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Grado } from '../../../models/grado';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { gradoService } from '../../../services/grado.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GradoFormComponent } from './grado-form/grado-form.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'grado',
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        GradoFormComponent,
        CommonModule,
    ],
    templateUrl: './grado.component.html',
    styleUrl: './grado.component.css',
})
export class GradoComponent implements OnInit {
    @Input() isLoadingGrados = false;
    grados: Grado[] = [];
    gradoSelected: Grado = new Grado();
    open: boolean = false;
    dataSource!: MatTableDataSource<any>;

    constructor(private service: gradoService, public authservice:AuthService) {}
    ngOnInit(): void {
        this.refresh();
    }

    refresh(): void {
        this.isLoadingGrados = true;
        this.service.findAll().subscribe({
            next: (resp) => {
                this.grados = resp;
                this.dataSource = new MatTableDataSource(this.grados);
                this.isLoadingGrados = false;
            },
            error: (err) => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los grados. ' + err.error,
                    icon: 'error',
                });
                this.isLoadingGrados = false;
            },
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['grados'] && this.grados) {
            this.dataSource = new MatTableDataSource(this.grados);
        }
    }

    addGrado(grado: Grado) {
        if (grado.id > 0) {
            //es una modificacion
            this.service.edit(grado.id, grado).subscribe({
                next: (resp) => {
                    Swal.fire({
                        title: 'Editado!',
                        text: 'Grado actualizado correctamente!',
                        icon: 'success',
                    });
                    //refresh de datos
                    this.refresh();
                },
                error: (err) => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo editar el grado. ' + err.error,
                        icon: 'error',
                    });
                    //refresh de datos
                    this.refresh();
                },
            });
        } else {
            //peticion al back
            this.service.addNew(grado).subscribe({
                next: (resp) => {
                    Swal.fire({
                        title: 'Guardado!',
                        text: 'Grado agregado con éxito!',
                        icon: 'success',
                    });
                    //refresh de datos
                    this.refresh();
                },
                error: (err: any) => {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo agregar el grado. ' + err.error,
                        icon: 'error',
                    });
                    this.refresh();
                },
            });
        }
    }

    setNew() {
        this.gradoSelected = new Grado();
        this.open = true;
    }

    setOpen() {
        this.open = !this.open;
        this.refresh();
    }

    displayedColumns: string[] = ['Nombre', 'Modificar'];

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    setSelectedGrado(grado: Grado) {
        this.gradoSelected = grado;
        this.setOpen();
    }
}
