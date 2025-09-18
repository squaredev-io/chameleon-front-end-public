import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConfig } from "@/lib/AppConfig";
import { NGRDI, VARI } from "@/lib/constants";
import {
  deadDefaultColor,
  healthyDefaultColor,
  stressedDefaultColor,
  stressedNGRDIHighThreshold,
  stressedNGRDILowThreshold,
  stressedVARIHighThreshold,
  stressedVARILowThreshold
} from "@/components/Map/bundles/HealthStatusOfVegetation";

export const uiSliceName = "ui";

export interface ViewportInfo {
  viewportWidth: number;
  viewportHeight: number;
}

export interface LayerZoomLevels {
  minZoom: number;
  maxZoom: number;
}

export interface HealthStatusOfVegetationParams {
  minSelectedValue: number;
  maxSelectedValue: number;
  deadSelectedColor: string;
  stressedSelectedColor: string;
  healthySelectedColor: string;
}

export interface UiState {
  viewportInfo: ViewportInfo;
  digitalTwinToggle: boolean;
  drawPolygonToggle: boolean;
  bundleResponse: any;
  activeBundle: any;
  layerZoomLevels: LayerZoomLevels;
  areNoneLayersChecked: boolean | null;
  [NGRDI]: HealthStatusOfVegetationParams | null;
  [VARI]: HealthStatusOfVegetationParams | null;
  mapContainerRef: any;
  selectedDataset: string | null;
}

export const initialUiState: UiState = {
  viewportInfo: {
    viewportWidth: 0,
    viewportHeight: 0
  },
  digitalTwinToggle: false,
  drawPolygonToggle: false,
  bundleResponse: null,
  activeBundle: null,
  layerZoomLevels: {
    minZoom: AppConfig.minZoom,
    maxZoom: AppConfig.maxZoom
  },
  areNoneLayersChecked: null,
  [NGRDI]: {
    minSelectedValue: stressedNGRDILowThreshold,
    maxSelectedValue: stressedNGRDIHighThreshold,
    deadSelectedColor: deadDefaultColor,
    stressedSelectedColor: stressedDefaultColor,
    healthySelectedColor: healthyDefaultColor
  },
  [VARI]: {
    minSelectedValue: stressedVARILowThreshold,
    maxSelectedValue: stressedVARIHighThreshold,
    deadSelectedColor: deadDefaultColor,
    stressedSelectedColor: stressedDefaultColor,
    healthySelectedColor: healthyDefaultColor
  },
  mapContainerRef: null,
  selectedDataset: null
};

/**
 * uiSlice creator and ui slice reducers
 */
const uiSlice = createSlice({
  name: uiSliceName,
  initialState: initialUiState,
  reducers: {
    resetUi: () => initialUiState,
    changeViewportInfo: (state, action: PayloadAction<ViewportInfo>) => {
      state.viewportInfo = action.payload;
    },
    changeDigitalTwinToggle: (state, action: PayloadAction<boolean>) => {
      state.digitalTwinToggle = action.payload;
    },
    changeDrawPolygonToggle: (state, action: PayloadAction<boolean>) => {
      state.drawPolygonToggle = action.payload;
    },
    changeBundleResponse: (state, action: PayloadAction<any>) => {
      state.bundleResponse = action.payload;
    },
    changeActiveBundle: (state, action: PayloadAction<any>) => {
      state.activeBundle = action.payload;
    },
    changeLayerZoomLevels: (state, action: PayloadAction<LayerZoomLevels>) => {
      state.layerZoomLevels = action.payload;
    },
    changeAreNoneLayersChecked: (state, action: PayloadAction<boolean>) => {
      state.areNoneLayersChecked = action.payload;
    },
    changeHealthStatusOfVegetationNGRDIParams: (state, action: PayloadAction<HealthStatusOfVegetationParams>) => {
      state[NGRDI] = action.payload;
    },
    changeHealthStatusOfVegetationVARIParams: (state, action: PayloadAction<HealthStatusOfVegetationParams>) => {
      state[VARI] = action.payload;
    },
    changeMapContainerRef: (state, action: PayloadAction<any>) => {
      state.mapContainerRef = action.payload;
    },
    changeSelectedDataset: (state, action: PayloadAction<string>) => {
      state.selectedDataset = action.payload;
    }
  },
  selectors: {
    viewportInfoSelector: (state) => state.viewportInfo,
    digitalTwinToggleSelector: (state) => state.digitalTwinToggle,
    drawPolygonToggleSelector: (state) => state.drawPolygonToggle,
    bundleResponseSelector: (state) => state.bundleResponse,
    activeBundleSelector: (state) => state.activeBundle,
    layerZoomLevelsSelector: (state) => state.layerZoomLevels,
    areNoneLayersCheckedSelector: (state) => state.areNoneLayersChecked,
    healthStatusOfVegetationNGRDIParamsSelector: (state) => state[NGRDI],
    healthStatusOfVegetationVARIParamsSelector: (state) => state[VARI],
    mapContainerRefSelector: (state) => state.mapContainerRef,
    selectedDatasetSelector: (state) => state.selectedDataset
  }
});

export const uiSliceActions = uiSlice.actions;

export const uiSliceSelectors = uiSlice.selectors;

export default uiSlice.reducer;
