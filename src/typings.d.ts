import * as L from 'leaflet';

declare module 'leaflet' {
    namespace markerClusterGroup {
        interface Options extends L.LayerOptions {
            chunkedLoading?: boolean;
        }
    }
    function markerClusterGroup(
        options?: markerClusterGroup.Options
    ): L.MarkerClusterGroup;
}
