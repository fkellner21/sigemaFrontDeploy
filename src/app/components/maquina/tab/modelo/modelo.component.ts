import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { modeloEquipo } from '../../../../models/modeloEquipo';
import { modeloService } from '../../../../services/modelo.service';
import { ModeloFormComponent } from './modelo-form/modelo-form.component';
import { Marca } from '../../../../models/marca';
import { TipoEquipo } from '../../../../models/tipoEquipo';
import { DocumentoFormComponent } from './documento-form/documento-form.component';
import { CommonModule } from '@angular/common';
import { ListaRepuestosDeModeloComponent } from './lista-repuestos-de-modelo/lista-repuestos-de-modelo.component';
import { ListaEquiposDeModeloComponent } from './lista-equipos-de-modelo/lista-equipos-de-modelo.component';
import { TipoRepuesto } from '../../../../models/enum/TipoRepuesto';
import { AuthService } from '../../../../services/auth.service';
import { SeviceModeloComponent } from "./sevice-modelo/sevice-modelo.component";


@Component({
  selector: 'modelo',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    ModeloFormComponent,
    DocumentoFormComponent,
    CommonModule,
    ListaRepuestosDeModeloComponent,
    ListaEquiposDeModeloComponent,
    SeviceModeloComponent
],
  templateUrl: './modelo.component.html',
  styleUrl: './modelo.component.css',
})
export class ModeloComponent {
  @Input() tipos: TipoEquipo[] = [];
  @Input() marcas: Marca[] = [];
  @Input() isLoadingModelos = false;
  @Output() actualizarModelosEventEmmiter = new EventEmitter();

  @Input() modelos: modeloEquipo[] = [];
  modeloSelected: modeloEquipo = new modeloEquipo();
  tipoRepuestoSeleccionado: TipoRepuesto = TipoRepuesto.Pieza;
  open: boolean = false;
  dataSource!: MatTableDataSource<any>;
  
  modeloSeleccionadoId: number | null = null;
  abrirDocs: boolean = false;
  abrirRepuestos: boolean = false;
  abrirLubricantes: boolean = false;
  abrirEquipos: boolean = false;
  abrirService: boolean = false;

  constructor(private service: modeloService, public authservice:AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelos'] && this.modelos) {
      this.dataSource = new MatTableDataSource(this.modelos);
      this.dataSource.filterPredicate = (data: modeloEquipo, filter: string) => {
      const dataStr = `
        ${data.anio}
        ${data.modelo}
        ${data.capacidad}
        ${data.marca?.nombre}
        ${data.tipoEquipo?.codigo}
        ${data.frecuenciaUnidadMedida}
        ${data.frecuenciaTiempo}
      `.toLowerCase();

      return dataStr.includes(filter.trim().toLowerCase());
      };
    }
  }
  refresh(): void {
    this.actualizarModelosEventEmmiter.emit();
  }

  addModelo(modelo: modeloEquipo) {
    if (modelo.id > 0) {
      //es una modificacion
      this.service.edit(modelo.id, modelo).subscribe({
        next: (resp) => {
          Swal.fire({
            title: 'Editado!',
            text: 'Modelo de equipo actualizado correctamente!',
            icon: 'success',
          });
          //refresh de datos
          this.refresh();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo editar este modelo de equipo. ' + err.error,
            icon: 'error',
          });
          //refresh de datos
          this.refresh();
        },
      });
    } else {
      //peticion al back
      this.service.addNew(modelo).subscribe({
        next: (resp) => {
          Swal.fire({
            title: 'Guardado!',
            text: 'Modelo de equipo agregado con éxito!',
            icon: 'success',
          });
          //refresh de datos
          this.refresh();
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo agregar el modelo de equipo. ' + err.error,
            icon: 'error',
          });
        },
      });
    }
  }

  setNew() {
    this.modeloSelected = new modeloEquipo();
    this.open = true;
  }

  setOpen() {
    this.open = !this.open;
  }

  displayedColumns: string[] = [
    'Anio',
    'Marca',
    'Modelo',
    'Capacidad',
    'Tipo',
    'Mantenimiento',
    'VerEquipos',
    'VerRepuestos',
    'VerLubricantes',
    'VerDocumentos',
    'Modificar',
  ];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  } 

  setSelectedModelo(modelo: modeloEquipo) {
    this.modeloSelected = { ...modelo };
    this.setOpen();
  }

  abrirModalDocumentos(modelo: modeloEquipo) {
    this.modeloSelected = modelo;
    this.modeloSeleccionadoId = modelo.id;
    this.abrirDocs = true;
  }

  cerrarModal() {
    this.modeloSelected = new modeloEquipo();
    this.modeloSeleccionadoId = null;
    this.abrirDocs = false;
  }

  abrirModalRepuestos(modelo: modeloEquipo) {
    this.modeloSelected = modelo;
    this.modeloSeleccionadoId = modelo.id;
    this.tipoRepuestoSeleccionado = TipoRepuesto.Pieza;
    this.abrirRepuestos = true;
  }

  cerrarModalRepuestos() {
    this.modeloSelected = new modeloEquipo();
    this.modeloSeleccionadoId = null;
    this.abrirRepuestos = false;
  }

  abrirModalLubricantes(modelo: modeloEquipo) {
    this.modeloSelected = modelo;
    this.modeloSeleccionadoId = modelo.id;
    this.tipoRepuestoSeleccionado = TipoRepuesto.Lubricante;
    this.abrirLubricantes = true;
  }

  cerrarModalLubricantes() {
    this.modeloSelected = new modeloEquipo();
    this.modeloSeleccionadoId = null;
    this.abrirLubricantes = false;
  }
  abrirModalEquipos(modelo: modeloEquipo) {
    this.modeloSelected = modelo;
    this.modeloSeleccionadoId = modelo.id;
    this.abrirEquipos = true;
  }

  cerrarModalEquipos() {
    this.modeloSelected = new modeloEquipo();
    this.modeloSeleccionadoId = null;
    this.abrirEquipos = false;
  }

  abrirModalService(modelo: modeloEquipo){
    this.modeloSelected = modelo;
    this.modeloSeleccionadoId = modelo.id;
    this.abrirService = true;
  }

  cerrarModalService(){
    this.refresh();
    this.modeloSelected = new modeloEquipo();
    this.modeloSeleccionadoId = null;
    this.abrirService = false;
  }
}
