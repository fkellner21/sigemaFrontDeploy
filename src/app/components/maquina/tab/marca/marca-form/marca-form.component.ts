import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Marca } from '../../../../../models/marca';

@Component({
  selector: 'marca-form',
  imports: [FormsModule],
  templateUrl: './marca-form.component.html',
  styleUrl: './marca-form.component.css'
})
export class MarcaFormComponent {
  @Input() marca:Marca;
  @Output() openEventEmitter = new EventEmitter();  
  @Output() newMarcaEventEmitter: EventEmitter<Marca>=new EventEmitter();

  constructor(){
    this.marca=new Marca();
  }

    onSubmit(marcaForm:NgForm):void{
    
    if(marcaForm.valid){
      this.newMarcaEventEmitter.emit(this.marca);
    }
    marcaForm.reset();
    this.onOpen();
  }
    onOpen(){
    this.openEventEmitter.emit();
  }
}
