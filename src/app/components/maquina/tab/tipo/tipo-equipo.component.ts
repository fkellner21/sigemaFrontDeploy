import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TipoEquipo } from '../../../../models/tipoEquipo';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { tipoEquipoService } from '../../../../services/tipoEquipo.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TipoFormComponent } from "./tipo-form/tipo-form.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'tipo-equipo',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, TipoFormComponent, CommonModule],
  templateUrl: './tipo-equipo.component.html',
  styleUrl: './tipo-equipo.component.css'
})
export class TipoEquipoComponent  {

  @Input() tiposDeEquipo:TipoEquipo[]=[];
  tipoEquipoSelected:TipoEquipo = new TipoEquipo();
  open:boolean=false;
  dataSource!: MatTableDataSource<any>;
  @Input() isLoadingTipos = false
  @Output() actualizarTiposEventEmmiter = new EventEmitter();

  constructor(private service:tipoEquipoService, public authservice:AuthService){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiposDeEquipo'] && this.tiposDeEquipo) {
      this.dataSource = new MatTableDataSource(this.tiposDeEquipo);
    }
  }
  refresh():void{
    this.actualizarTiposEventEmmiter.emit();
  }

  addTipoEquipo(tipo:TipoEquipo){
    if(tipo.id>0){ //es una modificacion
      tipo.codigo = tipo.codigo.toUpperCase();
      this.service.edit(tipo.id, tipo).subscribe({
      next: (resp) => {
        Swal.fire({
        title: "Editado!",
        text: "Tipo de equipo actualizado correctamente!",
        icon: "success"
      });
      //refresh de datos
      this.refresh();
    },
    error: (err) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo editar el tipo de equipo: \n"+ err.error,
        icon: "error"
      });
      this.refresh();
    }
  });
    }else{
      //peticion al back
      tipo.codigo=tipo.codigo.toUpperCase();
      this.service.addNew(tipo).subscribe({next:(resp)=>{
        Swal.fire({
          title: "Guardado!",
          text: "Tipo de equipo guardado con éxito!",
          icon: "success"
        });
        //refresh de datos
        this.refresh();
      },
      error:(err)=>{
        Swal.fire({
          title: "Error",
          text: "No se pudo agregar el tipo de equipo: \n"+ err.error,
          icon: "error"
        });
        //refresh de datos
        this.refresh();
      }
    });
    }
  }

   setNew(){
     this.tipoEquipoSelected=new TipoEquipo();
     this.open=true;
   }

  setOpen(){
    this.open=!this.open;
    this.refresh();
  }

  displayedColumns: string[] = [ 'Codigo', 'Descripcion','Tarea', 'Modificar'];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setSelectedTipo(tipoEquipo:TipoEquipo) {
  this.tipoEquipoSelected=tipoEquipo;
  this.setOpen();
  }

}

