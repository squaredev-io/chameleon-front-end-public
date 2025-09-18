"use client";

import React, { Dispatch, SetStateAction } from "react";
import { FeatureGroup, ImageOverlay } from "react-leaflet";
import useUI from "@/lib/hooks/useUI";
import { BUNDLES_TYPES, SOIL_ZONIFICATION } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import useBundles from "@/lib/hooks/useBundles";
import { LayerControlAndVisualizerLayer } from "@/components/LayersControl/LayersControlWrapper";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import useCogTiles from "@/lib/hooks/useCogTiles";
import usePrepareMap from "@/lib/hooks/usePrepareMap";
import L from "leaflet";
import { Config } from "../../../config";

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

const GEOJSON_LAYER_NAME = "1. GeoJSON";
const RASTER_LAYER_NAME = "2. Raster Layer (output)";
const RASTER_LQ_LAYER_NAME = "3. Raster Layer (output) - LQ image";

type SoilZonificationProps = {
  layerRefs: any;
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>;
  setLayerRefs: Dispatch<SetStateAction<any>>;
  // setLayerRefs: Dispatch<SetStateAction<Record<string, L.TileLayer | L.GeoJSON>>>;
};

// Main component for the Soil Zonification bundle
const SoilZonification = ({ layerRefs, setLayerRefs }: SoilZonificationProps) => {
  const { bundleResponse, activeBundle, layerZoomLevels } = useUI();
  const { data: bundles } = useGetUserBundlesQuery();

  const bundleImageApiResponse = useBundles(bundles, activeBundle, BUNDLES_TYPES.TIF);

  const cogTilesResponse = useCogTiles(bundleImageApiResponse!);
  usePrepareMap(cogTilesResponse);

  if (!cogTilesResponse) {
    return <LoadingBalloon />;
  }

  let automaticVinesDetectionLayers: LayerControlAndVisualizerLayer[] | null = null;

  if (bundleResponse && cogTilesResponse) {
    automaticVinesDetectionLayers = [
      {
        name: GEOJSON_LAYER_NAME,
        component:
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: GEOJSON_LAYER_NAME, geoJsonData: bundleResponse }}
          />
      }, {
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
        name: RASTER_LQ_LAYER_NAME,
        component:
          <ImageOverlay
            url={`${Config.apiURL}/v1/image/soil_zoning/soil_zoning_output?format=webp`}
            bounds={cogTilesResponse.bounds as L.LatLngBoundsExpression}
            // opacity={0.8}
            // zIndex={1000}  // Control layer ordering
          />
      }
    ];
  }

  return bundleResponse && cogTilesResponse && automaticVinesDetectionLayers ? (
    <FeatureGroup>
      <LayerSelectorAndVisualizer
        position="bottomleft"
        collapsed={false}
        layers={automaticVinesDetectionLayers}
      />
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(SOIL_ZONIFICATION)(SoilZonification);
