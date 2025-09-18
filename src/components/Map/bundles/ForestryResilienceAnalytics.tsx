"use client";

import React, { useEffect } from "react";
import { FeatureGroup, ImageOverlay } from "react-leaflet";
import { FORESTRY_RESILIENCE_ANALYTICS } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import useMapContext from "@/components/Map/useMapContext";
import { LatLngBoundsExpression, LatLngExpression, LatLngLiteral } from "leaflet";
import { LayerControlAndVisualizerLayer } from "@/components/LayersControl/LayersControlWrapper";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import { MapPin } from "lucide-react";
import colors from "tailwindcss/colors";
import { AppConfig } from "@/lib/AppConfig";

const LayerSelectorAndVisualizer = dynamic(
  () => import("../../LayersControl/LayersControlWrapper"),
  { loading: LoadingBalloon, ssr: false }
);
const CustomMarker = dynamic(
  () => import("../CustomMarker"),
  { loading: LoadingBalloon, ssr: false }
);

// ToDo: Remove this hardcoded location when we have the actual latitude and longitude from the DIP
const FOREST_LOCATION = {
  lat: 40.649194,
  lng: -4.736278
} as LatLngLiteral;

const output = {
  im_name: "processedImageName",
  date: new Date(),
  health_label: true, // healthy or unhealthy (boolean)
  health_status: "healthy", // healthy or unhealthy (string)
  tree_coverage: 0.25 // float between 0 and 1
};

// Main component for the Forestry Resilience Analytics (SAFRA) bundle
const ForestryResilienceAnalytics = () => {
  const { map } = useMapContext();
  // const [bounds, setBounds] = useState<any>(null);

  let forestryResilienceAnalyticsLayers: LayerControlAndVisualizerLayer[] | null = null;

  const bounds: LatLngBoundsExpression = [
    [50.094949, 14.553209], // Southwest corner (lat, lng)
    [50.099087, 14.562161] // Northeast corner (lat, lng)
  ];

  const center = [
    (50.094949 + 50.099087) / 2, // Average latitude
    (14.553209 + 14.562161) / 2  // Average longitude
  ];

  if (map && bounds) {
    forestryResilienceAnalyticsLayers = [
      {
        name: "Raster Layer (output) - low quality image (faster)",
        component:
          <ImageOverlay
            url={`${Config.apiURL}/v1/image/forestry_resilience_analytics/forestry_resilience_analytics_input.png`}
            bounds={bounds}
            // opacity={0.8}
            // zIndex={1000}  // Control layer ordering
          />
      }
    ];
  }

  useEffect(() => {
    if (map) {
      map.flyTo(
        center as LatLngExpression,
        AppConfig.maxZoom,
        { duration: 2 }
      );
    }
  }, [center]);

  return forestryResilienceAnalyticsLayers ? (
    <FeatureGroup>
      <CustomMarker
        icon={MapPin}
        position={FOREST_LOCATION}
        color={colors.purple[700]}
      />
      <LayerSelectorAndVisualizer
        position="bottomleft"
        collapsed={false}
        layers={forestryResilienceAnalyticsLayers}
      />
    </FeatureGroup>
  ) : null;
};

export default withBundleCheck(FORESTRY_RESILIENCE_ANALYTICS)(ForestryResilienceAnalytics);
