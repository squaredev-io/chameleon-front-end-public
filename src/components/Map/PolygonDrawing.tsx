import React, { useState } from "react";
import { FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import useUI from "@/lib/hooks/useUI";

interface PolygonData {
  id: number;
  latlngs: L.LatLngExpression[];
}

const PolygonDrawing: React.FC = () => {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const { drawPolygonToggle } = useUI();

  const handleCreate = (e: any) => {
    const { layer } = e;
    const newPolygon = {
      id: polygons.length + 1,
      latlngs: layer.getLatLngs()[0]
    };
    setPolygons([...polygons, newPolygon]);
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const updatedPolygons = polygons.map(polygon =>
        polygon.id === layer.options.id
          ? { ...polygon, latlngs: layer.getLatLngs()[0] }
          : polygon
      );
      setPolygons(updatedPolygons);
    });
  };

  const handleDeleted = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      setPolygons(polygons.filter(polygon => polygon.id !== layer.options.id));
    });
  };

  return drawPolygonToggle ? (
    <FeatureGroup>
      <EditControl
        position="bottomright"
        onCreated={handleCreate}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={{
          rectangle: false,
          circle: false,
          marker: false,
          polyline: false
        }}
      />
      {polygons.map(polygon => (
        <Polygon key={polygon.id} positions={polygon.latlngs} />
      ))}
    </FeatureGroup>
  ) : null;
};

export default PolygonDrawing;
