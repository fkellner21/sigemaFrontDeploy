import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Grado } from '../../../../models/grado';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'grado-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './grado-form.component.html',
})

export class GradoFormComponent {
  @Input() grado:Grado;
  @Output() openEventEmitter = new EventEmitter();  
  @Output() newGradoEventEmitter: EventEmitter<Grado>=new EventEmitter();

  constructor(){
    this.grado=new Grado();
  }

    onSubmit(gradoForm:NgForm):void{
    
    if(gradoForm.valid){
      this.newGradoEventEmitter.emit(this.grado);
    }
    gradoForm.reset();
    this.onOpen();
  }
    onOpen(){
    this.openEventEmitter.emit();
  }
}
