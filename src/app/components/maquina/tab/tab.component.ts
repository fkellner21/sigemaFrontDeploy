import {Component, OnInit} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { TipoEquipoComponent } from "./tipo/tipo-equipo.component";
import { MarcaComponent } from "./marca/marca.component";
import { ModeloComponent } from './modelo/modelo.component';
import { Marca } from '../../../models/marca';
import { TipoEquipo } from '../../../models/tipoEquipo';
import { marcaService } from '../../../services/marca.service';
import { tipoEquipoService } from '../../../services/tipoEquipo.service';
import { MaquinaService } from '../../../services/equipo.service';
import { MaquinaComponent } from './listado/maquina.component';

import { Equipo } from '../../../models/equipo';
import { modeloService } from '../../../services/modelo.service';
import { modeloEquipo } from '../../../models/modeloEquipo';

@Component({
  selector: 'tabEquipos',
  templateUrl: 'tab.component.html',
  styleUrls: ['tab.component.css'],
  imports: [MatTabsModule, TipoEquipoComponent, MarcaComponent, ModeloComponent, MaquinaComponent],
})
export class TabEquipos implements OnInit{

  marcas: Marca[] = [];
  tipos: TipoEquipo[] = [];
  maquinas: Equipo[] = [];
  modelos: modeloEquipo[] = [];
  isLoadingMaquinas:boolean = false;
  isLoadingModelos:boolean = false;
  isLoadingMarcas:boolean = false;
  isLoadingTipos:boolean = false;

constructor(
  private marcaService: marcaService,
  private tipoService: tipoEquipoService,
  private maquinaService: MaquinaService,
  private modeloService: modeloService
) {}


  ngOnInit(): void {
  this.loadMaquinas();
  this.loadMarcas();
  this.loadModelos();
  this.loadTipos();
  }

  loadTipos() {
    this.isLoadingTipos=true;
    this.tipoService.findAll().subscribe(data => {
    this.tipos = [...data];  //genera una copia de los datos para que note el cambio
    this.isLoadingTipos=false;
    });
  }

  loadMarcas() {
    this.isLoadingMarcas=true;
    this.marcaService.findAll().subscribe(data => {this.marcas = [...data]; this.isLoadingMarcas=false;});
  }

  loadMaquinas() {
    this.isLoadingMaquinas=true;
    this.maquinaService.findAll().subscribe(data => {this.maquinas = [...data]; this.isLoadingMaquinas=false;});
  }

  loadModelos() {
    this.isLoadingModelos=true;
    this.modeloService.findAll().subscribe(data => {this.modelos = [...data]; this.isLoadingModelos=false;});
  }
}