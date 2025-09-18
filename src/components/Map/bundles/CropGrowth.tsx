"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { BUNDLES_TYPES, CROP_GROWTH } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import useBundles from "@/lib/hooks/useBundles";
import useUI from "@/lib/hooks/useUI";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import { sendFeatureEmail } from "@/lib/utils/sendEmail";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slider,
  Typography
} from "@mui/material";
import { Feature } from "geojson";
import Image from "next/image";
import { FeatureGroup } from "react-leaflet";
import colors from "tailwindcss/colors";
import { LayerControlAndVisualizerLayer } from "../../LayersControl/LayersControlWrapper";
import SlidersIcon from "/public/icons/sliders-light.png";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import { HistogramData } from "@/components/PDFReportGenerator/Charts";
import useCogTiles from "@/lib/hooks/useCogTiles";
import usePrepareMap from "@/lib/hooks/usePrepareMap";
import useMapContext from "@/components/Map/useMapContext";
import L from "leaflet";

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
const GCC_LAYER_NAME = "2. GCC Layer";
const WATER_STRESS_LAYER_NAME = "3. Water Stress Layer";
const ALARMS_LAYER_NAME = "4. Alarms";
const ALARMS_PERC_LAYER_NAME = "5. Alarms Percentile";

interface ThresholdsDialogProps {
  open: boolean;
  onClose: () => void;
  defaultThresholdRange: number[];
  setThreshold: (value: string) => void;
}

