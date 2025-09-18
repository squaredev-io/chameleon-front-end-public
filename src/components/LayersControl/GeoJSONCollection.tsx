"use client";

import { GeoJSON } from "react-leaflet";
import ReactDOM from "react-dom/client";
import React, { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { Feature, FeatureCollection } from "geojson";

type CustomPopup = {
  feature: Feature;
  closePopup: () => void;
  onClick?: (emailTo: string, feature: Feature) => void;
};

const CustomPopup: FC<CustomPopup> = ({ feature, closePopup, onClick }) => {
  const [email, setEmail] = useState("");

  return (
    <div>
      <h3 className="font-bold">Feature Details</h3>
      {feature.properties
        ? Object.entries(feature.properties).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))
        : null}
      {onClick && (
        <>
          <span className="w-full mt-2 block">Send feature details to email:</span>
          <input
            className="w-full mt-2 p-2"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="w-full mt-2 py-2 p-2 rounded bg-slate-100 disabled:text-slate-500"
            disabled={!email}
            onClick={() => {
              if (onClick) {
                onClick(email, feature);
              }
              closePopup();
            }}
          >
            Send
          </button>
        </>
      )}
    </div>
  );
};

const bindCustomPopup = (children: React.ReactNode) => {
  const container = document.createElement("div");
  ReactDOM.createRoot(container).render(children);
  return container;
};

interface GeoJSONCustomSchema extends FeatureCollection {
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
  name?: string;
}

export type GeoJSONOptions = {
  index?: number;
  color: string;
  weight: number;
  opacity: number;
  fillColor: string;
  fillOpacity: number;
};

export type GeoJSONCollectionProps = {
  layer: {
    name: string;
    geoJsonData: GeoJSONCustomSchema;
  };
  layerRefs: any;
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>;
  setLayerRefs: Dispatch<SetStateAction<any>>;
  // setLayerRefs: Dispatch<SetStateAction<Record<string, L.TileLayer | L.GeoJSON | null>>>;
  options?: GeoJSONOptions | GeoJSONOptions[];
  onClick?: (emailTo: string, feature: Feature) => void;
};

const GeoJSONCollection: FC<GeoJSONCollectionProps> = (
  {
    layer,
    layerRefs,
    setLayerRefs,
    options,
    onClick
  }
) => {
  let index = 0;
  const geoJsonLayerRef = useRef<any>(null);
  // const geoJsonLayerRef = useRef<L.TileLayer | L.GeoJSON | null>(null);
  const hasTriggeredEvent = useRef<boolean>(false);

  useEffect(() => {
    if (geoJsonLayerRef && !layerRefs[layer.name]) {
      setLayerRefs(prev => ({ [layer.name]: geoJsonLayerRef.current, ...prev }));
    }
  }, [geoJsonLayerRef]);

  return (
    <GeoJSON
      ref={geoJsonLayerRef}
      key={`${JSON.stringify(
        layer.geoJsonData.crs
          ? layer.geoJsonData?.crs.properties.name
          : layer.geoJsonData.name
      )}${Math.random()}`}
      eventHandlers={{
        add: () => {
          // This event fires when the layer is added to the map - geoJson is added instead of loaded like a tile layer
          if (!hasTriggeredEvent.current && geoJsonLayerRef) {
            const customEvent = new CustomEvent("tileLayerReady", {
              detail: { layerName: layer.name }
            });
            console.log(`Fired custom "tileLayerReady" event for layer: ${layer.name}`);
            document.dispatchEvent(customEvent);
            hasTriggeredEvent.current = true;
          }
        },
        remove: () => {
          // When layer is removed, reset the flag so event can fire again next time
          console.log(`Layer "${layer.name}" removed from map, resetting event trigger flag`);
          hasTriggeredEvent.current = false;
        }
      }}
      data={layer.geoJsonData}
      onEachFeature={(feature, layer: any) => {
        let option;

        if (options && Array.isArray(options) && options.length) {
          option = options && options.find(entry => entry.index === index) || {};
        } else {
          option = options;
        }

        layer.options.color = option?.color || "black";
        layer.options.weight = option?.weight || 1;
        layer.options.opacity = option?.opacity || 1;
        layer.options.fillColor = option?.fillColor || "green";
        layer.options.fillOpacity = option?.fillOpacity || 0.3;

        layer.bindPopup(
          () =>
            bindCustomPopup(
              <CustomPopup
                feature={feature}
                closePopup={() => layer.closePopup()}
                onClick={onClick || (() => {
                })}
              />
            ),
          { minWidth: 300 }
        );

        index++;
      }}
    />
  );
};

export default GeoJSONCollection;
