"use client";

import { TileLayer } from "react-leaflet";
import React, { Dispatch, FC, SetStateAction, useEffect, useRef } from "react";

export type TileLayerCollectionProps = {
  layer: {
    name: string;
    rasterUrl: string;
  };
  layerRefs: any;
  setLayerRefs: Dispatch<SetStateAction<any>>;
  maxLayerZoom: number;
  minLayerZoom: number;
};

const TileLayerCollection: FC<TileLayerCollectionProps> = (
  {
    layer,
    layerRefs,
    setLayerRefs,
    maxLayerZoom,
    minLayerZoom
  }) => {
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    if (tileLayerRef) {
      if (!layerRefs[layer.name]) {
        setLayerRefs(prev => ({ [layer.name]: tileLayerRef.current, ...prev }));
      }
    }
  }, [tileLayerRef]);

  return (
    <TileLayer
      ref={tileLayerRef}
      key={layer.name}
      url={layer.rasterUrl}
      pane="overlayPane"
      maxZoom={maxLayerZoom}
      minZoom={minLayerZoom}
      noWrap={true}
      eventHandlers={{
        load: () => {
          // This event fires when the layer is loaded to the map
          if (tileLayerRef) {
            const customEvent = new CustomEvent("tileLayerReady", {
              detail: { layerName: layer.name }
            });
            console.log(`Fired custom "tileLayerReady" event for layer: ${layer.name}`);
            document.dispatchEvent(customEvent);
          }
        }
      }}
    />
  );
};


export default TileLayerCollection;
