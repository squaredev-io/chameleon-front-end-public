"use client";

import { BUNDLES_TYPES, TIMBER_STACK_INVENTORY } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import useBundles from "@/lib/hooks/useBundles";
import useUI from "@/lib/hooks/useUI";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import { FeatureGroup } from "react-leaflet";
import { LayerControlAndVisualizerLayer } from "../../LayersControl/LayersControlWrapper";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import useCogTiles from "@/lib/hooks/useCogTiles";
import usePrepareMap from "@/lib/hooks/usePrepareMap";
import React, { Dispatch, SetStateAction } from "react";

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

const BEFORE_LAYER_NAME = "1. 'Before' Layer";
const AFTER_LAYER_NAME = "2. 'After' Layer";
const GEOJSON_LAYER_NAME = "3. GeoJSON";

type TimberStackInventoryProps = {
  layerRefs: any;
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>;
  setLayerRefs: Dispatch<SetStateAction<any>>;
  // setLayerRefs: Dispatch<SetStateAction<Record<string, L.TileLayer | L.GeoJSON>>>;
};

// Main component for the TILO's Timber Stack Inventory bundle
const TimberStackInventory = ({ layerRefs, setLayerRefs }: TimberStackInventoryProps) => {
  const {
    bundleResponse,
    activeBundle,
    layerZoomLevels
  } = useUI();
  const { data: bundles } = useGetUserBundlesQuery();

  const bundleBeforeImageApiResponse = useBundles(bundles, `${activeBundle}_before`, BUNDLES_TYPES.TIF);
  const bundleAfterImageApiResponse = useBundles(bundles, `${activeBundle}_after`, BUNDLES_TYPES.TIF);

  const cogTilesBeforeResponse = useCogTiles(bundleBeforeImageApiResponse!, "inferno");
  const cogTilesAfterResponse = useCogTiles(bundleAfterImageApiResponse!, "inferno");

  usePrepareMap(cogTilesBeforeResponse);

  if (!cogTilesBeforeResponse && !cogTilesAfterResponse) {
    return <LoadingBalloon />;
  }

  let timberStackInventoryLayers: LayerControlAndVisualizerLayer[] = [];

  if (bundleResponse && cogTilesBeforeResponse && cogTilesAfterResponse) {
    timberStackInventoryLayers = [
      {
        name: BEFORE_LAYER_NAME,
        component: (
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: BEFORE_LAYER_NAME, rasterUrl: cogTilesBeforeResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
        )
      }, {
        name: AFTER_LAYER_NAME,
        component: (
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: AFTER_LAYER_NAME, rasterUrl: cogTilesAfterResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
        )
      }, {
        name: GEOJSON_LAYER_NAME,
        component: (
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: GEOJSON_LAYER_NAME, geoJsonData: bundleResponse }}
          />
        )
      }
    ];
  }

  return bundleResponse && cogTilesBeforeResponse && cogTilesAfterResponse && timberStackInventoryLayers.length ? (
    <FeatureGroup>
      <LayerSelectorAndVisualizer
        position="bottomleft"
        collapsed={false}
        layers={timberStackInventoryLayers}
      />
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(TIMBER_STACK_INVENTORY)(TimberStackInventory);
