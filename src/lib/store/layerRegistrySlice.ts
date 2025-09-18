import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store"; // Import RootState type

export const layerRegistrySliceName = "layerRegistry";

interface LayerEntryRegistryState {
  layerName: string;
  isActive: boolean;
}

interface LayerRegistryState {
  layers: LayerEntryRegistryState[];
}

const initialState: LayerRegistryState = {
  layers: []
};

const layerRegistrySlice = createSlice({
  name: layerRegistrySliceName,
  initialState,
  reducers: {
    resetLayerRegistry: () => initialState,
    registerLayer: (state, action: PayloadAction<{ layerName: string; }>) => {
      const { layerName } = action.payload;
      state.layers = [{ layerName, isActive: false }, ...state.layers];
    },
    updateLayerStatus: (state, action: PayloadAction<{ layerName: string; isActive: boolean }>) => {
      const { layerName, isActive } = action.payload;
      const layerFound = state.layers.find(layer => layer.layerName === layerName);
      if (layerFound) {
        layerFound.isActive = isActive;
      }
    },
    deactivateAllLayers: (state) => {
      state.layers.forEach((layer) => {
        layer.isActive = false;
      });
    },
    resetLayerState: (state) => {
      state.layers = [];
    },
    resetAllLayers: (state) => {
      Object.keys(state.layers).forEach((layerName) => {
        state.layers[layerName].isActive = false;
      });
    }
  },
  selectors: {
    layersSelector: (state) => state.layers
  }
});

const activeLayersSelector = createSelector(
  [(state: RootState) => state.layerRegistry.layers],
  (layers) => layers.filter((layer) => layer.isActive)
);

export const layerRegistryActions = layerRegistrySlice.actions;
export const layerRegistrySelectors = {
  ...layerRegistrySlice.selectors,
  activeLayersSelector
};

type ResetLayersResult = Record<string, any>;

type ToggleLayerResult = {
  layerName: string;
  layer: any;
};

export const resetAllLayersAsync = createAsyncThunk<ResetLayersResult>(
  "layerRegistry/resetAllLayersAsync",
  async (_, { dispatch, getState }: any) => {
    dispatch(layerRegistryActions.resetAllLayers());
    return getState()[layerRegistrySliceName].layers;
  }
);

export const toggleLayerAsync = createAsyncThunk<ToggleLayerResult>(
  "layerRegistry/toggleLayerAsync",
  async (layerName, { dispatch, getState }: any) => {
    const layer = getState()[layerRegistrySliceName].layers.find(layer => layer.layerName === layerName);
    const isActive = layer?.isActive || false;

    dispatch(layerRegistryActions.updateLayerStatus({
      layerName: layerName as unknown as string,
      isActive: !isActive
    }));

    return getState()[layerRegistrySliceName].layers;
  }
);

export default layerRegistrySlice.reducer;
