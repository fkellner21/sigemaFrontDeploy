import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioFormComponent } from '../usuarios/form/usuario-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Rol } from '../../models/enum/Rol';
import Swal from 'sweetalert2';
import { UnidadService } from '../../services/unidad.service';
import { gradoService } from '../../services/grado.service';
import { Grado } from '../../models/grado';
import { Unidad } from '../../models/Unidad';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'usuarios',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        UsuarioFormComponent,
    ],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
    displayedColumns: string[] = [
        'Grado',
        'Nombre',
        'Cedula',
        'Unidad',
        'Rol',
        'acciones',
    ];
    dataSource: any[] = [];
    dataSourceOriginal: any[] = [];
    isLoading: boolean = false;

    mostrarFormulario: boolean = false;
    usuarioSeleccionado: any = {};
    roles!: { key: string; label: string }[];
    grados!: Grado[];
    unidades!: Unidad[];
    Rol = Rol;

    constructor(
        private usuarioService: UsuarioService,
        private unidadService: UnidadService,
        private gradoService: gradoService,
        public authservice: AuthService
    ) {}

    getRolLabel(key: any): string {
        return this.Rol[key as keyof typeof Rol] ?? key;
    }

    ngOnInit() {

        this.roles = Object.keys(Rol).map((key) => ({
            key: key,
            label: Rol[key as keyof typeof Rol],
        }));

        this.gradoService.findAll().subscribe({
            next: (resp) => {
                this.grados = resp;
            },
            error: (err) => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los grados. ' + err.error,
                    icon: 'error',
                });
            },
        });

        this.unidadService.findAll().subscribe({
            next: (resp) => {
                this.unidades = resp;
            },
            error: (err) => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar las unidades. ' + err.error,
                    icon: 'error',
                });
            },
        });

        this.cargarUsuarios();
    }

    cargarUsuarios() {
        this.isLoading = true;
        this.usuarioService.findAll().subscribe({
            next: (usuarios) => {
                this.dataSourceOriginal = usuarios; // guardo copia original
                this.dataSource = usuarios;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error cargando usuarios', err);
                this.isLoading = false;
            },
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
            .trim()
            .toLowerCase();

        if (!filterValue) {
            this.dataSource = this.dataSourceOriginal;
            return;
        }

        this.dataSource = this.dataSourceOriginal.filter((usuario) => {
            const nombre = usuario.nombreCompleto?.toLowerCase() ?? '';
            const cedula = usuario.cedula?.toLowerCase() ?? '';
            const unidad = usuario.unidad?.nombre?.toLowerCase() ?? '';
            const grado = usuario.grado?.nombre?.toLowerCase() ?? '';
            const rol = this.getRolLabel(usuario.rol)?.toLowerCase() ?? '';

            return (
                nombre.includes(filterValue) ||
                cedula.includes(filterValue) ||
                unidad.includes(filterValue) ||
                grado.includes(filterValue) ||
                rol.includes(filterValue)
            );
        });
    }

    abrirFormularioUsuario(usuario?: any) {
        this.usuarioSeleccionado = usuario ? { ...usuario } : {};
        this.mostrarFormulario = true;
    }

    cerrarFormulario() {
        this.mostrarFormulario = false;
    }

    guardarUsuario(usuario: any) {
        this.isLoading = true;

        const request$ = usuario.id
            ? this.usuarioService.edit(usuario.id, usuario)
            : this.usuarioService.addNew(usuario);

        request$.subscribe({
            next: () => {
                this.cargarUsuarios();
                this.cerrarFormulario();

                Swal.fire({
                    icon: 'success',
                    title: usuario.id
                        ? 'Usuario actualizado'
                        : 'Usuario/trámite creado',
                    text: usuario.id
                        ? 'El usuario ha sido actualizado correctamente.'
                        : 'El usuario ha sido creado/solicitado correctamente.',
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
                        'Ocurrió un error al guardar el usuario. ' + err.error,
                });
            },
        });
    }

    eliminarUsuario(id: number) {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.usuarioService.delete(id).subscribe({
                    next: () => {
                        if(this.authservice.getRol()=='ROLE_ADMINISTRADOR'||this.authservice.getRol()=='ROLE_BRIGADA'){
                            Swal.fire(
                                'Eliminado',
                                'El usuario fue eliminado',
                                'success'
                            );
                        }else{
                            Swal.fire(
                                'En proceso',
                                'Se generó un trámite solicitando la baja',
                                'success'
                            );
                        }
                        this.cargarUsuarios();
                    },
                    error: (err) => {
                        Swal.fire(
                            'Error',
                            'No se pudo eliminar el usuario. ' + err.error,
                            'error'
                        );
                    },
                });
            }
        });
    }
}
