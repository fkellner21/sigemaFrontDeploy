import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TipoEquipo } from '../../../../../models/tipoEquipo';
import { TareaEquipo } from '../../../../../models/enum/TareaEquipo';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'tipo-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './tipo-form.component.html',
  styleUrl: './tipo-form.component.css'
})
export class TipoFormComponent {
  @Input() tipoEquipo:TipoEquipo;
  @Output() openEventEmitter = new EventEmitter();  
  @Output() newTipoEventEmitter: EventEmitter<TipoEquipo>=new EventEmitter();
  tareasEnum=TareaEquipo;
  tareas = Object.keys(this.tareasEnum);
  

  constructor(){
    this.tipoEquipo=new TipoEquipo();
  }

    onSubmit(tipoForm:NgForm):void{
    
    if(tipoForm.valid){
      this.newTipoEventEmitter.emit(this.tipoEquipo);
    }
    tipoForm.reset();
    this.onOpen();
  }
    onOpen(){
    this.openEventEmitter.emit();
  }
}
