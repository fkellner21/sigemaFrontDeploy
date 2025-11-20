import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Repuesto } from '../../../../../models/Repuesto';
import { modeloService } from '../../../../../services/modelo.service';
import { TipoRepuesto } from '../../../../../models/enum/TipoRepuesto';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RepuestoFormComponent } from '../repuesto-form/repuesto-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'lista-repuestos-de-modelo',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, CommonModule, RepuestoFormComponent],
  templateUrl: './lista-repuestos-de-modelo.component.html',
  styleUrl: './lista-repuestos-de-modelo.component.css'
})

export class ListaRepuestosDeModeloComponent implements OnInit{
  @Input() modeloId: number | null=null;
  @Input() tipoRepuesto: TipoRepuesto = TipoRepuesto.Pieza;
  @Output() newRepuestoEventEmitter:EventEmitter<Repuesto>=new EventEmitter()
  repuestos!:Array<Repuesto>;
  isLoading:boolean=false;
  dataSource = new MatTableDataSource<Repuesto>([]);
  open:boolean=false;
  repuestoSelected:Repuesto=new Repuesto();
  tituloTipoRepuesto:string="Repuesto";

  constructor(private service:modeloService){}
  
  ngOnInit(): void {
    this.refresh()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipoRepuesto']) {
      if (this.tipoRepuesto === TipoRepuesto.Lubricante) {
        this.tituloTipoRepuesto = 'Lubricante';
        this.repuestoSelected.tipo = TipoRepuesto.Lubricante;
      } else {
        this.tituloTipoRepuesto = 'Repuesto';
        this.repuestoSelected.tipo = TipoRepuesto.Pieza;
      }
      this.refresh();
    }
  }

  refresh():void{
    this.isLoading=true;
    this.service.cargarRepuestos(this.modeloId??0, this.tipoRepuesto).subscribe(repuestos=>{
      this.repuestos=repuestos;
      this.dataSource=new MatTableDataSource(repuestos);
      this.isLoading=false;
    })
  }

  displayedColumns: string[] = [
  'codigo',
  'nombre',
  'cantidad',
  'observaciones',
  'acciones'
  ];
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  editarRepuesto(repuesto:Repuesto){
    this.repuestoSelected={ ...repuesto };
    this.repuestoSelected.idModelo=this.modeloId??0;
    this.open=true;
    //abre el modal de repuestos
  }

  setNew(){
    this.repuestoSelected=new Repuesto();
    this.repuestoSelected.tipo=this.tipoRepuesto;
    this.repuestoSelected.idModelo=this.modeloId??0;
    this.open=true;
  }
  addRepuesto(repuesto:Repuesto){
    let titulo: string = "Repuesto";

    if (repuesto.tipo === TipoRepuesto.Lubricante) {
      titulo = "Lubricante";
    }
    if (repuesto.tipo === TipoRepuesto.Pieza) {
      titulo = "Repuesto";
    }
   if(repuesto.id>0){ //es una modificacion
      this.service.editarRepuesto(repuesto).subscribe({
          
      next: (resp) => {
        Swal.fire({
        title: "Editado!",
        text: titulo + " actualizado correctamente!",
        icon: "success"
      });
      //refresh de datos
      this.refresh();
    },
    error: (err) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo editar el " + titulo + ". " +err.error,
        icon: "error"
      });
      //refresh de datos
      this.refresh();
    }
  });
    }else{
      //peticion al back
      this.service.crearRepuesto(repuesto).subscribe({next:(resp)=>{
        Swal.fire({
          title: "Guardado!",
          text: titulo + " agregado con éxito!",
          icon: "success"
        });
        //refresh de datos
        this.refresh();
      },
      error:(err)=>{
        Swal.fire({
          title: "Error",
          text: "No se pudo agregar el " + titulo + ". " +err.error,
          icon: "error"
        });
        this.refresh();
      }
    });
    }
  }
  setOpen(){
    this.open=false;
  }
}
