"use client";

import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import useUI from "@/lib/hooks/useUI";
import { BUNDLES_TYPES, HEALTH_STATUS_OF_VEGETATION, NGRDI, VARI } from "@/lib/constants";
import { withBundleCheck } from "@/lib/helper/BundleCheckHoc";
import { useGetUserBundlesQuery } from "@/lib/services/api";
import useBundles from "@/lib/hooks/useBundles";
import { LayerControlAndVisualizerLayer } from "@/components/LayersControl/LayersControlWrapper";
import HealthStatusOfVegetationStyle from "./HealthStatusOfVegetation.module.css";
import Image from "next/image";
import SlidersIcon from "/public/icons/sliders-light.png";
import { GeoJSONOptions } from "@/components/LayersControl/GeoJSONCollection";
import dynamic from "next/dynamic";
import LoadingBalloon from "@/components/LoadingBalloon/LoadingBalloon";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography
} from "@mui/material";
import MultiRangeSliderComponent, {
  ChangeResult
} from "@/components/MultiRangeSliderComponent/MultiRangeSliderComponent";
import { useLayerRegistry } from "@/lib/hooks/useLayerRegistry";
import useCogTiles from "@/lib/hooks/useCogTiles";
import usePrepareMap from "@/lib/hooks/usePrepareMap";
import useMapContext from "@/components/Map/useMapContext";
import L from "leaflet";
import DatasetModal, {
  DEFAULT_DATASET,
  PILOT_ZONE1_DATASET,
  PILOT_ZONE2_DATASET,
  PILOT_ZONE3_DATASET,
  PILOT_ZONE4_DATASET
} from "@/components/DatasetModal/DatasetModal";

const LayerSelectorAndVisualizer = dynamic(
  () => import("../../LayersControl/LayersControlWrapper").then(mod => mod.default),
  { loading: LoadingBalloon, ssr: false }
);
const GeoJSONCollection = dynamic(
  () => import("../../LayersControl/GeoJSONCollection").then(mod => mod.default),
  { loading: LoadingBalloon, ssr: false }
);
const TileLayerCollection = dynamic(
  () => import("../../LayersControl/TileLayerCollection").then(mod => mod.default),
  { loading: LoadingBalloon, ssr: false }
);
const PDFReportGenerator = dynamic(
  () => import("../../PDFReportGenerator/PDFReportGenerator").then(mod => mod.default),
  { loading: LoadingBalloon, ssr: false }
);

// Dead threshold for NGRDI: 0, range [-1; 0]
export const deadNGRDIThreshold = -1;
// Stressed threshold for NGRDI: 0.01, range (0; 0.01]
export const stressedNGRDILowThreshold = 0;
export const stressedNGRDIHighThreshold = 0.01;
// Healthy range for NGRDI: (0.01; 1]
export const healthyNGRDIThreshold = 1;
// Dead threshold for VARI: 0, range [-1; 0]
export const deadVARIThreshold = -1;
// Stressed threshold for VARI: 0.02, range (0; 0.02]
export const stressedVARILowThreshold = 0;
export const stressedVARIHighThreshold = 0.02;
// Healthy range for VARI: (0.02; 1]
export const healthyVARIThreshold = 1;

export const deadDefaultColor = "#FE265C";
export const stressedDefaultColor = "#FDB457";
export const healthyDefaultColor = "#A7FF44";

// The step of the indices in the slider
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const indexStep = 0.01;

const ColorPicker = ({ initialColor = "#000000", onChange }) => {
  const [color, setColor] = useState(initialColor);
  const colorPickerRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef(null);

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange && onChange(newColor);
  };

  const openColorPicker = () => {
    if (colorPickerRef?.current && "click" in colorPickerRef.current) {
      colorPickerRef.current.click();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openColorPicker}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          border: "none",
          backgroundColor: color,
          padding: "0",
          boxShadow: "inset 0 0 3px black"
        }}
      />
      <input
        ref={colorPickerRef}
        type="color"
        value={color}
        onChange={handleChange}
        style={{
          position: "absolute",
          opacity: 0, // Hide the input
          pointerEvents: "none" // Disable interaction with the input directly
        }}
      />
    </>
  );
};

type RangeSliderProps = {
  index: string;
  thresholdsAccepted: boolean;
  minValue: number;
  lowThreshold: number;
  highThreshold: number;
  maxValue: number;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setThresholdsAccepted: (thresholdsAccepted: boolean) => void;
};

