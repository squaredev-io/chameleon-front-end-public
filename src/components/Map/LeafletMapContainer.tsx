import { LatLngExpression, MapOptions } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import useMapContext from "./useMapContext";
import useUI from "@/lib/hooks/useUI";
import { AppConfig } from "@/lib/AppConfig";
import Cesium from "@/components/Cesium/Cesium";
import { useEffect } from "react";

// ToDo: check if there's another tile layer provider that supports higher resolution and bigger zoom levels
const ESRI_WORLD_IMAGERY_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_WORLD_IMAGERY_ATTRIBUTION = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

const LeafletMapContainer: React.FC<{
  center: LatLngExpression;
  children: JSX.Element | JSX.Element[];
  zoom: number;
} & MapOptions> = ({ ...options }) => {
  const { map, setMap } = useMapContext();
  const {
    viewportInfo,
    digitalTwinToggle,
    layerZoomLevels,
    areNoneLayersChecked
  } = useUI();

  const viewportHeight = viewportInfo.viewportHeight;
  const viewportWidth = viewportInfo.viewportWidth;

  useEffect(() => {
    if (map) {
      if (areNoneLayersChecked) {
        map.setMaxZoom(AppConfig.maxZoom);
        map.setMinZoom(AppConfig.minZoom);
      } else {
        map.setMaxZoom(layerZoomLevels.maxZoom);
        map.setMinZoom(layerZoomLevels.minZoom);
      }
    }
  }, [map, areNoneLayersChecked, layerZoomLevels]);

  return (
    <MapContainer
      ref={(e) => setMap && setMap(e || undefined)}
      className="outline-0 text-white"
      style={{
        width: viewportWidth ? viewportWidth - AppConfig.ui.sideBarWidth : "100%",
        height: viewportHeight ? viewportHeight - AppConfig.ui.topBarHeight : "100%"
      }}
      {...options}
    >
      {
        !digitalTwinToggle && layerZoomLevels ? (
          <>
            <TileLayer
              key={`${layerZoomLevels.maxZoom}-${layerZoomLevels.minZoom}-${areNoneLayersChecked}`}  // Force re-render on zoom level changes
              attribution={ESRI_WORLD_IMAGERY_ATTRIBUTION}
              url={ESRI_WORLD_IMAGERY_URL}
              maxNativeZoom={AppConfig.maxZoom} // Max zoom supported by the tile layer provider
              minNativeZoom={AppConfig.minZoom} // Min zoom supported by the tile layer provider
              maxZoom={areNoneLayersChecked ? AppConfig.maxZoom : layerZoomLevels.maxZoom} // Max zoom supported by the (map) feature tile layer
              minZoom={areNoneLayersChecked ? AppConfig.minZoom : layerZoomLevels.minZoom} // Min zoom supported by the (map) feature tile layer
              crossOrigin="anonymous"
            />
            {options.children}
          </>
        ) : (
          <Cesium />
        )
      }
    </MapContainer>
  );
};

export default LeafletMapContainer;
