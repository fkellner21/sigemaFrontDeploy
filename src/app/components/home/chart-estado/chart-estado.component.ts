import { Component, Input, OnInit } from '@angular/core';
import { ApexChart, ApexPlotOptions, ApexStroke, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'chart-estado',
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: './chart-estado.component.html',
  styleUrl: './chart-estado.component.css'
})


export class ChartEstadoComponent implements OnInit{
  @Input() titulo:string = "";
  @Input() cantidad:number=0;
  chart: ApexChart = {
    height: 280,
    type: 'radialBar'
  };
  colors: string[] = [];
  labels: string[] = []
  
  constructor(){}

  ngOnInit(): void {
      switch (this.titulo) {
    case "Verde":
        this.colors = ['#11ad30ff'];
      break;
    case "Amarillo":
        this.colors = ['#d1d423ff'];
      break;
    case "Rojo":
        this.colors = ['#bd2217ff'];
      break;
    case "Negro":
        this.colors = ['#101110ff'];
      break;
  
    default:
      this.colors = ['#203ee6ff'];
      break;
    }

    this.labels= [this.titulo]
  }

  plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: {
        background: '#333',
        startAngle: -90,
        endAngle: 90
      },
      dataLabels: {
        name: {
          show: true,
          color: '#000',
          fontSize: '12px'
        },
        value: {
          fontSize: '12px',
          offsetY: 0,
          show: true,
          color: '#000'
        }
      }
    }
  };

  stroke: ApexStroke = {
    lineCap: 'butt'
  };


}
