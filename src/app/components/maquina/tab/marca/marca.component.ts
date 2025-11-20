import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Marca } from '../../../../models/marca';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { marcaService } from '../../../../services/marca.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MarcaFormComponent } from './marca-form/marca-form.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'marca',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MarcaFormComponent, CommonModule],
  templateUrl: './marca.component.html',
  styleUrl: './marca.component.css'
})
export class MarcaComponent {

  @Output() marcasActualizadas = new EventEmitter<void>();
  @Input() isLoadingMarcas=false
  @Input() marcas:Marca[]=[];
  marcaSelected:Marca = new Marca();
  open:boolean=false;
  dataSource!: MatTableDataSource<any>;

  constructor(private service:marcaService, public authservice:AuthService){}

  refresh():void{
    this.marcasActualizadas.emit();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['marcas'] && this.marcas) {
      this.dataSource = new MatTableDataSource(this.marcas);
    }
  }

  addMarca(marca:Marca){
    if(marca.id>0){ //es una modificacion
      this.service.edit(marca.id, marca).subscribe({
      next: (resp) => {
        Swal.fire({
        title: "Editado!",
        text: "Marca actualizada correctamente!",
        icon: "success"
      });
      //refresh de datos
      this.refresh();
    },
    error: (err) => {
      Swal.fire({
        title: "Error",
        text: "No se pudo editar la marca. "+err.error,
        icon: "error"
      });
      //refresh de datos
      this.refresh();
    }
  });
    }else{
      //peticion al back
      this.service.addNew(marca).subscribe({next:(resp)=>{
        Swal.fire({
          title: "Guardado!",
          text: "Marca agregada con éxito!",
          icon: "success"
        });
        //refresh de datos
        this.refresh();
      },
      error:(err)=>{
        Swal.fire({
          title: "Error",
          text: "No se pudo agregar la marca. "+ err.error,
          icon: "error"
        });
        this.refresh();
      }
    });
    }
  }

   setNew(){
     this.marcaSelected=new Marca();
     this.open=true;
   }

  setOpen(){
    this.open=!this.open;
    this.refresh();
  }

  displayedColumns: string[] = [ 'Codigo', 'Nombre', 'Modificar'];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setSelectedMarca(marca:Marca) {
  this.marcaSelected=marca;
  this.setOpen();
  }
}
