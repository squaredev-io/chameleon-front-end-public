import React, { ReactNode, useEffect } from "react";
import { ControlPosition } from "leaflet";
import { LayersControl, useMapEvents } from "react-leaflet";
import useUI from "@/lib/hooks/useUI";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";

export type LayerControlAndVisualizerLayer = {
  name: string;
  component: ReactNode;
};

type LayerSelectorAndVisualizerProps = {
  position: ControlPosition;
  collapsed: boolean;
  layers: LayerControlAndVisualizerLayer[];
};

const LayerSelectorAndVisualizer = ({ position, collapsed, layers = [] }: LayerSelectorAndVisualizerProps) => {
  const { changeAreNoneLayersChecked } = useUI();
  const { activeLayers, updateLayerStatus } = useLayerRegistry();

  // Hook to listen to when layers are added or removed
  useMapEvents({
    overlayadd(e) {
      updateLayerStatus(e.name, true);
    },
    overlayremove(e) {
      updateLayerStatus(e.name, false);
    }
  });

  useEffect(() => {
    changeAreNoneLayersChecked(activeLayers.length === 0);
  }, [activeLayers]);

  return (
    <LayersControl key={String(activeLayers)} position={position} collapsed={collapsed} sortLayers={false}>
      {
        layers.map((layer) => (
          <LayersControl.Overlay
            name={layer.name}
            key={layer.name}
            checked={!!activeLayers.find(activeLayer => activeLayer.layerName === layer.name)}
          >
            {layer.component}
          </LayersControl.Overlay>
        ))
      }
    </LayersControl>
  );
};

export default LayerSelectorAndVisualizer;
