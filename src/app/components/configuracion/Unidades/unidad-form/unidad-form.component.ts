import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Unidad } from '../../../../models/Unidad';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'unidad-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './unidad-form.component.html',
  styleUrl: './unidad-form.component.css'
})

export class UnidadFormComponent {
  @Input() unidad:Unidad;
  @Output() openEventEmitter = new EventEmitter();  
  @Output() newUnidadEventEmitter: EventEmitter<Unidad>=new EventEmitter();

  constructor(){
    this.unidad=new Unidad();
  }

nuevoEmail: string = '';

onSubmit(unidadForm: NgForm): void {
  if (unidadForm.valid && this.nuevoEmail) {
    this.unidad.emails = [{ email: this.nuevoEmail }];
    this.newUnidadEventEmitter.emit(this.unidad);
    unidadForm.resetForm();
    this.nuevoEmail = '';
    this.onOpen();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, ingrese un email válido.',
      confirmButtonText: 'Aceptar'
    });
  }
}



    onOpen(){
    this.openEventEmitter.emit();
  }

  
}
