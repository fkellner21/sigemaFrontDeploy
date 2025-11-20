import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Repuesto } from '../../../../../models/Repuesto';
import { FormsModule, NgForm } from '@angular/forms';
import { TipoRepuesto } from '../../../../../models/enum/TipoRepuesto';

@Component({
  selector: 'repuesto-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './repuesto-form.component.html',
  styleUrl: './repuesto-form.component.css'
})
export class RepuestoFormComponent implements OnChanges {
  @Input() repuesto!: Repuesto;
  @Output() openEventEmitter = new EventEmitter();  
  @Output() newRepuestoEventEmitter: EventEmitter<Repuesto> = new EventEmitter();

  titulo: string = "repuesto";

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['repuesto'] && changes['repuesto'].currentValue) {
      if (this.repuesto.tipo === TipoRepuesto.Pieza) {
        this.titulo = "repuesto";
      } else if (this.repuesto.tipo === TipoRepuesto.Lubricante) {
        this.titulo = "lubricante";
      }
    }
  }

  onSubmit(repuestoForm: NgForm): void {
    if (repuestoForm.valid) {
      this.newRepuestoEventEmitter.emit(this.repuesto);
    }
    repuestoForm.reset();
    this.openEventEmitter.emit();
  }

  onOpen(): void {
    this.openEventEmitter.emit();
  }
}