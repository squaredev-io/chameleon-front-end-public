"use client";

import React, { Dispatch, SetStateAction, useEffect } from "react";
import { FeatureGroup } from "react-leaflet";
import useUI from "@/lib/hooks/useUI";
import { AUTOMATIC_VINES_DETECTION, BUNDLES_TYPES } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import useBundles from "@/lib/hooks/useBundles";
import { LayerControlAndVisualizerLayer } from "@/components/LayersControl/LayersControlWrapper";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import useCogTiles from "@/lib/hooks/useCogTiles";
import usePrepareMap from "@/lib/hooks/usePrepareMap";
import useMapContext from "@/components/Map/useMapContext";
import L from "leaflet";
import DatasetModal, { PILOT_DATASET } from "@/components/DatasetModal/DatasetModal";

const LayerSelectorAndVisualizer = dynamic(
  () => import("../../LayersControl/LayersControlWrapper"),
  { loading: LoadingBalloon, ssr: false }
);
const GeoJSONCollection = dynamic(
  () => import("../../LayersControl/GeoJSONCollection"),
  { loading: LoadingBalloon, ssr: false }
);
const TileLayerCollection = dynamic(
  () => import("../../LayersControl/TileLayerCollection"),
  { loading: LoadingBalloon, ssr: false }
);
const PDFReportGenerator = dynamic(
  () => import("../../PDFReportGenerator/PDFReportGenerator"),
  { loading: LoadingBalloon, ssr: false }
);

const RASTER_LAYER_NAME = "1. Raster Layer";
const GEOJSON_LAYER_NAME = "2. GeoJSON";

type AutomaticVinesDetectionProps = {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  layerRefs: any;
  setLayerRefs: Dispatch<SetStateAction<any>>;
};

// Main component for the Automatic Vines Detection bundle
const AutomaticVinesDetection = ({ mapContainerRef, layerRefs, setLayerRefs }: AutomaticVinesDetectionProps) => {
  let automaticVinesDetectionLayers: LayerControlAndVisualizerLayer[] = [];
  const { map } = useMapContext();
  const { layers, registerLayer } = useLayerRegistry();
  const { selectedDataset, activeBundle, layerZoomLevels } = useUI();
  const { data: bundles } = useGetUserBundlesQuery();

  const bundleResponse: any = useBundles(
    bundles,
    selectedDataset === PILOT_DATASET ? `${activeBundle}_pilot` : activeBundle,
    BUNDLES_TYPES.GEOJSON
  );

  const bundleImageApiResponse = useBundles(
    bundles,
    selectedDataset === PILOT_DATASET ? `${activeBundle}_pilot` : activeBundle,
    BUNDLES_TYPES.TIF
  );

  const cogTilesResponse = useCogTiles(bundleImageApiResponse!);
  usePrepareMap(cogTilesResponse);

  useEffect(() => {
    if (automaticVinesDetectionLayers.length) {
      automaticVinesDetectionLayers?.forEach(entry => {
        const ref = layerRefs[entry.name];
        const layerFound = layers.find(layer => layer.layerName === entry.name);
        if (ref && !layerFound) {
          registerLayer(entry.name);
        }
      });
    }
  }, [layerRefs, automaticVinesDetectionLayers]);

  if (!cogTilesResponse) {
    return <LoadingBalloon />;
  }

  if (bundleResponse && cogTilesResponse) {
    // ToDo: not sure if needed
    // const geoJsonData = handleUnknownProjection(bundleResponse);

    automaticVinesDetectionLayers = [
      {
        name: RASTER_LAYER_NAME,
        component:
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: RASTER_LAYER_NAME, rasterUrl: cogTilesResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
      }, {
        name: GEOJSON_LAYER_NAME,
        component:
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: GEOJSON_LAYER_NAME, geoJsonData: bundleResponse }}
          />
      }
    ];
  }

  const handleAutomaticVinesDetectionDataPreparation = async ({ overviewValue, imageSrc }) => {
    if (!overviewValue || !imageSrc) {
      return null;
    }

    map?.fitBounds(cogTilesResponse.bounds as L.LatLngBoundsExpression);

    return {
      reportData: {
        overviewValue,
        imageSrc
      }
    };
  };

  if (!selectedDataset) {
    return <DatasetModal />;
  }

  return bundleResponse && automaticVinesDetectionLayers && automaticVinesDetectionLayers.length ? (
    <FeatureGroup>
      <LayerSelectorAndVisualizer
        position="bottomleft"
        collapsed={false}
        layers={automaticVinesDetectionLayers}
      />
      <PDFReportGenerator
        handleDataPreparation={handleAutomaticVinesDetectionDataPreparation}
        bundleName={AUTOMATIC_VINES_DETECTION}
        mapContainerRef={mapContainerRef}
        bundleProps={{
          overviewValue: bundleResponse?.features?.length,
          imageSrc: bundleImageApiResponse
        }}
        layersToEnable={[[RASTER_LAYER_NAME, GEOJSON_LAYER_NAME]]}
        layerRefs={layerRefs}
      />
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(AUTOMATIC_VINES_DETECTION)(AutomaticVinesDetection);