const ThresholdsDialog: React.FC<ThresholdsDialogProps> = (
  {
    open,
    onClose,
    defaultThresholdRange = [0, 1],
    setThreshold
  }) => {
  const [value, setValue] = useState<number[]>(defaultThresholdRange);

  const handleAccept = () => {
    setThreshold(`${value[0]},${value[1]}`);
    onClose();
  };

  const handleChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
  };

  useEffect(() => {
    if (defaultThresholdRange) {
      setValue(defaultThresholdRange);
    }
  }, [defaultThresholdRange]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#FEF6EB"
        },
        zIndex: 9000
      }}
    >
      <DialogTitle>GCC Thresholds Adjustment</DialogTitle>
      <DialogContent>
        <DialogContentText>Adjust the thresholds as you see fit. The values are between 0 and 1.</DialogContentText>
        <br />
        <Slider
          min={0}
          max={1}
          step={0.0001}
          defaultValue={defaultThresholdRange}
          value={value}
          onChange={handleChange}
          valueLabelDisplay="auto"
          sx={{
            "& .MuiSlider-thumb": {
              backgroundColor: "#6E4A83"
            },
            "& .MuiSlider-rail": {
              backgroundColor: "#6E4A83"
            },
            "& .MuiSlider-track": {
              backgroundColor: "#6E4A83"
            }
          }}
        />
        <Typography
          variant="body2"
          gutterBottom
        >
          Min: {value[0]}
        </Typography>
        <Typography
          variant="body2"
          gutterBottom
        >
          Max: {value[1]}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleAccept}
          sx={{
            backgroundColor: "#6E4A83",
            color: "white",
            "&:hover": {
              backgroundColor: colors.purple[700]
            }
          }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ShapefileFeature {
  properties: {
    x240814_gcc: number;
    x240814_dgp: number;
  };
}

const extractData = (features: ShapefileFeature[]) => (
  features.map(feature => ({
    gcc: feature.properties["240814_gcc"],
    dgp: feature.properties["240814_dgp"]
  }))
);

const calculateStatistics = (data: { gcc: number; dgp: number }[]) => {
  const gccValues = data.map(d => d.gcc);
  const gccAlarmValues = data.filter(d => d.dgp === 1).map(d => d.gcc);

  // Calculate mean, max, min, and std for all GCC values
  const gccMean = gccValues.reduce((sum, val) => sum + val, 0) / gccValues.length;
  const gccMax = Math.max(...gccValues);
  const gccMin = Math.min(...gccValues);
  const gccStd = Math.sqrt(gccValues.reduce((sum, val) => sum + Math.pow(val - gccMean, 2), 0) / gccValues.length);

  // Calculate mean, max, min, and std for GCC values with alarm (dgp === 1)
  const gccMeanAlarm = gccAlarmValues.length > 0 ? gccAlarmValues.reduce((sum, val) => sum + val, 0) / gccAlarmValues.length : 0;
  const gccMaxAlarm = gccAlarmValues.length > 0 ? Math.max(...gccAlarmValues) : 0;
  const gccMinAlarm = gccAlarmValues.length > 0 ? Math.min(...gccAlarmValues) : 0;
  const gccStdAlarm = gccAlarmValues.length > 0 ?
    Math.sqrt(gccAlarmValues.reduce((sum, val) => sum + Math.pow(val - gccMeanAlarm, 2), 0) / gccAlarmValues.length) : 0;

  return {
    gccValues, // Return raw GCC values for the histogram
    gccMean,
    gccMax,
    gccMin,
    gccStd,
    gccMeanAlarm,
    gccMaxAlarm,
    gccMinAlarm,
    gccStdAlarm
  };
};

const createHistogramData = (data: number[], binSize: number): HistogramData[] => {
  const bins: { [key: string]: number } = {};

  data.forEach(value => {
    const bin = Math.floor(value / binSize) * binSize;
    const binKey = `${bin.toFixed(2)}-${(bin + binSize).toFixed(2)}`;
    bins[binKey] = (bins[binKey] || 0) + 1;
  });

  return Object.entries(bins).map(([name, value]) => ({
    name,
    value
  }));
};

// Function to find the value of a key containing a specific substring
const getValueByKeySubstring = (properties, substring) => {
  for (const key in properties) {
    if (key.includes(substring)) {
      return properties[key];
    }
  }
  return null;
};

// Style function for GeoJSON layer
const GEOJSON_STYLE = {
  color: "red",
  weight: 2,
  opacity: 1,
  fillColor: "red",
  fillOpacity: 0.5
};

const filterAlarmsGeoJson = (geoJson, propName) => {
  // Clone the response to avoid mutating the original
  const filteredFeatures = geoJson.features.filter(feature => {
    const prop = getValueByKeySubstring(feature.properties, propName);
    return prop === 1;
  });

  return ({
    type: "FeatureCollection",
    features: filteredFeatures
  });
};

type CropGrowthProps = {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  layerRefs: any;
  // layerRefs: Record<string, L.TileLayer | L.GeoJSON>;
  setLayerRefs: Dispatch<SetStateAction<any>>;
  // setLayerRefs: Dispatch<SetStateAction<Record<string, L.TileLayer | L.GeoJSON>>>;
};

// Main component for the Crop Growth and Development Monitoring bundle
const CropGrowth = ({ mapContainerRef, layerRefs, setLayerRefs }: CropGrowthProps) => {
  const { map } = useMapContext();
  const { layers, registerLayer } = useLayerRegistry();
  const [threshold, setThreshold] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [filteredAlarmsGeoJson, setFilteredAlarmsGeoJson] = useState<any>(null);
  const [filteredAlarmsPercentileGeoJson, setFilteredAlarmsPercentileGeoJson] = useState<any>(null);

  let cropGrowthLayers: LayerControlAndVisualizerLayer[] = [];

  const {
    bundleResponse,
    activeBundle,
    layerZoomLevels
  } = useUI();

  const { data: bundles } = useGetUserBundlesQuery();

  const bundleGCCImageApiResponse = useBundles(bundles, `${activeBundle}_gcc`, BUNDLES_TYPES.TIF);
  const bundleWaterStressImageApiResponse = useBundles(bundles, `${activeBundle}_water_stress`, BUNDLES_TYPES.TIF);

  const bundleAlarmsApiResponse = useBundles(bundles, `${activeBundle}_alarms`, BUNDLES_TYPES.GEOJSON);
  const bundleAlarmsPercentileApiResponse = useBundles(bundles, `${activeBundle}_alarms_percentile`, BUNDLES_TYPES.GEOJSON);

  const cogTilesResponse = useCogTiles(bundleResponse);

  const cogTilesGCCResponse = useCogTiles(bundleGCCImageApiResponse!, "greens", threshold);
  const cogTilesWaterStressResponse = useCogTiles(bundleWaterStressImageApiResponse!, "blues", threshold);

  usePrepareMap(cogTilesResponse);

  useEffect(() => {
    if (bundleAlarmsApiResponse) {
      setFilteredAlarmsGeoJson(filterAlarmsGeoJson(bundleAlarmsApiResponse, "dgk"));
    }
  }, [bundleAlarmsApiResponse]);

  useEffect(() => {
    if (bundleAlarmsPercentileApiResponse) {
      setFilteredAlarmsPercentileGeoJson(filterAlarmsGeoJson(bundleAlarmsPercentileApiResponse, "dgp"));
    }
  }, [bundleAlarmsPercentileApiResponse]);

  useEffect(() => {
    if (cropGrowthLayers.length) {
      cropGrowthLayers?.forEach(entry => {
        const ref = layerRefs[entry.name];
        const layerFound = layers.find(layer => layer.layerName === entry.name);
        if (ref && !layerFound) {
          registerLayer(entry.name);
        }
      });
    }
  }, [layerRefs, cropGrowthLayers]);

  if (!bundleResponse || !cogTilesResponse || !cogTilesGCCResponse || !cogTilesWaterStressResponse) {
    return <LoadingBalloon />;
  }

  const handleDialog = () => {
    setOpenDialog(!openDialog);
  };

  const handleSendEmail = async (emailTo: string, feature: Feature) => {
    try {
      const response = await sendFeatureEmail({
        to: emailTo,
        subject: "Feature Details",
        feature
      });
      // TODO: Handle success
      console.log(response);
    } catch (error) {
      // TODO: Handle error
      console.error(error);
    }
  };

  if (cogTilesResponse && cogTilesGCCResponse && cogTilesWaterStressResponse && filteredAlarmsGeoJson && filteredAlarmsPercentileGeoJson) {
    cropGrowthLayers = [
      {
        name: RASTER_LAYER_NAME,
        component: (
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: RASTER_LAYER_NAME, rasterUrl: cogTilesResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
        )
      }, {
        name: GCC_LAYER_NAME,
        component: (
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: GCC_LAYER_NAME, rasterUrl: cogTilesGCCResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
        )
      }, {
        name: WATER_STRESS_LAYER_NAME,
        component: (
          <TileLayerCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: WATER_STRESS_LAYER_NAME, rasterUrl: cogTilesWaterStressResponse.tileUrl }}
            maxLayerZoom={layerZoomLevels.maxZoom}
            minLayerZoom={layerZoomLevels.minZoom}
          />
        )
      }, {
        name: ALARMS_LAYER_NAME,
        component: (
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: ALARMS_LAYER_NAME, geoJsonData: filteredAlarmsGeoJson }}
            onClick={handleSendEmail}
            options={GEOJSON_STYLE}
          />
        )
      }, {
        name: ALARMS_PERC_LAYER_NAME,
        component: (
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: ALARMS_PERC_LAYER_NAME, geoJsonData: filteredAlarmsPercentileGeoJson }}
            onClick={handleSendEmail}
            options={GEOJSON_STYLE}
          />
        )
      }
    ];
  }

  const handleCropGrowthDataPreparation = async ({ data }) => {
    if (!data || !data.gcc || !data.alarms) {
      return null;
    }

    try {
      const extractedData = extractData(data.alarms.features);

      // Calculate statistics and get GCC values
      const { gccValues, ...statistics } = calculateStatistics(extractedData);

      // Generate histogram data
      const binSize = 0.1; // Adjust bin size as needed
      const histogramData = createHistogramData(gccValues, binSize);

      map?.fitBounds(cogTilesResponse.bounds as L.LatLngBoundsExpression);

      const reportData = {
        statistics,
        histogramData
      };

      return { reportData };
    } catch (error) {
      console.error("Error in handleCropGrowthDataPreparation:", error);
      throw error;
    }
  };

  return cropGrowthLayers.length ? (
    <>
      <ThresholdsDialog
        open={openDialog}
        onClose={handleDialog}
        defaultThresholdRange={cogTilesGCCResponse.bandMinMaxValues}
        setThreshold={setThreshold}
      />
      <IconButton
        onClick={handleDialog}
        sx={{
          position: "relative",
          width: 50,
          height: 50,
          borderRadius: "10%",
          cursor: "pointer",
          border: "1px solid black",
          backgroundColor: "#6E4A83",
          boxShadow: "inset 0 0 3px black",
          zIndex: 9000,
          top: "50%",
          left: "1%"
        }}
      >
        <Image
          src={SlidersIcon.src}
          alt="slidersIcon"
          width={50}
          height={50}
          objectFit="contain"
        />
      </IconButton>
      <FeatureGroup>
        <LayerSelectorAndVisualizer
          position="bottomleft"
          collapsed={false}
          layers={cropGrowthLayers}
        />
        {
          Object.entries(layerRefs).length && (
            <PDFReportGenerator
              handleDataPreparation={handleCropGrowthDataPreparation}
              bundleName={CROP_GROWTH}
              mapContainerRef={mapContainerRef}
              bundleProps={{
                data: {
                  gcc: bundleGCCImageApiResponse,
                  alarms: bundleAlarmsPercentileApiResponse
                }
              }}
              layersToEnable={[
                [RASTER_LAYER_NAME, GCC_LAYER_NAME],
                [RASTER_LAYER_NAME, GCC_LAYER_NAME, ALARMS_LAYER_NAME]
              ]}
              layerRefs={layerRefs}
            />
          )
        }
      </FeatureGroup>
    </>
  ) : null;
};

export default withBundleCheck(CROP_GROWTH)(CropGrowth);
