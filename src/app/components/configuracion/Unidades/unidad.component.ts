import { Component, EventEmitter, Output } from '@angular/core';
import { Unidad } from '../../../models/Unidad';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UnidadService } from '../../../services/unidad.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UnidadFormComponent } from './unidad-form/unidad-form.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UnidadEmailService } from '../../../services/unidad-email.service';
import { UnidadEmail } from '../../../models/UnidadEmail';

@Component({
  selector: 'unidad',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, UnidadFormComponent, CommonModule],
  templateUrl: './unidad.component.html',
  styleUrl: './unidad.component.css'
})
export class UnidadComponent {

  @Output() unidadesActualizadas = new EventEmitter<void>();

  unidades:Unidad[]=[];
  unidadSelected:Unidad = new Unidad();
  open:boolean=false;
  dataSource!: MatTableDataSource<any>;
  isLoading:boolean=false;
  


  constructor(private service:UnidadService, public authservice:AuthService, private unidadEmailService: UnidadEmailService,){}

  ngOnInit(): void {
    this.refresh();
  }

  refresh():void{
    this.isLoading=true;
    this.service.findAll().subscribe((unidad: Unidad[]) => {
    this.unidades = unidad;
    this.dataSource = new MatTableDataSource(this.unidades);
    this.isLoading=false;
    });
  }

  addUnidad(unidad:Unidad){
    if(unidad.id>0){ //es una modificacion
      this.service.edit(unidad.id, unidad).subscribe({
        next: (resp:Unidad) => {
          Swal.fire({
        title: "Editado!",
        text: "Unidad actualizada correctamente!",
        icon: "success"
      });
      //refresh de datos
      this.refresh();
      this.unidadesActualizadas.emit();
    },
    error: (err:any) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo editar la unidad. "+err.error,
        icon: "error"
      });
      //refresh de datos
      this.refresh();
    }
  });
    }else{
      //peticion al back
      this.service.addNew(unidad).subscribe({next:(resp: Unidad)=>{
        Swal.fire({
          title: "Guardado!",
          text: "Unidad agregada con éxito!",
          icon: "success"
        });
        //refresh de datos
        this.refresh();
        this.unidadesActualizadas.emit();
      },
      error:(err:any)=>{
        Swal.fire({
          title: "Error",
          text: "No se pudo agregar la unidad. "+ err.error,
          icon: "error"
        });
        this.refresh();
      }
    });
    }
  }

  setNew(){
    this.unidadSelected=new Unidad();
    this.open=true;
  }

  setOpen(){
    this.open=!this.open;
    this.refresh();
  }

 displayedColumns: string[] = ['Nombre', 'EsGranUnidad', 'Modificar', 'AgregarMail', 'VerEmails'];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setSelectedUnidad(unidad:Unidad) {
  this.unidadSelected=unidad;
  this.setOpen();
  }

  abrirAgregarMail(unidad: Unidad) {
  Swal.fire({
    title: 'Agregar email',
    input: 'email',
    inputLabel: `Ingrese el email para la unidad: ${unidad.nombre}`,
    inputPlaceholder: 'correo@ejemplo.com',
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un email';
      }
      return null;
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      this.unidadEmailService.addEmail(unidad.id!, result.value).subscribe({
        next: () => {
          Swal.fire('¡Agregado!', 'El email fue agregado correctamente.', 'success');
        },
        error: (error) => {
          Swal.fire('Error', error.error || 'No se pudo agregar el email.', 'error');
        }
      });
    }
  });
}

modalEmailsAbierto = false;
unidadConEmails: Unidad | null = null;
listaEmails: UnidadEmail[] = [];

abrirEmailsModal(unidad: Unidad) {
  this.unidadConEmails = unidad;
  this.unidadEmailService.getEmailsByUnidadId(unidad.id).subscribe({
    next: (emails) => {
      this.listaEmails = emails;
      this.modalEmailsAbierto = true;
    },
    error: () => {
      this.listaEmails = [];
      this.modalEmailsAbierto = true;
    }
  });
}

cerrarEmailsModal() {
  this.modalEmailsAbierto = false;
  this.listaEmails = [];
  this.unidadConEmails = null;
}

borrarEmail(emailId: number) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el email.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.unidadEmailService.deleteEmail(emailId).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El email fue eliminado correctamente.', 'success');
          if (this.unidadConEmails?.id) {
            this.abrirEmailsModal(this.unidadConEmails); 
          }
        },
        error: () => {
          Swal.fire('Error', 'No se pudo eliminar el email.', 'error');
        }
      });
    }
  });
}




}