import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import * as L from 'leaflet';
import { EquipoDashboardDTO } from '../../../models/DTO/EquipoDashboardDTO';

@Component({
    selector: 'mapa',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnChanges {
    private map: L.Map | undefined;
    private overlayControl: L.Control.Layers | undefined;
    private baseMaps: Record<string, L.TileLayer> = {};
    private markerLayer = L.layerGroup(); // Capa para todos los marcadores

    @Input() equiposDTO: EquipoDashboardDTO[] = [];

    ngOnInit(): void {
        this.cargarMapasBase();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.map && this.equiposDTO && this.equiposDTO.length > 0) {
            this.cargarEquiposAlMapa();
        }
    }

    private cargarMapasBase(): void {
        const osm = L.tileLayer(
            'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=iSUENjx5EjDEEMY8VEuT',
            {
                attribution: '© MapTiler © OpenStreetMap contributors',
            }
        );
        
        const IDEuy = L.tileLayer.wms(
            'https://mapas.ide.uy/geoserver-raster/ortofotos/wms',
            {
                layers: 'ortofoto_nacional',
                format: 'image/png',
                version: '1.1.1',
                attribution: '&copy; IDEuy',
            }
        );

        const IGM = L.tileLayer.wms(
            'https://wms.igm.gub.uy/geoserver/PCN50KHD_COMPLETO/wms',
            {
                layers: [
                    'Bloque_SE',
                    'Bloque_SO',
                    'Bloque_NE',
                    'Bloque_NO',
                ].join(),
                attribution: '&copy; Instituto Geográfico Militar',
            }
        );

        const IGM250 = L.tileLayer.wms(
            'https://wms.igm.gub.uy/geoserver/PCN250/wms',
            {
                layers: [
                    '21H-10_Mercedes',
                    '21H-11_Durazno',
                    '21H-12_Treinta_y_Tres',
                    '21H-14_Colonia',
                    '21H-15_Montevideo',
                    '21H-16_Punta_del_este',
                    '21H-6_Paysandú',
                    '21H-7_Paso_de_los_Toros',
                    '21H-8_Melo',
                    '21J-1_Bella_Unión',
                    '21J-2_Rivera',
                    '21J-3_Salto',
                    '21J-4_Tacuarembo',
                    '21J-5_Vichadero',
                    '22H-13_Chuy',
                    '22H-17_Castillos',
                    '22H-9_Rio_Branco',
                ].join(),
                attribution: '&copy; Instituto Geográfico Militar',
            }
        );

        this.map = L.map('map', {
            center: [-32.82, -56.4],
            zoom: 7,
            minZoom: 7,
            maxZoom: 18,
            layers: [osm, this.markerLayer], // agrego la capa de marcadores desde inicio
        });

        this.baseMaps = {
            OpenStreetMap: osm,
            IDEuy: IDEuy,
            PCN50: IGM,
            PCN250: IGM250,
        };

        this.overlayControl = L.control
            .layers(this.baseMaps, { Equipos: this.markerLayer })
            .addTo(this.map);
    }

    private cargarEquiposAlMapa(): void {
        if (!this.map) return;

        const unidadColores: Record<string, string> = {};
        const colores = [
            'red',
            'blue',
            'green',
            'orange',
            'purple',
            'brown',
            'darkred',
            'cadetblue',
        ];
        let colorIndex = 0;

        // Filtrar equipos válidos
        const equiposValidos = this.equiposDTO.filter(
            (e) => e.latitud && e.longitud && e.unidad
        );

        // Función para calcular radio dinámico según zoom
        const getRadioAgrupamiento = () => {
            const zoom = this.map!.getZoom();
            return 0.0005 * (18 - zoom + 1); // más zoom = radio menor
        };

        // Agrupar equipos cercanos
        const agruparEquipos = () => {
            const grupos: {
                lat: number;
                lng: number;
                equipos: EquipoDashboardDTO[];
            }[] = [];
            const radio = getRadioAgrupamiento();

            equiposValidos.forEach((equipo) => {
                if (!equipo.unidad) return;
                if (!unidadColores[equipo.unidad]) {
                    unidadColores[equipo.unidad] =
                        colores[colorIndex % colores.length];
                    if (colorIndex < colores.length - 1) colorIndex++;
                }

                let agregado = false;
                for (let grupo of grupos) {
                    if (!equipo.latitud || !equipo.longitud) return;
                    const distancia = Math.sqrt(
                        Math.pow(equipo.latitud - grupo.lat, 2) +
                            Math.pow(equipo.longitud - grupo.lng, 2)
                    );
                    if (distancia < radio) {
                        grupo.equipos.push(equipo);
                        agregado = true;
                        break;
                    }
                }

                if (!agregado) {
                    if (
                        equipo.latitud !== undefined &&
                        equipo.longitud !== undefined
                    ) {
                        grupos.push({
                            lat: equipo.latitud,
                            lng: equipo.longitud,
                            equipos: [equipo],
                        });
                    }
                }
            });

            return grupos;
        };

        // Dibuja marcadores
        const dibujarGrupos = () => {
            this.markerLayer.clearLayers();

            const grupos = agruparEquipos();
            grupos.forEach((grupo) => {
                const color =
                    unidadColores[grupo.equipos[0]?.unidad ?? ''] ?? '#000';
                const icon = L.divIcon({
                    html:
                        grupo.equipos.length > 1
                            ? `<div style="background-color:${color}; width:28px; height:28px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px;">
                 ${grupo.equipos.length}
               </div>`
                            : `<div style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white;"></div>`,
                    className: '',
                    iconSize: [28, 28],
                });

                const popupHtml = grupo.equipos
                    .map(
                        (eq) =>
                            `<strong>${eq.tipoEquipo ?? ''} - ${
                                eq.matricula ?? ''
                            }</strong><br/>Unidad: ${eq.unidad}`
                    )
                    .join('<hr/>');

                const marker = L.marker([grupo.lat, grupo.lng], {
                    icon,
                }).bindPopup(popupHtml);

                // Si el grupo tiene más de 1 equipo, al hacer clic se hace zoom
                if (grupo.equipos.length > 1) {
                    marker.on('click', () => {
                        this.map!.setView(
                            [grupo.lat, grupo.lng]
                        );
                    });
                }

                this.markerLayer.addLayer(marker);
            });
        };

        dibujarGrupos();
        this.map!.on('zoomend', dibujarGrupos);
    }
}
