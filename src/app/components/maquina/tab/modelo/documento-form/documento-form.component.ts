import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { modeloService } from '../../../../../services/modelo.service';
import { DocumentoModeloEquipo } from '../../../../../models/DocumentoModeloEquipo';
import { environment } from '../../../../../../environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'documento-form',
    imports: [CommonModule],
    templateUrl: './documento-form.component.html',
    styleUrl: './documento-form.component.css',
})
export class DocumentoFormComponent implements OnInit {
    @Input() modeloId: number | null = null;
    selectedFile: File | null = null;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    isLoading: boolean = false;
    documentos: DocumentoModeloEquipo[] = [];

    constructor(
        private http: HttpClient,
        private service: modeloService,
        public authservice: AuthService
    ) {}

    ngOnInit(): void {
        this.cargarDocumentos();
    }

    cargarDocumentos() {
        this.isLoading = true;
        if (this.modeloId != null) {
            this.service.cargarDocumentos(this.modeloId).subscribe({
                next: (data) => (this.documentos = data),
                error: (err) =>
                    console.error('Error al cargar documentos', err),
                complete: () => {
                    this.isLoading = false;
                },
            });
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    subirDocumento() {
        if (!this.selectedFile) return;

        const formData = new FormData();
        formData.append('archivo', this.selectedFile);

        if (this.modeloId != null) {
            this.service.subirDocumento(this.modeloId, formData).subscribe({
                next: () => {
                    Swal.fire({
                        title: 'Agregado!',
                        text: 'Documento ingresado correctamente!',
                        icon: 'success',
                    });
                    this.selectedFile = null;
                    this.fileInput.nativeElement.value = '';
                    this.cargarDocumentos();
                },
                error: (err) => {
                    console.log(err);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo subir el documento. ' + err.error,
                        icon: 'error',
                    });
                },
            });
        }
    }

    getDocumento(id: number): string {
        return `${environment.apiUrl}/api/modelosEquipo/documentos/${id}/descargar`;
    }
    descargarDocumento(id: number, nombre: string) {
        this.http.get(`${environment.apiUrl}/api/modelosEquipo/documentos/${id}/descargar`, {
            headers: {
            Authorization: `Bearer ${this.authservice.getToken()}`
            },
            responseType: 'blob'
        }).subscribe({
            next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombre;
            a.click();
            window.URL.revokeObjectURL(url);
            },
            error: (err) => {
            console.error('Error al descargar documento', err);
            Swal.fire('Error', 'No se pudo descargar el documento', 'error');
            }
        });
    }

    eliminarDocumento(id: number) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el documento del sistema.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                this.service.eliminarDocumento(id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Eliminado',
                            'Documento eliminado correctamente.',
                            'success'
                        );
                        this.cargarDocumentos();
                    },
                    error: (err) => {
                        Swal.fire(
                            'Error',
                            'No se pudo eliminar el documento. ' +
                                err.error?.error,
                            'error'
                        );
                    },
                });
            }
        });
    }
}