const RangeSlider = (
  {
    index,
    thresholdsAccepted,
    minValue,
    lowThreshold,
    highThreshold,
    maxValue,
    onClose,
    setThresholdsAccepted
  }: RangeSliderProps) => {
  const [deadSelectedColor, setDeadSelectedColor] = useState(deadDefaultColor);
  const [stressedSelectedColor, setStressedSelectedColor] = useState(stressedDefaultColor);
  const [healthySelectedColor, setHealthySelectedColor] = useState(healthyDefaultColor);
  const [minSelectedValue, setMinSelectedValue] = useState(lowThreshold);
  const [maxSelectedValue, setMaxSelectedValue] = useState(highThreshold);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  const {
    healthStatusOfVegetationNGRDIParams,
    changeHealthStatusOfVegetationNGRDIParams,
    healthStatusOfVegetationVARIParams,
    changeHealthStatusOfVegetationVARIParams
  } = useUI();

  useEffect(() => {
    if (index === NGRDI) {
      setMinSelectedValue(
        healthStatusOfVegetationNGRDIParams ? healthStatusOfVegetationNGRDIParams.minSelectedValue : minSelectedValue
      );
      setMaxSelectedValue(
        healthStatusOfVegetationNGRDIParams ? healthStatusOfVegetationNGRDIParams.maxSelectedValue : maxSelectedValue
      );
      setDeadSelectedColor(
        healthStatusOfVegetationNGRDIParams ? healthStatusOfVegetationNGRDIParams.deadSelectedColor : deadSelectedColor
      );
      setStressedSelectedColor(
        healthStatusOfVegetationNGRDIParams
          ? healthStatusOfVegetationNGRDIParams.stressedSelectedColor
          : stressedSelectedColor
      );
      setHealthySelectedColor(
        healthStatusOfVegetationNGRDIParams
          ? healthStatusOfVegetationNGRDIParams.healthySelectedColor
          : healthySelectedColor
      );
    } else if (index === VARI) {
      setMinSelectedValue(
        healthStatusOfVegetationVARIParams ? healthStatusOfVegetationVARIParams.minSelectedValue : minSelectedValue
      );
      setMaxSelectedValue(
        healthStatusOfVegetationVARIParams ? healthStatusOfVegetationVARIParams.maxSelectedValue : maxSelectedValue
      );
      setDeadSelectedColor(
        healthStatusOfVegetationVARIParams ? healthStatusOfVegetationVARIParams.deadSelectedColor : deadSelectedColor
      );
      setStressedSelectedColor(
        healthStatusOfVegetationVARIParams
          ? healthStatusOfVegetationVARIParams.stressedSelectedColor
          : stressedSelectedColor
      );
      setHealthySelectedColor(
        healthStatusOfVegetationVARIParams
          ? healthStatusOfVegetationVARIParams.healthySelectedColor
          : healthySelectedColor
      );
    }
    setIsReadyToRender(true);
  }, []);

  useEffect(() => {
    if (thresholdsAccepted) {
      if (index === NGRDI) {
        changeHealthStatusOfVegetationNGRDIParams({
          minSelectedValue,
          maxSelectedValue,
          deadSelectedColor,
          stressedSelectedColor,
          healthySelectedColor
        });
      } else if (index === VARI) {
        changeHealthStatusOfVegetationVARIParams({
          minSelectedValue,
          maxSelectedValue,
          deadSelectedColor,
          stressedSelectedColor,
          healthySelectedColor
        });
      }
      setThresholdsAccepted(false);
      onClose();
    }
  }, [thresholdsAccepted]);

  return isReadyToRender ? (
    <>
      <div className={HealthStatusOfVegetationStyle.colorPickersSection}>
        <div className={HealthStatusOfVegetationStyle.colorPicker}>
          <span> Dead: </span>
          <ColorPicker
            initialColor={deadSelectedColor}
            onChange={setDeadSelectedColor}
          />
        </div>
        <div className={HealthStatusOfVegetationStyle.colorPicker}>
          <span> Stressed: </span>
          <ColorPicker
            initialColor={stressedSelectedColor}
            onChange={setStressedSelectedColor}
          />
        </div>
        <div className={HealthStatusOfVegetationStyle.colorPicker}>
          <span> Healthy: </span>
          <ColorPicker
            initialColor={healthySelectedColor}
            onChange={setHealthySelectedColor}
          />
        </div>
      </div>
      <MultiRangeSliderComponent
        min={minValue}
        max={maxValue}
        startingMinValue={minSelectedValue}
        startingMaxValue={maxSelectedValue}
        step={indexStep}
        onInput={(e: ChangeResult) => {
          setMinSelectedValue(e.minValue);
          setMaxSelectedValue(e.maxValue);
        }}
        label={false}
        ruler={false}
        style={{ border: "none", boxShadow: "none", padding: "15px 10px" }}
        barLeftColor={deadSelectedColor}
        barInnerColor={stressedSelectedColor}
        barRightColor={healthySelectedColor}
        thumbLeftColor="#6E4A83"
        thumbRightColor="#6E4A83"
      />
    </>
  ) : null;
};

