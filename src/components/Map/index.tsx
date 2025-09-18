"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import { AppConfig } from "@/lib/AppConfig";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import MapContextProvider from "./MapContextProvider";
import useLeafletWindow from "./useLeafletWindow";
import useMapContext from "./useMapContext";

const LocateButton = dynamic(
  () => import("./ui/LocateButton"),
  { loading: LoadingBalloon, ssr: false }
);
const LeafletMapContainer = dynamic(
  () => import("./LeafletMapContainer"),
  { loading: LoadingBalloon, ssr: false }
);
const PolygonDrawing = dynamic(
  () => import("./PolygonDrawing"),
  { loading: LoadingBalloon, ssr: false }
);
const LivestockManagement = dynamic(
  () => import("./bundles/LivestockManagement"),
  { loading: LoadingBalloon, ssr: false }
);
const AutomaticVinesDetection = dynamic(
  () => import("./bundles/AutomaticVinesDetection"),
  { loading: LoadingBalloon, ssr: false }
);
const CropGrowth = dynamic(
  () => import("./bundles/CropGrowth"),
  { loading: LoadingBalloon, ssr: false }
);
const CowLamenessDetection = dynamic(
  () => import("./bundles/CowLamenessDetection"),
  { loading: LoadingBalloon, ssr: false }
);
const HealthStatusOfVegetation = dynamic(
  () => import("./bundles/HealthStatusOfVegetation"),
  { loading: LoadingBalloon, ssr: false }
);
const SoilZonification = dynamic(
  () => import("./bundles/SoilZonification"),
  { loading: LoadingBalloon, ssr: false }
);
const AnimalBehavior = dynamic(
  () => import("./bundles/AnimalBehavior"),
  { loading: LoadingBalloon, ssr: false }
);
const QuantificationOfLogs = dynamic(
  () => import("./bundles/QuantificationOfLogs"),
  { loading: LoadingBalloon, ssr: false }
);
const ForestryResilienceAnalytics = dynamic(
  () => import("./bundles/ForestryResilienceAnalytics"),
  { loading: LoadingBalloon, ssr: false }
);
const TimberStackInventory = dynamic(
  () => import("./bundles/TimberStackInventory"),
  { loading: LoadingBalloon, ssr: false }
);

type MapContainerChildProps = {
  isLoading: boolean;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  layerRefs: any;
  setLayerRefs: Dispatch<SetStateAction<any>>;
};

const LeafletMapContainerChild = ({ isLoading, mapContainerRef, layerRefs, setLayerRefs }: MapContainerChildProps) =>
  !isLoading ? (
    <>
      <LocateButton />
      <PolygonDrawing />
      <LivestockManagement mapContainerRef={mapContainerRef} />
      <AutomaticVinesDetection mapContainerRef={mapContainerRef} layerRefs={layerRefs} setLayerRefs={setLayerRefs} />
      <CowLamenessDetection mapContainerRef={mapContainerRef} />
      <CropGrowth mapContainerRef={mapContainerRef} layerRefs={layerRefs} setLayerRefs={setLayerRefs} />
      <HealthStatusOfVegetation mapContainerRef={mapContainerRef} layerRefs={layerRefs} setLayerRefs={setLayerRefs} />
      <SoilZonification layerRefs={layerRefs} setLayerRefs={setLayerRefs} />
      <AnimalBehavior />
      <QuantificationOfLogs mapContainerRef={mapContainerRef} />
      <ForestryResilienceAnalytics />
      <TimberStackInventory layerRefs={layerRefs} setLayerRefs={setLayerRefs} />
    </>
  ) : null;

/**
 * The central page - map component along with the header and rest components
 */
const MapInnerComponent = () => {
  const { map } = useMapContext();
  const leafletWindow = useLeafletWindow();
  const mapContainerRef = useRef(null);
  const [layerRefs, setLayerRefs] = useState<any>({});

  const isLoading = !map || !leafletWindow;

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full transition-opacity ${isLoading ? "opacity-0" : "opacity-1"}`}
    >
      <LeafletMapContainer
        center={AppConfig.baseCenter}
        zoom={6}
      >
        <LeafletMapContainerChild
          isLoading={isLoading}
          mapContainerRef={mapContainerRef}
          layerRefs={layerRefs}
          setLayerRefs={setLayerRefs}
        />
      </LeafletMapContainer>
    </div>
  );
};

const Map = () => (
  <MapContextProvider>
    <MapInnerComponent />
  </MapContextProvider>
);

export default Map;
