import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ChartComponent, ApexChart, NgApexchartsModule, ApexXAxis, ApexAxisChartSeries, ApexPlotOptions, ApexFill, ApexDataLabels, ApexTooltip, ApexLegend } from 'ng-apexcharts';
import { EquipoDashboardDTO } from '../../../models/DTO/EquipoDashboardDTO';
import { TareaEquipo } from '../../../models/enum/TareaEquipo';
import { EstadoEquipo } from '../../../models/enum/EstadoEquipo';

@Component({
  selector: 'chart-capacidad',
  imports: [NgApexchartsModule],
  templateUrl: './chart-capacidad.component.html',
  styleUrl: './chart-capacidad.component.css'
})
export class ChartCapacidadComponent implements OnChanges {
  @Input() equiposDTO: EquipoDashboardDTO[] = [];

  chart: ApexChart = {
    type: 'bar',
    stacked: true,
    height: 300
  };

  xaxis: ApexXAxis = {
    categories: ["Corte", "Carga", "Acarreo", "Nivelación", "Compactación", "Otras"]
  };

series: ApexAxisChartSeries = [
  {
    name: 'Cargando...',
    data: []
  }
];


  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false
    }
  };

  fill: ApexFill = {
    opacity: 1
  };

  dataLabels: ApexDataLabels = {
    enabled: false
  };

  tooltip: ApexTooltip = {
    shared: true,
    intersect: false
  };

  legend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'center'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equiposDTO'] && this.equiposDTO?.length > 0) {
      this.generarSeries();
    }
  }

 generarSeries() {
  const quitarTildes = (texto: string): string =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

  const tareas = Object.values(TareaEquipo).map(quitarTildes);

  const capacidadOperativos: { [key: string]: number } = {};
  const capacidadNoOperativos: { [key: string]: number } = {};

  for (const tarea of tareas) {
    capacidadOperativos[tarea] = 0;
    capacidadNoOperativos[tarea] = 0;
  }

  for (const equipo of this.equiposDTO) {
    const tareaRaw = equipo.tareaEquipo;
    if (!tareaRaw) continue;

    const tarea = quitarTildes(tareaRaw);
    const capacidad = equipo.capacidad || 0;

    switch (equipo.estado) {
      case EstadoEquipo.Verde:
      case EstadoEquipo.Amarillo:
        if (capacidadOperativos.hasOwnProperty(tarea)) {
          capacidadOperativos[tarea] += capacidad;
        }
        break;
      case EstadoEquipo.Rojo:
      case EstadoEquipo.Negro:
        if (capacidadNoOperativos.hasOwnProperty(tarea)) {
          capacidadNoOperativos[tarea] += capacidad;
        }
        break;
    }
  }

  this.xaxis.categories = tareas;

  this.series = [
    {
      name: 'm3 Operativos (Verde/Amarillo)',
      data: tareas.map(t => capacidadOperativos[t]),
      color: '#318143a9'
    },
    {
      name: 'm3 No operativos (Rojo/Negro)',
      data: tareas.map(t => capacidadNoOperativos[t]),
      color: '#0000002f'
    }
  ];
}

}