const ThresholdsDialog = ({ open, onClose }) => {
  const [thresholdsAccepted, setThresholdsAccepted] = useState(false);

  const handleAccept = () => {
    setThresholdsAccepted(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#FEF6EB"
        }
      }}
    >
      <DialogTitle>NGRDI & VARI Thresholds Adjustment</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose a color for each category of the NGRDI & VARI indices and then adjust the thresholds as you see fit.
        </DialogContentText>
        <br />
        <Typography
          variant="h6"
          gutterBottom
        >
          NGRDI Thresholds
        </Typography>
        <RangeSlider
          index={NGRDI}
          thresholdsAccepted={thresholdsAccepted}
          minValue={deadNGRDIThreshold}
          lowThreshold={stressedNGRDILowThreshold}
          highThreshold={stressedNGRDIHighThreshold}
          maxValue={healthyNGRDIThreshold}
          onClose={onClose}
          setThresholdsAccepted={setThresholdsAccepted}
        />
        <br />
        <Divider variant="middle" />
        <Typography
          variant="h6"
          gutterBottom
        >
          VARI Thresholds
        </Typography>
        <RangeSlider
          index={VARI}
          thresholdsAccepted={thresholdsAccepted}
          minValue={deadVARIThreshold}
          lowThreshold={stressedVARILowThreshold}
          highThreshold={stressedVARIHighThreshold}
          maxValue={healthyVARIThreshold}
          onClose={onClose}
          setThresholdsAccepted={setThresholdsAccepted}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleAccept}
          color="primary"
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface TreeCounts {
  numberOfHealthyTrees: number;
  numberOfStressedTrees: number;
  numberOfDeadTrees: number;
}

const calculateTreeHealthCounts = (
  features: Array<any>,
  indexType: "NGRDI" | "VARI",
  minThreshold: number, // dead/stressed threshold
  maxThreshold: number  // stressed/healthy threshold
): TreeCounts => (
  features.reduce(
    (acc: TreeCounts, feature) => {
      const indexValue = feature.properties[indexType];

      if (indexValue <= minThreshold) {
        acc.numberOfDeadTrees++;
      } else if (indexValue > minThreshold && indexValue <= maxThreshold) {
        acc.numberOfStressedTrees++;
      } else {
        acc.numberOfHealthyTrees++;
      }

      return acc;
    },
    { numberOfHealthyTrees: 0, numberOfStressedTrees: 0, numberOfDeadTrees: 0 }
  )
);

const RASTER_LAYER_NAME = "1. Raster Layer";
const NGRDI_LAYER_NAME = "2. GeoJSON (NGRDI)";
const VARI_LAYER_NAME = "3. GeoJSON (VARI)";

export type HealthStatusOfVegetationReportProps = {
  totalInspectedArea: string;
  canopyCover: string;
  detectedTrees: string;
  indexProps: Array<{
    index: string;
    stressedThreshold: number;
    deadThreshold: number;
    pieChartData: Array<{
      name: string;
      value: number;
    }>
  }>;
}

const PILOT_DATASET_FILE_SUFFIX_MAPPING = {
  [PILOT_ZONE1_DATASET]: "_pilot_zone1",
  [PILOT_ZONE2_DATASET]: "_pilot_zone2",
  [PILOT_ZONE3_DATASET]: "_pilot_zone3",
  [PILOT_ZONE4_DATASET]: "_pilot_zone4"
};

type HealthStatusOfVegetationProps = {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  layerRefs: any;
  setLayerRefs: Dispatch<SetStateAction<any>>;
};

