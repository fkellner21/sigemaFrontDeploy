import { Component, EventEmitter, Input, Output } from '@angular/core';
import { modeloEquipo } from '../../../../../models/modeloEquipo';
import { Marca } from '../../../../../models/marca';
import { TipoEquipo } from '../../../../../models/tipoEquipo';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UnidadMedida } from '../../../../../models/enum/UnidadMedida';

@Component({
    selector: 'modelo-form',
    imports: [FormsModule, CommonModule],
    templateUrl: './modelo-form.component.html',
    styleUrl: './modelo-form.component.css',
})
export class ModeloFormComponent {
    @Input() modeloEquipo: modeloEquipo;
    @Input() marcas: Marca[] = [];
    @Input() tiposEquipo: TipoEquipo[] = [];

    @Output() newModeloEventEmitter = new EventEmitter<modeloEquipo>();
    @Output() openEventEmitter = new EventEmitter();

    unidadesDeMedida = [
        { label: 'Kilómetros', value: UnidadMedida.KMs },
        { label: 'Horas de Trabajo', value: UnidadMedida.HT },
    ];

    constructor() {
        this.modeloEquipo = new modeloEquipo();
    }

    ngOnInit() {
        // Cuando abras el formulario y ya tengas las listas cargadas:
        if (this.modeloEquipo.marca) {
            const match = this.marcas.find(
                (m) => m.id === this.modeloEquipo.marca.id
            );
            if (match) this.modeloEquipo.marca = match;
        }

        if (this.modeloEquipo.tipoEquipo) {
            const match = this.tiposEquipo.find(
                (t) => t.id === this.modeloEquipo.tipoEquipo.id
            );
            if (match) this.modeloEquipo.tipoEquipo = match;
        }
    }

    onSubmit(form: NgForm): void {
        if (form.valid) {
            this.newModeloEventEmitter.emit(this.modeloEquipo);
            form.reset();
            this.onOpen();
        }
    }

    onOpen(): void {
        this.openEventEmitter.emit();
    }
    onUnidadMedidaChange(): void {
        this.modeloEquipo.frecuenciaUnidadMedida = 0;
    }
}