// Main component for the Health Status Of Vegetation bundle
const HealthStatusOfVegetation = ({ mapContainerRef, layerRefs, setLayerRefs }: HealthStatusOfVegetationProps) => {
  const { map } = useMapContext();
  const { layers, registerLayer } = useLayerRegistry();
  const [openDialog, setOpenDialog] = useState(true);
  const [geoJsonNGRDIOptions, setGeoJsonNGRDIOptions] = useState<GeoJSONOptions[] | null>(null);
  const [geoJsonVARIOptions, setGeoJsonVARIOptions] = useState<GeoJSONOptions[] | null>(null);

  const {
    activeBundle,
    layerZoomLevels,
    selectedDataset,
    healthStatusOfVegetationNGRDIParams,
    healthStatusOfVegetationVARIParams
  } = useUI();

  let healthStatusOfVegetationLayers: LayerControlAndVisualizerLayer[] = [];

  const { data: bundles } = useGetUserBundlesQuery();

  const activeBundleFileSuffix = `${activeBundle}${PILOT_DATASET_FILE_SUFFIX_MAPPING[selectedDataset || ""]}`;

  const bundleResponse: any = useBundles(
    bundles,
    selectedDataset === DEFAULT_DATASET ? activeBundle : activeBundleFileSuffix,
    BUNDLES_TYPES.GEOJSON
  );

  const bundleImageApiResponse = useBundles(
    bundles,
    selectedDataset === DEFAULT_DATASET ? activeBundle : activeBundleFileSuffix,
    BUNDLES_TYPES.TIF
  );

  const bundleReportApiResponse = useBundles(
    bundles,
    selectedDataset === DEFAULT_DATASET ? activeBundle : activeBundleFileSuffix,
    BUNDLES_TYPES.JSON
  );

  const cogTilesResponse = useCogTiles(
    bundleImageApiResponse!,
    undefined,
    undefined,
    {
      bidx: "1,2,3",
      noData: 0,
      returnMask: true
    }
  );

  usePrepareMap(cogTilesResponse);

  useEffect(() => {
    if (bundleResponse && healthStatusOfVegetationNGRDIParams && healthStatusOfVegetationVARIParams) {
      const optionsNGRDI = bundleResponse.features.map((feature, index) => {
        if (feature.properties.NGRDI <= healthStatusOfVegetationNGRDIParams.minSelectedValue) {
          return {
            index,
            fillColor: healthStatusOfVegetationNGRDIParams.deadSelectedColor
          };
        } else if (
          feature.properties.NGRDI > healthStatusOfVegetationNGRDIParams.minSelectedValue &&
          feature.properties.NGRDI <= healthStatusOfVegetationNGRDIParams.maxSelectedValue
        ) {
          return {
            index,
            fillColor: healthStatusOfVegetationNGRDIParams.stressedSelectedColor
          };
        } else {
          return {
            index,
            fillColor: healthStatusOfVegetationNGRDIParams.healthySelectedColor
          };
        }
      });
      const optionsVARI = bundleResponse.features.map((feature, index) => {
        if (feature.properties.VARI <= healthStatusOfVegetationVARIParams.minSelectedValue) {
          return {
            index,
            fillColor: healthStatusOfVegetationVARIParams.deadSelectedColor
          };
        } else if (
          feature.properties.VARI > healthStatusOfVegetationVARIParams.minSelectedValue &&
          feature.properties.VARI <= healthStatusOfVegetationVARIParams.maxSelectedValue
        ) {
          return {
            index,
            fillColor: healthStatusOfVegetationVARIParams.stressedSelectedColor
          };
        } else {
          return {
            index,
            fillColor: healthStatusOfVegetationVARIParams.healthySelectedColor
          };
        }
      });
      setGeoJsonNGRDIOptions(optionsNGRDI);
      setGeoJsonVARIOptions(optionsVARI);
    }
  }, [bundleResponse, healthStatusOfVegetationNGRDIParams, healthStatusOfVegetationVARIParams]);

  useEffect(() => {
    if (healthStatusOfVegetationLayers.length) {
      healthStatusOfVegetationLayers?.forEach(entry => {
        const ref = layerRefs[entry.name];
        const layerFound = layers.find(layer => layer.layerName === entry.name);
        if (ref && !layerFound) {
          registerLayer(entry.name);
        }
      });
    }
  }, [layerRefs, healthStatusOfVegetationLayers]);


  if (!selectedDataset) {
    return <DatasetModal />;
  }

  if (!cogTilesResponse) {
    return <LoadingBalloon />;
  }

  if (bundleResponse && cogTilesResponse && geoJsonNGRDIOptions && geoJsonVARIOptions) {
    healthStatusOfVegetationLayers = [
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
        name: NGRDI_LAYER_NAME,
        component: (
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: NGRDI_LAYER_NAME, geoJsonData: bundleResponse }}
            options={geoJsonNGRDIOptions}
          />
        )
      }, {
        name: VARI_LAYER_NAME,
        component: (
          <GeoJSONCollection
            layerRefs={layerRefs}
            setLayerRefs={setLayerRefs}
            layer={{ name: VARI_LAYER_NAME, geoJsonData: bundleResponse }}
            options={geoJsonVARIOptions}
          />
        )
      }
    ];
  }

  const handleHealthStatusOfVegetationDataPreparation = async ({ data }) => {
    if (!data) {
      return null;
    }

    map?.fitBounds(cogTilesResponse.bounds as L.LatLngBoundsExpression);

    try {
      const numberOfTreesNGRDI = calculateTreeHealthCounts(
        data.features,
        NGRDI,
        data.NGRDIParams.minSelectedValue,
        data.NGRDIParams.maxSelectedValue
      );

      const numberOfTreesVARI = calculateTreeHealthCounts(
        data.features,
        VARI,
        data.VARIParams.minSelectedValue,
        data.VARIParams.maxSelectedValue
      );

      const { trees_detected, total_area, tree_area_p } = data.jsonData;

      const healthyNGRDIRatio = numberOfTreesNGRDI.numberOfHealthyTrees / trees_detected;
      const stressedNGRDIRatio = numberOfTreesNGRDI.numberOfStressedTrees / trees_detected;
      const deadNGRDIRatio = numberOfTreesNGRDI.numberOfDeadTrees / trees_detected;
      const healthyVARIRatio = numberOfTreesVARI.numberOfHealthyTrees / trees_detected;
      const stressedVARIRatio = numberOfTreesVARI.numberOfStressedTrees / trees_detected;
      const deadVARIRatio = numberOfTreesVARI.numberOfDeadTrees / trees_detected;

      const reportData = {
        totalInspectedArea: (total_area / 10000).toFixed(2),
        canopyCover: String(tree_area_p),
        detectedTrees: String(trees_detected),
        indexProps: [NGRDI, VARI].map(entry => ({
          index: entry,
          stressedThreshold: entry === NGRDI ? data.NGRDIParams.minSelectedValue : data.VARIParams.minSelectedValue,
          deadThreshold: entry === NGRDI ? data.NGRDIParams.maxSelectedValue : data.VARIParams.maxSelectedValue,
          pieChartData: [
            {
              name: "Healthy",
              value: parseFloat((entry === NGRDI ? healthyNGRDIRatio : healthyVARIRatio).toFixed(2)) * 100
            },
            {
              name: "Stressed",
              value: parseFloat((entry === NGRDI ? stressedNGRDIRatio : stressedVARIRatio).toFixed(2)) * 100
            },
            { name: "Dead", value: parseFloat((entry === NGRDI ? deadNGRDIRatio : deadVARIRatio).toFixed(2)) * 100 }
          ]
        }))
      };

      return { reportData };
    } catch (error) {
      console.error("Error in handleHealthStatusOfVegetationDataPreparation:", error);
      throw error;
    }
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return bundleResponse ? (
    <>
      {
        cogTilesResponse && healthStatusOfVegetationLayers && healthStatusOfVegetationLayers.length && (
          <LayerSelectorAndVisualizer
            position="bottomleft"
            collapsed={false}
            layers={healthStatusOfVegetationLayers}
          />
        )
      }
      <ThresholdsDialog
        open={openDialog}
        onClose={handleDialogClose}
      />
      <button
        onClick={handleDialogOpen}
        className={HealthStatusOfVegetationStyle.slidersControl}
      >
        <Image
          src={SlidersIcon.src}
          alt="slidersIcon"
          width={50}
          height={50}
          objectFit="contain"
        />
      </button>
      {
        bundleResponse && bundleReportApiResponse && healthStatusOfVegetationNGRDIParams && healthStatusOfVegetationVARIParams && (
          <PDFReportGenerator
            handleDataPreparation={handleHealthStatusOfVegetationDataPreparation}
            bundleName={HEALTH_STATUS_OF_VEGETATION}
            mapContainerRef={mapContainerRef}
            bundleProps={{
              data: {
                features: bundleResponse.features,
                jsonData: bundleReportApiResponse,
                NGRDIParams: healthStatusOfVegetationNGRDIParams,
                VARIParams: healthStatusOfVegetationVARIParams
              }
            }}
            layersToEnable={[
              [RASTER_LAYER_NAME, NGRDI_LAYER_NAME],
              [RASTER_LAYER_NAME, VARI_LAYER_NAME]
            ]}
            layerRefs={layerRefs}
          />
        )
      }
    </>
  ) : null;
};

export default withBundleCheck(HEALTH_STATUS_OF_VEGETATION)(HealthStatusOfVegetation);
